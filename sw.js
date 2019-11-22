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
    "revision": "9e5854914126a3016cfe67eb0243cb12"
  },
  {
    "url": "dist/enchant-simulator.min.js",
    "revision": "ce2933da04136919894a8b3543db23cf"
  },
  {
    "url": "dist/home.min.js",
    "revision": "c229e53e5347573c26cb3ffa083070e5"
  },
  {
    "url": "dist/item-query.min.js",
    "revision": "b50cc44176548fc4eb7de49b2dec15db"
  },
  {
    "url": "dist/skill-query.min.js",
    "revision": "4a9f5238d8cf05b38c1cb509a48f40c1"
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
    "revision": "00d35f294d4310fc1dfcbcc046fe3a01"
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
    "revision": "717aa72d9087ff1f1085812759096a3e"
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