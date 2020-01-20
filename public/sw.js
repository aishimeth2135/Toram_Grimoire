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
    "revision": "e30c239102bc5e56d223142ad44cc188"
  },
  {
    "url": "dist/enchant-simulator.min.js",
    "revision": "1110e0167982ec2fd7125b545c4cb4ee"
  },
  {
    "url": "dist/home.min.js",
    "revision": "01e37a50d5b2cd2cea1e2829d7e8494c"
  },
  {
    "url": "dist/item-query.min.js",
    "revision": "522f87cbc5bbbdfb134847f5b0c26f5d"
  },
  {
    "url": "dist/skill-query.min.js",
    "revision": "b10a346193e0c786cc4a37f43ac6620a"
  },
  {
    "url": "dist/skill-simulator.min.js",
    "revision": "f0f28e504e3ac127cab74269964c3e40"
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