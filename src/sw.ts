import type { RouteHandler } from 'workbox-core'
import 'workbox-sw'

declare const self: ServiceWorkerGlobalScope

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-sw.js')

workbox.googleAnalytics.initialize()

workbox.core.setCacheNameDetails({
  prefix: 'toram-grimoire',
  suffix: 'v2',
})

const { registerRoute } = workbox.routing
const { StaleWhileRevalidate, CacheFirst } = workbox.strategies
const { ExpirationPlugin } = workbox.expiration
const { CacheableResponsePlugin } = workbox.cacheableResponse

const handleCacheName = (name: string) => name

const daysToSeconds = (day: number) => 60 * 60 * 24 * day

// jsdelivr CDN
registerRoute(
  /https:\/\/cdn\.jsdelivr\.net\/npm\/.+\.js/,
  new CacheFirst({
    cacheName: handleCacheName('jsdelivr-cache'),
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: daysToSeconds(180),
      }),
    ],
  }),
)

// polyfill.io CDN
registerRoute(
  'https://polyfill.io/v3/polyfill.min.js',
  new CacheFirst({
    cacheName: handleCacheName('polyfill-io-cache'),
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: daysToSeconds(30),
      }),
    ],
  }),
)

// iconify
registerRoute(
  /https:\/\/api\.iconify\.design\/(?:[^/.]+)\.json/,
  new CacheFirst({
    cacheName: handleCacheName('iconify-icon-cache'),
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: daysToSeconds(180),
      }),
    ],
  }),
)

// image
registerRoute(
  /.*\.(?:png|jpg|jpeg|svg|gif)/,
  new CacheFirst({
    cacheName: handleCacheName('image-cache'),
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: daysToSeconds(60),
      }),
    ],
  }),
)

// font
registerRoute(
  /.*\.(?:ttf|woff|woff2)/,
  new CacheFirst({
    cacheName: handleCacheName('font-cache'),
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: daysToSeconds(360),
      }),
    ],
  }),
)

{
  const CACHE_NAME = handleCacheName('google-spreadsheets-csv-files')
  const strategy = new StaleWhileRevalidate({
    cacheName: CACHE_NAME,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
  const handler: RouteHandler = async (params) => {
    try {
      return await strategy.handle(params)
    } catch (error) {
      const url = params.url.href
      let path = encodeURIComponent(url)
      path = 'https://script.google.com/macros/s/AKfycbxGeeJVBuTL23gNtaC489L_rr8GoKfaQHONtl2HQuX0B1lCGbEo/exec?url=' + path

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
    /^https:\/\/docs\.google\.com\/spreadsheets\/.+output=csv.+/,
    handler,
  )
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST, {
  ignoreURLParametersMatching: [/source/],
})
