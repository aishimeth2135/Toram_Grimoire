/// <reference lib="webworker" />
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { RouteHandler, setCacheNameDetails } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { initialize as googleAnalyticsInitialize } from 'workbox-google-analytics'
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import {
  CacheFirst,
  Strategy,
  StrategyHandler,
  StrategyOptions,
} from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope

googleAnalyticsInitialize()

setCacheNameDetails({
  prefix: 'toram-grimoire',
  suffix: 'v2',
})

// const devMode = true

class StaleWhileRevalidateThrottled extends Strategy {
  _expirationTime: number // seconds

  constructor(options: StrategyOptions, expirationTime: number) {
    super(options)

    this._expirationTime = expirationTime
  }

  /**
   * Only read date of header to check expiration
   * @param response
   */
  private _responseIsFresh(response: Response): boolean {
    const dateHeader = response.headers.get('date')
    const parsedDate = new Date(dateHeader!)
    const headerTime = parsedDate.getTime()
    if (isNaN(headerTime)) {
      return false
    }
    const now = Date.now()
    const remainTime = this._expirationTime * 1000 - (now - headerTime)
    const isFresh = remainTime > 0
    // if (devMode) {
    //   logs.push(`It's ${Math.floor(remainTime / 1000)} seconds before cache expires...`, {
    //     expirationTime: this._expirationTime,
    //     now,
    //     headerTime,
    //   })
    // }
    return isFresh
  }

  override async _handle(
    request: Request,
    handler: StrategyHandler
  ): Promise<Response> {
    // const logs: any[] = []
    let response = await handler.cacheMatch(request)
    if (!response) {
      // logs.push('No response found in cache. Will wait for the network response.')
      response = await handler.fetchAndCachePut(request)
    } else if (!this._responseIsFresh(response)) {
      // logs.push('Found a cached response but cache is expire. Will respond with a cache and update with the network response in the background...')
      handler.fetchAndCachePut(request).catch(() => {
        /* ignore error */
      })
    }
    // if (devMode) {
    //   console.groupCollapsed(`[workbox] Using StaleWhileRevalidateThrottled to respond to ${request.url}`)
    //   logs.forEach(log => console.log(log))
    //   console.log(response)
    //   console.groupEnd()
    // }
    return response
  }
}

const handleCacheName = (name: string) => name

const daysToSeconds = (day: number) => 60 * 60 * 24 * day

// jsdelivr CDN
registerRoute(
  /https:\/\/cdn\.jsdelivr\.net\/npm\/.+\.js/,
  new CacheFirst({
    cacheName: handleCacheName('jsdelivr-cache'),
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: daysToSeconds(180),
      }),
    ],
  })
)

// polyfill.io CDN
registerRoute(
  'https://polyfill.io/v3/polyfill.min.js',
  new CacheFirst({
    cacheName: handleCacheName('polyfill-io-cache'),
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: daysToSeconds(30),
      }),
    ],
  })
)

// iconify
registerRoute(
  /https:\/\/api\.iconify\.design\/(?:[^/.]+)\.json/,
  new CacheFirst({
    cacheName: handleCacheName('iconify-icon-cache'),
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: daysToSeconds(90),
      }),
    ],
  })
)

// image
registerRoute(
  /.*\.(?:png|jpg|jpeg|svg|gif)/,
  new CacheFirst({
    cacheName: handleCacheName('image-cache'),
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: daysToSeconds(90),
      }),
    ],
  })
)

// font
registerRoute(
  /.*\.(?:ttf|woff|woff2)/,
  new CacheFirst({
    cacheName: handleCacheName('font-cache'),
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: daysToSeconds(360),
      }),
    ],
  })
)

{
  const CACHE_NAME = handleCacheName('google-spreadsheets-csv-files')
  const strategy = new StaleWhileRevalidateThrottled(
    {
      cacheName: CACHE_NAME,
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    },
    7200
  )
  const handler: RouteHandler = async params => {
    try {
      return await strategy.handle(params)
    } catch (error) {
      const url = params.url.href
      let path = encodeURIComponent(url)
      path =
        'https://script.google.com/macros/s/AKfycbxGeeJVBuTL23gNtaC489L_rr8GoKfaQHONtl2HQuX0B1lCGbEo/exec?url=' +
        path

      const res = await fetch(path)
      const csvstr = await res.text()

      const req = new Request(url, {
        method: 'GET',
      })

      const newRes = new Response(csvstr, {
        headers: new Headers({
          'Content-Type': 'text/csv',
        }),
      })
      const cacheRes = newRes.clone()

      caches.open(CACHE_NAME).then(cache => cache.put(req, cacheRes))
      console.log(`[sw] Fetch backup url of "${url}" successfully.`)

      return newRes
    }
  }

  // Register this strategy to handle all navigations.
  registerRoute(
    /^https:\/\/docs\.google\.com\/spreadsheets\/.+output=csv.*/,
    handler
  )
}

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

precacheAndRoute(self.__WB_MANIFEST, {
  ignoreURLParametersMatching: [/source/],
})
