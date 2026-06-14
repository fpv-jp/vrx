import { defineConfig } from 'vite'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const isDev = process.env.NODE_ENV === 'development'

const GCS_BUCKET = 'fpv-japan-pmtiles'
const GCS_SA = 'terraform@fpv-japan.iam.gserviceaccount.com'

// Vite dev server 組み込み GCS プロキシ — 別プロセス不要
function gcsProxyPlugin() {
  let token = null
  let tokenExpiry = 0

  function getToken() {
    if (Date.now() < tokenExpiry) return token
    try {
      token = execSync(`gcloud auth print-access-token --account ${GCS_SA}`, { timeout: 5000 }).toString().trim()
      tokenExpiry = Date.now() + 55 * 60 * 1000
    } catch {
      token = null
    }
    return token
  }

  return {
    name: 'gcs-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/tiles/')) return next()

        const filename = req.url.slice('/tiles/'.length).split('?')[0]
        if (!filename || filename.includes('..') || filename.includes('/')) {
          res.statusCode = 400; res.end('Bad Request'); return
        }

        const headers = { 'User-Agent': 'vrx-dev' }
        const t = getToken()
        if (t) headers['Authorization'] = `Bearer ${t}`
        if (req.headers['range']) headers['Range'] = req.headers['range']

        try {
          const gcsUrl = `https://storage.googleapis.com/${GCS_BUCKET}/${filename}`
          const upstream = await fetch(gcsUrl, { headers })

          res.statusCode = upstream.status
          for (const h of ['content-type', 'content-range', 'accept-ranges', 'content-length']) {
            const v = upstream.headers.get(h)
            if (v) res.setHeader(h, v)
          }
          res.setHeader('Access-Control-Allow-Origin', '*')

          const buf = await upstream.arrayBuffer()
          res.end(Buffer.from(buf))
        } catch (e) {
          res.statusCode = 502; res.end('GCS proxy error')
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  return {
    build: {
      outDir: mode === 'public' ? 'vrx/public' : 'vrx/private',
    },
    optimizeDeps: {
      include: ['maplibre-gl', 'pmtiles'],
    },
    worker: {
      format: 'es',
    },
    ...(isDev && {
      plugins: [gcsProxyPlugin()],
      server: {
        host: true,
        port: 4443,
        https: {
          key: fs.readFileSync(path.resolve(__dirname, 'server-key.pem')),
          cert: fs.readFileSync(path.resolve(__dirname, 'server-cert.pem')),
        },
        hmr: mode === 'private' ? false : {
          protocol: 'wss',
          host: 'fpv',
          port: 4443,
          clientPort: 4443,
        },
      },
    }),
  }
})
