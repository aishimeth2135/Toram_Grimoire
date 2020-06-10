importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

workbox.googleAnalytics.initialize();

workbox.core.setCacheNameDetails({
  prefix: 'cy',
  suffix: 'v1'
});

// image
workbox.routing.registerRoute(
  /.*\.(?:png|jpg|jpeg|svg|gif)/,
  new workbox.strategies.CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      })
    ]
  })
);

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

// iconify icons
workbox.routing.registerRoute(
  /^https:\/\/api\.iconify\.design/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'iconify-design-icons',
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200]
      }),
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
      })
    ]
  })
);

workbox.precaching.precacheAndRoute([
  {
    "url": "dist/grimoire.min.js",
    "revision": "2f52a7b7fd127435c214b25945c4f534"
  },
  {
    "url": "manifest.json",
    "revision": "cc069111981904067e94d1ea619c854d"
  }
], {
  ignoreURLParametersMatching: [/source/, /calculation_data/]
});