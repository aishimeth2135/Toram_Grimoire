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
    "url": "dist/character-simulator.min.js",
    "revision": "7113e5298c96483fdcab02c8d7291972"
  },
  {
    "url": "dist/damage-calculation.min.js",
    "revision": "9a503547401a302cfd4fa5e461674875"
  },
  {
    "url": "dist/enchant-simulator.min.js",
    "revision": "cd87d94d3617152d82ae896228f0080b"
  },
  {
    "url": "dist/home.min.js",
    "revision": "98ab2c5ca3112c49c2e15dcd6a21ddd9"
  },
  {
    "url": "dist/item-query.min.js",
    "revision": "6e07a7c3ef3ca7c2c34f853d8a4aab4f"
  },
  {
    "url": "dist/skill-query.min.js",
    "revision": "11c5c88b385d2ed3fc3509783003b128"
  },
  {
    "url": "dist/skill-simulator.min.js",
    "revision": "c0ee48f9794bdcd8c8885bf01ae4040e"
  },
  {
    "url": "character_simulator.html",
    "revision": "9d92e3fab584c63e82a03b226f00d1d3"
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