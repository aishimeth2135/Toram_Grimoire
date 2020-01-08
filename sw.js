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

// google spreadsheets csv
workbox.routing.registerRoute(
    /^https:\/\/docs\.google\.com\/spreadsheets\/.+output\=csv.+/,
    workbox.strategies.staleWhileRevalidate({
        cacheName: 'google-spreadsheets-csv-files',
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            }),
            new workbox.cacheableResponse.Plugin({
                headers: {
                    'X-Is-Cacheable': 'true'
                }
            })
        ]
    })
);

// iconify icons
workbox.routing.registerRoute(
    /^https:\/\/api\.iconify\.design/,
    workbox.strategies.staleWhileRevalidate({
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

// cdn
workbox.routing.registerRoute(
    /^https:\/\/(?:fonts\.googleapis\.com|code\.iconify\.design)/,
    workbox.strategies.cacheFirst({
        cacheName: 'other-cdn',
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            }),
            new workbox.expiration.Plugin({
                maxAgeSeconds: 60 * 60 * 24 * 60 // 60 days
            })
        ]
    })
);

workbox.precaching.precacheAndRoute([
  {
    "url": "index.html",
    "revision": "004bc6b99cbfde6652c8c57fb585197c"
  },
  {
    "url": "dist/damage-calculation.min.js",
    "revision": "5630d4d763dabebfa198551d93de496d"
  },
  {
    "url": "dist/enchant-simulator.min.js",
    "revision": "53c8cdd56d911defb6ce26192d593057"
  },
  {
    "url": "dist/home.min.js",
    "revision": "7af74b676a2282869ffbbb4cd3b1fad1"
  },
  {
    "url": "dist/item-query.min.js",
    "revision": "9a153a8991e4227985e1ccf87b81584b"
  },
  {
    "url": "dist/skill-query.min.js",
    "revision": "96db9d62ef5df2424d16bd2338db6a5b"
  },
  {
    "url": "src/css/CalculationSystem/Damage/main.css",
    "revision": "007076c671535dd5cf5cf0613efe0356"
  },
  {
    "url": "src/css/EnchantSimulator/main.css",
    "revision": "aadbf8bd6f75934f4bee8f6bab5af115"
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
    "revision": "e437f01ff68987acce5c584f904d06a8"
  },
  {
    "url": "src/css/main/font/font.css",
    "revision": "02ea2808c1e702e773dca3bc96064996"
  },
  {
    "url": "src/css/main/global.css",
    "revision": "7ccd50c02c5a6b42f9f46cff1fd88acd"
  },
  {
    "url": "src/css/main/home.css",
    "revision": "74f04ad389850a30b945ed2ab31d05c2"
  },
  {
    "url": "src/css/main/main_media.css",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "src/css/main/main.css",
    "revision": "c6a792b74c4d203fe0ffb07d21860a26"
  },
  {
    "url": "src/css/main/Settings/main.css",
    "revision": "8f8aa5bb7735cbff9b2778e38d2a0c5b"
  },
  {
    "url": "src/css/SaveLoad/main.css",
    "revision": "593364263594864ca17ff9a02cdacfb3"
  },
  {
    "url": "src/css/SkillQuery/DrawSkillTree.css",
    "revision": "390ddd25c555b52c0a88fcc9f7f9ff7b"
  },
  {
    "url": "src/css/SkillQuery/SkillBranch/animation.css",
    "revision": "648f542093e8d6e455d16c375bdde5cd"
  },
  {
    "url": "src/css/SkillQuery/SkillBranch/SkillBranch.css",
    "revision": "3b19fb2f34e04016dbaee6683858742f"
  },
  {
    "url": "src/css/SkillQuery/SkillQuery.css",
    "revision": "d3dce98840298cb2f1916297730ee6af"
  },
  {
    "url": "src/css/SkillSimulator/main.css",
    "revision": "3f34744a6bc6a23c453d6ea59e9eb3d0"
  },
  {
    "url": "src/css/TagSystem/main.css",
    "revision": "39d13da833bbe96afe9047b8ad869edb"
  }
]);