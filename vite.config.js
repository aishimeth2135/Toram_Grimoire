import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 9039
  },
  resolve: {
    alias: [{
      find: '@',
      replacement: path.join(__dirname, 'src')
    }, {
      find: '@global-components',
      replacement: path.join(__dirname, 'src', 'components', 'global')
    }, {
      find: '@services',
      replacement: path.join(__dirname, 'src', 'lib', 'main', 'services')
    }, {
      find: '@utils',
      replacement: path.join(__dirname, 'src', 'lib', 'main', 'utils')
    }, {
      find: '@grimoire',
      replacement: path.join(__dirname, 'src', 'lib', 'main', 'Grimoire.js')
    }]
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        "short_name": "Grimoire",
        "name": "Toram Grimoire",
        "icons": pwaIcons(),
        "start_url": "./?source=pwa",
        "background_color": "#FFD1EA",
        "display": "standalone",
        "theme_color": "#FFD1EA",
        "description": "一名托蘭小玩家自製的工具。"
      },
      workbox: {
        swSrc: './src/app/sw.js',
        exclude: [/_redirects/]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        interop: 'auto'
      }
    }
  }
})

function pwaIcons() {
  return ['16', '24', '32', '48', '64', '128', '192', '512'].map(size => {
    return {
      src: `/imgs/favicon/favicon${size}.png`,
      type: 'image/png',
      sizes: `${size}x${size}`
    };
  });
}