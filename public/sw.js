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
    "revision": "bcb8a9430dfbf1865bb6c5a4b93494f7"
  },
  {
    "url": "dist/enchant-simulator.min.js",
    "revision": "d5a1fff93e8fd2b515f49527d38c3841"
  },
  {
    "url": "dist/home.min.js",
    "revision": "caaed476f00475a01b9b8a00fe3700ec"
  },
  {
    "url": "dist/item-query.min.js",
    "revision": "17c2131f6d4a2412c5348e98d1402ba5"
  },
  {
    "url": "dist/skill-query.min.js",
    "revision": "59d59765526860dafec8860283310f60"
  },
  {
    "url": "dist/skill-simulator.min.js",
    "revision": "0090bfefbe46fc8f727def46fa4a7a41"
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