const path = require('path');

module.exports = {
  configureWebpack: {
    devtool: 'cheap-eval-source-map',
    devServer: {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
      },
      port: 9039
    },
    resolve: {
      alias: {
        '@views': path.join(__dirname, 'src', 'views'),
        '@store': path.join(__dirname, 'src', 'store'),
        '@css': path.join(__dirname, 'src', 'assets', 'css'),
        '@lib': path.join(__dirname, 'src', 'lib'),
        '@plugin': path.join(__dirname, 'src', 'plugin'),
        '@global-vue-components': path.join(__dirname, 'src', 'components', 'global'),
        '@vue-components': path.join(__dirname, 'src', 'components'),
        '@Services': path.join(__dirname, 'src', 'lib', 'main', 'services'),
        '@Utils': path.join(__dirname, 'src', 'lib', 'main', 'utils'),
        '@Grimoire': path.join(__dirname, 'src', 'lib', 'main', 'Grimoire.js'),
      }
    }
  },

  pwa: {
    name: 'Toram Grimoire',
    themeColor: '#FFD1EA',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: '#FFD1EA',
    manifestOptions: {
      "short_name": "Grimoire",
      "name": "Toram Grimoire",
      "icons": [{
          "src": "./imgs/favicon/favicon16.png",
          "type": "image/png",
          "sizes": "16x16"
        },
        {
          "src": "./imgs/favicon/favicon24.png",
          "type": "image/png",
          "sizes": "24x24"
        },
        {
          "src": "./imgs/favicon/favicon32.png",
          "type": "image/png",
          "sizes": "32x32"
        },
        {
          "src": "./imgs/favicon/favicon48.png",
          "type": "image/png",
          "sizes": "48x48"
        },
        {
          "src": "./imgs/favicon/favicon64.png",
          "type": "image/png",
          "sizes": "64x64"
        },
        {
          "src": "./imgs/favicon/favicon128.png",
          "type": "image/png",
          "sizes": "128x128"
        },
        {
          "src": "./imgs/favicon/favicon192.png",
          "type": "image/png",
          "sizes": "192x192"
        },
        {
          "src": "./imgs/favicon/favicon512.png",
          "type": "image/png",
          "sizes": "512x512"
        }
      ],
      "start_url": "./?source=pwa",
      "background_color": "#FFD1EA",
      "display": "standalone",
      "theme_color": "#FFD1EA",
      "description": "一名托蘭小玩家自製的工具。"
    },
    iconPaths: {
      favicon32: 'imgs/favicon/favicon32.png',
      favicon16: 'imgs/favicon/favicon16.png',
      appleTouchIcon: 'imgs/favicon/favicon152.png',
      maskIcon: 'imgs/favicon/favicon.svg',
      msTileImage: 'img/favicon/favicon144x144.png'
    },

    // workbox
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/sw.js',
      exclude: [/_redirects/]
    }
  },

  pluginOptions: {
    cordovaPath: 'src-cordova'
  }
}
