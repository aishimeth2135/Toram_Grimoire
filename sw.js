importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

workbox.googleAnalytics.initialize();

workbox.core.setCacheNameDetails({
    prefix: 'cy',
    suffix: 'v1'
});

// // html
// workbox.routing.registerRoute(
//     new RegExp('.\/.*.html'),
//     workbox.strategies.networkFirst({
//         cacheName: 'page-html-cache'
//     })
// );

// papaparse.min.js
workbox.routing.registerRoute(
    /papaparse\.min\.js/,
    workbox.strategies.cacheFirst({
        cacheName: 'js-plugin-cache-papaparse',
        plugins: [
            new workbox.expiration.Plugin({
                maxAgeSeconds: 60 * 60 * 24 * 180, // 180 days
            })
        ],
    })
);

// // js
// workbox.routing.registerRoute(
//     /.*\.js/,
//     workbox.strategies.networkFirst({
//         cacheName: 'js-cache',
//     })
// );

// // css
// workbox.routing.registerRoute(
//     /.*\.css/,
//     workbox.strategies.staleWhileRevalidate({
//         cacheName: 'css-cache',
//     })
// );

// image
workbox.routing.registerRoute(
    /.*\.(?:png|jpg|jpeg|svg|gif)/,
    workbox.strategies.cacheFirst({
        cacheName: 'image-cache',
        plugins: [
            new workbox.expiration.Plugin({
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            })
        ],
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
        ],
    })
);

// google web font
workbox.routing.registerRoute(
    /^https:\/\/fonts\.gstatic\.com/,
    workbox.strategies.cacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200],
            }),
            new workbox.expiration.Plugin({
                maxAgeSeconds: 60 * 60 * 24 * 60, // 60 days
                maxEntries: 10
            }),
        ],
    })
);

workbox.precaching.precacheAndRoute([
  {
    "url": "index.html",
    "revision": "c0578e414682be2bd9c0dd3a7467ca50"
  },
  {
    "url": "dist/damage-calculation.min.js",
    "revision": "9a57268c0e745c9dfab382577aaebfb8"
  },
  {
    "url": "dist/enchant-simulator.min.js",
    "revision": "7243f8c5468d6e1410cab88a47d86ebd"
  },
  {
    "url": "dist/home.min.js",
    "revision": "71cd61eadff7bbc713cc2de80bfb4f5c"
  },
  {
    "url": "dist/item-query.min.js",
    "revision": "817c45ca1c2d9b7e9c77f02dcecfe049"
  },
  {
    "url": "dist/skill-query.min.js",
    "revision": "bd70ed8c0ecebdb282b493d1164c33c4"
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
    "revision": "36f747855f6092b862e0fb57d31b03d2"
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