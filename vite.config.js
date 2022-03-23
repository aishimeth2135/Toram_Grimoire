// @ts-check
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createHtmlPlugin } from 'vite-plugin-html'
import { VitePWA } from 'vite-plugin-pwa'
import content from '@originjs/vite-plugin-content'
import eslintPlugin from 'vite-plugin-eslint'
import legacy from '@vitejs/plugin-legacy'

const fs = require('fs')
const path = require('path')

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const useLagacy = false

  const packageJsonBuffer = fs.readFileSync('package.json')
  const packageJson = JSON.parse(packageJsonBuffer.toString())
  const browserslist = packageJson.browserslist

  const useExternal = mode === 'production'
  const base = '/'
  const plugins = [
    vue(),
    VitePWA({
      manifest: getPWAManifestConfig(),
      strategies: 'injectManifest',
      injectManifest: {
        swSrc: './src/sw.ts',
        globIgnores: ['node_modules/**', '_redirects'],
      },
      srcDir: 'src',
      filename: 'sw.ts',
    }),
    createHtmlPlugin({
      minify: true,
      entry: 'src/main.ts',
      template: 'public/index.html',
      inject: {
        data: {
          envBaseUrl: base,
          externalScripts: !useExternal ? '' : '<script defer src="https://polyfill.io/v3/polyfill.min.js"></script>',
        },
      },
    }),
    content(),
    eslintPlugin(),
  ]

  if (useLagacy) {
    plugins.push(legacy({
      targets: browserslist,
    }))
  }

  return {
    base,
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', 'yaml'],
    },
    server: {
      port: 9039,
    },
    build: {
      assetsInlineLimit: 8192,
      chunkSizeWarningLimit: 800,
    },
    plugins,
  }
})

function getPWAManifestConfig() {
  return {
    'short_name': 'Grimoire',
    'name': 'Toram Grimoire',
    'icons': [{
      'src': './imgs/favicon/favicon16.png',
      'type': 'image/png',
      'sizes': '16x16',
    },
    {
      'src': './imgs/favicon/favicon24.png',
      'type': 'image/png',
      'sizes': '24x24',
    },
    {
      'src': './imgs/favicon/favicon32.png',
      'type': 'image/png',
      'sizes': '32x32',
    },
    {
      'src': './imgs/favicon/favicon48.png',
      'type': 'image/png',
      'sizes': '48x48',
    },
    {
      'src': './imgs/favicon/favicon64.png',
      'type': 'image/png',
      'sizes': '64x64',
    },
    {
      'src': './imgs/favicon/favicon128.png',
      'type': 'image/png',
      'sizes': '128x128',
    },
    {
      'src': './imgs/favicon/favicon192.png',
      'type': 'image/png',
      'sizes': '192x192',
    },
    {
      'src': './imgs/favicon/favicon512.png',
      'type': 'image/png',
      'sizes': '512x512',
    },
    ],
    'start_url': './?source=pwa',
    'background_color': '#FFD1EA',
    'display': 'standalone',
    'theme_color': '#FFD1EA',
    'description': '一名托蘭小玩家自製的工具。',
  }
}
