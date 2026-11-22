import ViteYaml from '@modyfi/vite-plugin-yaml'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import fs from 'fs'
import path from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import { type PluginOption, defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import { ManifestOptions, VitePWA } from 'vite-plugin-pwa'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const useExternal = mode === 'production'
  const workersAssets = process.env.WORKERS_STATIC_ASSETS === '1'
  const siteOrigin = workersAssets ? 'https://cy-grimoire.com' : 'https://cy-grimoire.netlify.app'
  const base = '/'
  const plugins: PluginOption[] = [
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
        globIgnores: ['node_modules/**', '_headers', '_redirects'],
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
          siteOrigin,
          externalScripts: !useExternal
            ? ''
            : '<script defer src="https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?version=4.8.0"></script>',
        },
      },
    }),
    ViteYaml(),
    legacy(),
  ]

  if (workersAssets) {
    plugins.push({
      name: 'workers-static-assets',
      writeBundle({ dir }) {
        if (!dir) {
          return
        }
        fs.rmSync(path.join(dir, '_redirects'), { force: true })
        fs.writeFileSync(
          path.join(dir, 'sitemap.xml'),
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteOrigin}/</loc></url></urlset>\n`
        )
        const robotsPath = path.join(dir, 'robots.txt')
        const sitemapDirective = `Sitemap: ${siteOrigin}/sitemap.xml`
        if (!fs.readFileSync(robotsPath, 'utf8').split(/\r?\n/).includes(sitemapDirective)) {
          fs.appendFileSync(robotsPath, `\n${sitemapDirective}\n`)
        }
      },
    })
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
      proxy: {
        '^/public/(skill|stat|glossary|data)/': {
          target: 'https://data.cy-grimoire.com',
          changeOrigin: true,
        },
      },
    },
    build: {
      assetsInlineLimit: 8192,
      chunkSizeWarningLimit: 900,
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
