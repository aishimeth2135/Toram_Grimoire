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

// cloudfront bundle
workbox.routing.registerRoute(
    /^https:\/\/.+\.cloudfront\.net\/bundles\/.+\.css/,
    workbox.strategies.cacheFirst({
        cacheName: 'cloudfront',
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
    "revision": "46919eaa0c10d626135208a406a0f544"
  },
  {
    "url": "dist/damage-calculation.min.js",
    "revision": "74da281213f86f25e1306257692bbe03"
  },
  {
    "url": "dist/enchant-simulator.min.js",
    "revision": "dc99be89ee247852293b4ecad10029b2"
  },
  {
    "url": "dist/home.min.js",
    "revision": "1a979b84f69f3f0fe1bdb846b8ea2ce3"
  },
  {
    "url": "dist/item-query.min.js",
    "revision": "99015f2a2c082dc7455e0aaa09c95b16"
  },
  {
    "url": "dist/skill-query.min.js",
    "revision": "f003bda3dff1fca6c57748d9260060bc"
  }
]);