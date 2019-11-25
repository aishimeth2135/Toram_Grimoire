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
    "revision": "338fd9f6c4faab96dd86cea9ca22b86b"
  },
  {
    "url": "dist/damage-calculation.min.js",
    "revision": "002583f39a4bbe89261b58111939cf81"
  },
  {
    "url": "dist/enchant-simulator.min.js",
    "revision": "f86a66e092a2bffbc1c25f849c82509b"
  },
  {
    "url": "dist/home.min.js",
    "revision": "a5d951a78e0053031058c6f5bcc11818"
  },
  {
    "url": "dist/item-query.min.js",
    "revision": "c2df902732f3f5f517c8ee3ad255e719"
  },
  {
    "url": "dist/skill-query.min.js",
    "revision": "66e2b8caa686e794683656a1ab8808a0"
  },
  {
    "url": "src/css/CalculationSystem/Damage/main.css",
    "revision": "f7176ae3c5a3fb9418517893ac6df03b"
  },
  {
    "url": "src/css/EnchantSimulator/main.css",
    "revision": "3543c0fdea1aa2d96689c900a6297af8"
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
    "revision": "ac0d575489102305e16136eae32a7b3c"
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
    "revision": "94fc62d500c8de01c80582dcf8087d1f"
  },
  {
    "url": "src/css/main/Settings/main.css",
    "revision": "8f8aa5bb7735cbff9b2778e38d2a0c5b"
  },
  {
    "url": "src/css/SkillQuery/DrawSkillTree.css",
    "revision": "edef0e4b0f655a4c19a83e35330339ff"
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
    "revision": "2ff76a5cad369fcd35a0b2581147dcf7"
  },
  {
    "url": "src/css/SkillSimulator/main.css",
    "revision": "ecb054febaa998466e9df814f60c8aef"
  },
  {
    "url": "src/css/TagSystem/main.css",
    "revision": "39d13da833bbe96afe9047b8ad869edb"
  }
]);