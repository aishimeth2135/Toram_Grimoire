import ViteYaml from '@modyfi/vite-plugin-yaml'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import fs from 'fs'
import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import { ManifestOptions, VitePWA } from 'vite-plugin-pwa'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const useLagacy = false

  const useExternal = mode === 'production'
  const base = '/'
  const plugins = [
    vue(),
    vueJsx(),
    vueDevTools(),
    tailwindcss(),
    VitePWA({
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
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
            : '<script defer src="https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?version=4.8.0"></script>',
        },
      },
    }),
    ViteYaml(),
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
        '@': fileURLToPath(new URL('./src', import.meta.url)),
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
    },
    plugins,
  }
})

function getPWAManifestConfig(): Partial<ManifestOptions> {
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
