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
    "revision": "daa9730295611d9b401f7dd6d8039367"
  },
  {
    "url": "dist/damage-calculation.min.js",
    "revision": "a9a13659b878a16d455bc1b8cae1366b"
  },
  {
    "url": "dist/enchant-simulator.min.js",
    "revision": "68852b4acef3a4c89d4d2d841a9cff31"
  },
  {
    "url": "dist/home.min.js",
    "revision": "e897958dbf22cadc58cf9ce384db3e97"
  },
  {
    "url": "dist/item-query.min.js",
    "revision": "962450c2e288c42550739cb23e5b36e5"
  },
  {
    "url": "dist/skill-query.min.js",
    "revision": "5d90ef17c11fc362ca07e3853b3cd198"
  },
  {
    "url": "src/css/CalculationSystem/Damage/main.css",
    "revision": "f7176ae3c5a3fb9418517893ac6df03b"
  },
  {
    "url": "src/css/EnchantSimulator/main.css",
    "revision": "0cf55804545236184fe140335a3b38c3"
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
    "revision": "681dc830a92bd9b5fd1d1668878e80b6"
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