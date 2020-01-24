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
    "revision": "47e04b155ffa2124705bad9e8b3db1c2"
  },
  {
    "url": "dist/enchant-simulator.min.js",
    "revision": "7933d2b449a0cb56c5f8f5aaaf0bfd38"
  },
  {
    "url": "dist/home.min.js",
    "revision": "e4f5637a286bf94ddaf90806c68c6736"
  },
  {
    "url": "dist/item-query.min.js",
    "revision": "8eafa70a1ddb165cc1b5639e8d7d62b2"
  },
  {
    "url": "dist/skill-query.min.js",
    "revision": "3aa35050901d60f478498ebb13a14089"
  },
  {
    "url": "dist/skill-simulator.min.js",
    "revision": "1bf04d32b00d47c648ce236a15cd5b45"
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