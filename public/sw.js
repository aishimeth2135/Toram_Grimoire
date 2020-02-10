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
    "url": "dist/damage-calculation.min.js",
    "revision": "c6ade6cbe9c3cbf0fef0a0e5ddb4b73d"
  },
  {
    "url": "dist/enchant-simulator.min.js",
    "revision": "57a54ba64dd3b11b95585d314515b6b7"
  },
  {
    "url": "dist/home.min.js",
    "revision": "01e37a50d5b2cd2cea1e2829d7e8494c"
  },
  {
    "url": "dist/item-query.min.js",
    "revision": "a03124bd3594640d28e4d8b06b710981"
  },
  {
    "url": "dist/skill-query.min.js",
    "revision": "1759b058d774af7a456474e4335a4e5e"
  },
  {
    "url": "dist/skill-simulator.min.js",
    "revision": "d235af370d9e25aa78edbfe2f04aa5da"
  },
  {
    "url": "damage_calculation.html",
    "revision": "69850144278c6dbe046f259bf9a4b3fc"
  },
  {
    "url": "enchant_simulator.html",
    "revision": "f9caf56fcec85aaef07fdbf43e65a17f"
  },
  {
    "url": "index.html",
    "revision": "6821059592f6594e769d491d6cf92634"
  },
  {
    "url": "items.html",
    "revision": "ccd928e3948e135a3cabfeac5c110d2e"
  },
  {
    "url": "skill_simulator.html",
    "revision": "6af5629bfd0480b9aeac2ac8398807e9"
  },
  {
    "url": "skills.html",
    "revision": "2635468fadf21e700a8774f64c6e2bbb"
  },
  {
    "url": "manifest.json",
    "revision": "b46b362285c754e8d08c068f544adb21"
  }
], {
    ignoreURLParametersMatching: [/source/, /calculation_data/]
});