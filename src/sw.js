workbox.googleAnalytics.initialize();

workbox.core.setCacheNameDetails({
  prefix: 'toram-grimoire',
  suffix: 'v2'
});

// // image
// workbox.routing.registerRoute(
//   /.*\.(?:png|jpg|jpeg|svg|gif)/,
//   new workbox.strategies.CacheFirst({
//     cacheName: 'image-cache',
//     plugins: [
//       new workbox.expiration.Plugin({
//         maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
//       })
//     ]
//   })
// );

// font
workbox.routing.registerRoute(
  /.*\.(?:ttf|woff|woff2)/,
  new workbox.strategies.CacheFirst({
    cacheName: 'font-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * 24 * 180, // 180 days
      })
    ]
  })
);

// google spreadsheets csv
workbox.routing.registerRoute(
  /^https:\/\/docs\.google\.com\/spreadsheets\/.+output\=csv.+/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google-spreadsheets-csv-files',
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200]
      })
    ]
  })
);

// google app script
workbox.routing.registerRoute(
  /^https:\/\/script\.googleusercontent\.com\/macros\/echo\?/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'app-script--get-csv',
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200]
      })
    ]
  })
);

// iconify icons
// workbox.routing.registerRoute(
//   /^https:\/\/api\.iconify\.design/,
//   new workbox.strategies.StaleWhileRevalidate({
//     cacheName: 'iconify-design-icons',
//     plugins: [
//       new workbox.cacheableResponse.Plugin({
//         statuses: [0, 200]
//       }),
//       new workbox.expiration.Plugin({
//         maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
//       })
//     ]
//   })
// );

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
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {
  ignoreURLParametersMatching: [/source/, /calculation_data/]
});