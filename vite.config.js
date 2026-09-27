import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const markdownAssets = [
  { route: '/assets/markdown/home.md', source: './src/content/home.md' },
  { route: '/assets/markdown/about.md', source: './src/content/about.md' },
  { route: '/assets/markdown/devices.md', source: './src/content/devices.md' },
].map((asset) => ({
  ...asset,
  sourcePath: fileURLToPath(new URL(asset.source, import.meta.url)),
}))

const agentMarkdownAssets = () => [
  {
    name: 'agent-markdown-assets:serve',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          next()
          return
        }

        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
        const asset = markdownAssets.find((item) => item.route === pathname)

        if (!asset) {
          next()
          return
        }

        response.statusCode = 200
        response.setHeader('Content-Type', 'text/markdown; charset=utf-8')
        response.setHeader('Cache-Control', 'no-cache')
        response.end(request.method === 'HEAD' ? undefined : readFileSync(asset.sourcePath, 'utf8'))
      })
    },
  },
  {
    name: 'agent-markdown-assets:build',
    apply: 'build',
    buildStart() {
      for (const asset of markdownAssets) {
        this.emitFile({
          type: 'asset',
          fileName: asset.route.slice(1),
          source: readFileSync(asset.sourcePath, 'utf8'),
        })
      }
    },
  },
]

const configureGiscusThemeHeaders = (server) => {
  server.middlewares.use((request, response, next) => {
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname

    if (/^\/giscus-(?:light|dark)\.css$/.test(pathname)) {
      response.setHeader('Access-Control-Allow-Origin', '*')
      response.setHeader('X-Content-Type-Options', 'nosniff')
    }

    next()
  })
}

const giscusThemeHeaders = () => ({
  name: 'giscus-theme-headers',
  configureServer: configureGiscusThemeHeaders,
  configurePreviewServer: configureGiscusThemeHeaders,
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), ...agentMarkdownAssets(), giscusThemeHeaders()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
