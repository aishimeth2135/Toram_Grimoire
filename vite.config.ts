import content from '@originjs/vite-plugin-content'
import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import eslintPlugin from 'vite-plugin-eslint'
import { createHtmlPlugin } from 'vite-plugin-html'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const useLagacy = false

  const useExternal = mode === 'production'
  const base = '/'
  const plugins = [
    vue(),
    vueJsx(),
    VitePWA({
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png',
      ],
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
      entry: '/src/main.ts',
      template: 'src/index.html',
      inject: {
        data: {
          envBaseUrl: base,
          externalScripts: !useExternal
            ? ''
            : '<script defer src="https://polyfill.io/v3/polyfill.min.js"></script>',
        },
      },
    }),
    content(),
    eslintPlugin(),
  ]

  if (useLagacy) {
    const packageJsonBuffer = fs.readFileSync('package.json')
    const packageJson = JSON.parse(packageJsonBuffer.toString())
    const browserslist = packageJson.browserslist

    plugins.push(
      legacy({
        targets: browserslist,
      })
    )
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
      chunkSizeWarningLimit: 900,
      target: 'ios11',
      minify: 'terser',
      // cssCodeSplit: false,
    },
    plugins,
  }
})

function getPWAManifestConfig() {
  return {
    short_name: 'Grimoire',
    name: 'Toram Grimoire',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    start_url: './?source=pwa',
    background_color: '#FFD1EA',
    display: 'standalone',
    theme_color: '#FFD1EA',
    description: 'The web tool of "Toram Online".',
  }
}
