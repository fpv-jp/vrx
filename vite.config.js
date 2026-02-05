import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig(({ mode }) => {
  return {
    build: {
      outDir: mode === 'public' ? 'vrx/public' : 'vrx/private',
    },
    worker: {
      format: 'es',
    },
    ...(isDev && {
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
