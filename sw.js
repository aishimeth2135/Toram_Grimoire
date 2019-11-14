importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

workbox.googleAnalytics.initialize();

workbox.core.setCacheNameDetails({
    prefix: 'cy',
    suffix: 'v1'
});

// papaparse.min.js
workbox.routing.registerRoute(
    /papaparse\.min\.js/,
    workbox.strategies.cacheFirst({
        cacheName: 'js-plugin-cache-papaparse',
        plugins: [
            new workbox.expiration.Plugin({
                maxAgeSeconds: 60 * 60 * 24 * 180, // 180 days
            })
        ]
    })
);

// image
workbox.routing.registerRoute(
    /.*\.(?:png|jpg|jpeg|svg|gif)/,
    workbox.strategies.cacheFirst({
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
    workbox.strategies.cacheFirst({
        cacheName: 'font-cache',
        plugins: [
            new workbox.expiration.Plugin({
                maxAgeSeconds: 60 * 60 * 24 * 180, // 180 days
            })
        ]
    })
);

// google web font
workbox.routing.registerRoute(
    /^https:\/\/fonts\.googleapis\.com/,
    workbox.strategies.cacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
            new workbox.expiration.Plugin({
                maxAgeSeconds: 60 * 60 * 24 * 60, // 60 days
                maxEntries: 10
            })
        ]
    })
);

// google spreadsheets csv
workbox.routing.registerRoute(
    /^https:\/\/docs\.google\.com\/spreadsheets\/.+output\=csv.+/,
    workbox.strategies.staleWhileRevalidate({
        cacheName: 'google-spreadsheets-csv-files',
        plugins: [
            new workbox.cacheableResponse.Plugin({
                headers: {
                    'X-Is-Cacheable': 'true'
                }
            })
        ]
    })
);

workbox.precaching.precacheAndRoute([
  {
    "url": "index.html",
    "revision": "78ea814a9cd8d44d0c3a4c9fe05bb528"
  },
  {
    "url": "dist/damage-calculation.min.js",
    "revision": "1f653c2113d668c37195fe22816318bd"
  },
  {
    "url": "dist/enchant-simulator.min.js",
    "revision": "f040c9619d8648d2e2c10344e6f47e9c"
  },
  {
    "url": "dist/home.min.js",
    "revision": "c7bb29c6d193558acab72d231c1084bc"
  },
  {
    "url": "dist/item-query.min.js",
    "revision": "80a786f2359c13a1058b9b434b1f8ca6"
  },
  {
    "url": "dist/skill-query.min.js",
    "revision": "9561f2405622828698ff9015c1c6dd1d"
  },
  {
    "url": "src/css/CalculationSystem/Damage/main.css",
    "revision": "785484374280e25c5761058855f89135"
  },
  {
    "url": "src/css/EnchantSimulator/main.css",
    "revision": "62fcd95056621fc41b9510231d7c0209"
  },
  {
    "url": "src/css/ItemQuery/main.css",
    "revision": "d7581cd32f73d090adf0ca696ed1e1ca"
  },
  {
    "url": "src/css/ItemQuery/result.css",
    "revision": "906f18a3af2716b0a3da948285f33ac1"
  },
  {
    "url": "src/css/main/Cyteria/Cyteria.css",
    "revision": "ea5b4712bd520173da1bc3a930e30c3d"
  },
  {
    "url": "src/css/main/font/font.css",
    "revision": "02ea2808c1e702e773dca3bc96064996"
  },
  {
    "url": "src/css/main/global.css",
    "revision": "d68ecfa2b1120811f99877af9e39ad97"
  },
  {
    "url": "src/css/main/home.css",
    "revision": "5397d2dd29c152c0120688d362bba01d"
  },
  {
    "url": "src/css/main/main_media.css",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "src/css/main/main.css",
    "revision": "1b7ad41c42524a35ebb068fc467aabf8"
  },
  {
    "url": "src/css/main/Settings/main.css",
    "revision": "8f8aa5bb7735cbff9b2778e38d2a0c5b"
  },
  {
    "url": "src/css/SkillQuery/DrawSkillTree.css",
    "revision": "78a24db3657c93d85c6c4c1f78e6a2d9"
  },
  {
    "url": "src/css/SkillQuery/SkillBranch/animation.css",
    "revision": "648f542093e8d6e455d16c375bdde5cd"
  },
  {
    "url": "src/css/SkillQuery/SkillBranch/SkillBranch.css",
    "revision": "080dcc90f6f5c0078d806ac06de0204f"
  },
  {
    "url": "src/css/SkillQuery/SkillQuery.css",
    "revision": "449aa6d3c15dcbd7775de00bd2cec3f4"
  },
  {
    "url": "src/css/SkillSimulator/main.css",
    "revision": "ecb054febaa998466e9df814f60c8aef"
  },
  {
    "url": "src/css/TagSystem/main.css",
    "revision": "0eee44a7e472b34930051d8d3677b6ac"
  }
]);