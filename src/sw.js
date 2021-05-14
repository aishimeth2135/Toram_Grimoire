import * as googleAnalytics from 'workbox-google-analytics';

googleAnalytics.initialize();

import { setCacheNameDetails } from 'workbox-core';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute } from 'workbox-precaching';

setCacheNameDetails({
  prefix: 'toram-grimoire',
  suffix: 'v2',
  googleAnalytics: 'ga',
});

const handleCacheName = name => name;

// font
registerRoute(
  /.*\.(?:ttf|woff|woff2)/,
  new CacheFirst({
    cacheName: handleCacheName('font-cache'),
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 180, // 180 days
      })
    ]
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new StaleWhileRevalidate({
    cacheName: handleCacheName('google-fonts'),
    plugins: [
      new ExpirationPlugin({ maxEntries: 20 }),
    ],
  }),
);

// image
registerRoute(
  /.*\.(?:png|jpg|jpeg|svg|gif)/,
  new CacheFirst({
    cacheName: handleCacheName('image-cache'),
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      })
    ]
  })
);

{
  const CACHE_NAME = handleCacheName('google-spreadsheets-csv-files');
  const strategy = new StaleWhileRevalidate({
    cacheName: CACHE_NAME,
    plugins: [
      new CacheableResponsePlugin.Plugin({
        statuses: [0, 200]
      })
    ]
  });
  const handler = async (params) => {
    try {
      return await strategy.handle(params);
    } catch (e) {
      const url = params.url.href;
      let path = encodeURIComponent(url);
      path = 'https://script.google.com/macros/s/AKfycbxGeeJVBuTL23gNtaC489L_rr8GoKfaQHONtl2HQuX0B1lCGbEo/exec?url=' + path;

      const f = await fetch(path);
      const csvstr = await f.text();

      const req = new Request(url, {
        method: 'GET'
      });

      const res = new Response(csvstr, {
        headers: new Headers({
          'Content-Type': 'text/csv'
        })
      });
      const cacheRes = res.clone();

      caches.open(CACHE_NAME).then(cache => cache.put(req, cacheRes));
      console.log(`[sw] Fetch backup url of "${params.url.href}" successfully.`);

      return res;
    }
  };

  // Register this strategy to handle all navigations.
  registerRoute(
    /^https:\/\/docs\.google\.com\/spreadsheets\/.+output=csv.+/,
    handler
  );
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
// self.__precacheManifest = [].concat(self.__precacheManifest || []);
precacheAndRoute(self.__WB_MANIFEST, {
  ignoreURLParametersMatching: [/source/, /calculation_data/]
});