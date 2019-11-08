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
    "revision": "99f07ffced6ba6088f432df18142166f"
  },
  {
    "url": "dist/enchant-simulator.min.js",
    "revision": "c52f2db3935877756ea44c7c9ffd8101"
  },
  {
    "url": "dist/home.min.js",
    "revision": "49eff9f4a1d00358a4f0a40601d973c4"
  },
  {
    "url": "dist/item-query.min.js",
    "revision": "3df128a3c976ebe43b70d61611565774"
  },
  {
    "url": "dist/skill-query.min.js",
    "revision": "abe6d42eedf0c4483c6ebc2704501679"
  },
  {
    "url": "src/css/CalculationSystem/Damage/main.css",
    "revision": "1bbe73d8026704db5deb0ec18a0d576b"
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
    "revision": "bd09fa9e90ff23466133e4d2073b74b1"
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
    "revision": "23740ab70b94d5984861231527261442"
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
    "revision": "0226337f566a16bf3f4b902c08b7a1da"
  },
  {
    "url": "src/css/SkillQuery/SkillQuery.css",
    "revision": "93a540b01b63537215dc9e894f832e62"
  },
  {
    "url": "src/css/TagSystem/main.css",
    "revision": "0eee44a7e472b34930051d8d3677b6ac"
  }
]);