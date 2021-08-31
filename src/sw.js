importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-sw.js');

workbox.googleAnalytics.initialize();

workbox.core.setCacheNameDetails({
  prefix: 'toram-grimoire',
  suffix: 'v2'
});

const { registerRoute, NavigationRoute } = workbox.routing;
const { StaleWhileRevalidate, CacheFirst } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { CacheableResponsePlugin } = workbox.cacheableResponse;

const handleCacheName = name => name;

// jsdelivr js
registerRoute(
  /https:\/\/cdn\.jsdelivr\.net\/npm\/.+\.js/,
  new CacheFirst({
    cacheName: handleCacheName('jsdelivr-cache'),
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      })
    ]
  })
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

// google spreadsheets csv
// registerRoute(
//   /^https:\/\/docs\.google\.com\/spreadsheets\/.+output\=csv.+/,
//   new StaleWhileRevalidate({
//     cacheName: 'google-spreadsheets-csv-files',
//     plugins: [
//       new workbox.cacheableResponse.Plugin({
//         statuses: [0, 200]
//       })
//     ]
//   })
// );

{
  const CACHE_NAME = handleCacheName('google-spreadsheets-csv-files');
  const strategy = new StaleWhileRevalidate({
    cacheName: CACHE_NAME,
    plugins: [
      new CacheableResponsePlugin({
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
    /^https:\/\/docs\.google\.com\/spreadsheets\/.+output\=csv.+/,
    handler
  );
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST, {
  ignoreURLParametersMatching: [/source/, /calculation_data/]
});