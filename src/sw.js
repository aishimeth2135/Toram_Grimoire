workbox.googleAnalytics.initialize();

workbox.core.setCacheNameDetails({
  prefix: 'toram-grimoire',
  suffix: 'v2'
});

// // image
// workbox.routing.registerRoute(
//   /.*\.(?:png|jpg|jpeg|svg|gif)/,
//   new workbox.strategies.CacheFirst({
//     cacheName: 'image-cache',
//     plugins: [
//       new workbox.expiration.Plugin({
//         maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
//       })
//     ]
//   })
// );

const { registerRoute, NavigationRoute } = workbox.routing;
const { StaleWhileRevalidate, CacheFirst } = workbox.strategies;

const handleCacheName = name => name;

// font
registerRoute(
  /.*\.(?:ttf|woff|woff2)/,
  new CacheFirst({
    cacheName: handleCacheName('font-cache'),
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * 24 * 180, // 180 days
      })
    ]
  })
);

// google spreadsheets csv
// registerRoute(
//   /^https:\/\/docs\.google\.com\/spreadsheets\/.+output\=csv.+/,
//   new StaleWhileRevalidate({
//     cacheName: 'google-spreadsheets-csv-files',
//     plugins: [
//       new workbox.cacheableResponse.Plugin({
//         statuses: [0, 200]
//       })
//     ]
//   })
// );

{
  const CACHE_NAME = handleCacheName('google-spreadsheets-csv-files');
  const strategy = new StaleWhileRevalidate({
    cacheName: CACHE_NAME,
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200]
      })
    ]
  });
  const handler = async (params) => {
    try {
      return await strategy.handle(params);
    } catch (e) {
      const url = params.url.href;
      let path = encodeURIComponent(url);
      path = 'https://script.google.com/macros/s/AKfycbxGeeJVBuTL23gNtaC489L_rr8GoKfaQHONtl2HQuX0B1lCGbEo/exec?url=' + path;

      const f = await fetch(path);
      const csvstr = await f.text();

      const req = new Request(url, {
        method: 'GET'
      });

      const res = new Response(csvstr, {
        headers: new Headers({
          'Content-Type': 'text/csv'
        })
      });
      const cacheRes = res.clone();

      caches.open(CACHE_NAME).then(cache => cache.put(req, cacheRes));
      console.log(`[sw] Fetch backup url of "${params.url.href}" successfully.`);

      return res;
    }
  };

  // Register this strategy to handle all navigations.
  registerRoute(
    /^https:\/\/docs\.google\.com\/spreadsheets\/.+output\=csv.+/,
    handler
  );
}

// // google app script - redirects
// workbox.routing.registerRoute(
//   /^https:\/\/script\.googleusercontent\.com\/macros\/echo\?.+/,
//   new workbox.strategies.StaleWhileRevalidate({
//     cacheName: 'app-script--get-csv',
//     plugins: [
//       new workbox.cacheableResponse.Plugin({
//         statuses: [0, 200]
//       })
//     ]
//   })
// );

// workbox.routing.registerRoute(
//   /^https:\/\/script\.google\.com\/macros\/s\/AKfycbxGeeJVBuTL23gNtaC489L_rr8GoKfaQHONtl2HQuX0B1lCGbEo\/exec\?.+/,
//   new workbox.strategies.StaleWhileRevalidate({
//     cacheName: 'app-script',
//     plugins: [
//       new workbox.cacheableResponse.Plugin({
//         statuses: [0, 302]
//       })
//     ]
//   })
// );

// iconify icons
// workbox.routing.registerRoute(
//   /^https:\/\/api\.iconify\.design/,
//   new workbox.strategies.StaleWhileRevalidate({
//     cacheName: 'iconify-design-icons',
//     plugins: [
//       new workbox.cacheableResponse.Plugin({
//         statuses: [0, 200]
//       }),
//       new workbox.expiration.Plugin({
//         maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
//       })
//     ]
//   })
// );

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {
  ignoreURLParametersMatching: [/source/, /calculation_data/]
});