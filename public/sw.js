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
    "revision": "2c0126ed8c8d8f663d4179698178a66c"
  },
  {
    "url": "dist/enchant-simulator.min.js",
    "revision": "7f41486259234b7df62fcc47855e6633"
  },
  {
    "url": "dist/home.min.js",
    "revision": "9807e035c62f26ebb9d3d33998665ab8"
  },
  {
    "url": "dist/item-query.min.js",
    "revision": "33404ade4b9e6e31e463cf408a3fe01f"
  },
  {
    "url": "dist/skill-query.min.js",
    "revision": "76a1b6bb74e85fa293b1d3c8442492c1"
  },
  {
    "url": "dist/skill-simulator.min.js",
    "revision": "a2d5053b403f8825f1cfbd02612c54ed"
  },
  {
    "url": "Damage_Calculation.html",
    "revision": "69850144278c6dbe046f259bf9a4b3fc"
  },
  {
    "url": "Enchant_Simulator.html",
    "revision": "f9caf56fcec85aaef07fdbf43e65a17f"
  },
  {
    "url": "index.html",
    "revision": "0c39155d49b99f68bd06283031317403"
  },
  {
    "url": "Items.html",
    "revision": "ccd928e3948e135a3cabfeac5c110d2e"
  },
  {
    "url": "Skill_Simulator.html",
    "revision": "6af5629bfd0480b9aeac2ac8398807e9"
  },
  {
    "url": "Skills.html",
    "revision": "2635468fadf21e700a8774f64c6e2bbb"
  }
]);