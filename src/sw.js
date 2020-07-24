workbox.googleAnalytics.initialize();

workbox.core.setCacheNameDetails({
  prefix: 'cy',
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
// workbox.routing.registerRoute(
//   /^https:\/\/script.google.com\/macros\/s\/AKfycbxGeeJVBuTL23gNtaC489L_rr8GoKfaQHONtl2HQuX0B1lCGbEo\/exec?url=.+/,
//   new workbox.strategies.StaleWhileRevalidate({
//     cacheName: 'app-script--get-csv',
//     plugins: [
//       new workbox.cacheableResponse.Plugin({
//         statuses: [0, 200]
//       })
//     ]
//   })
// );

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

workbox.precaching.precacheAndRoute([], {
  ignoreURLParametersMatching: [/source/, /calculation_data/]
});