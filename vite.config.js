import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import fs from 'fs'
import path from 'path'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig(({ mode }) => {
  return {
    build: {
      outDir: mode === 'public' ? 'vrx/public' : 'vrx/private',
    },
    optimizeDeps: {
      exclude: ['@ffmpeg/core', '@ffmpeg/ffmpeg', '@ffmpeg/util'],
    },
    worker: {
      format: 'es',
    },
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: 'node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js',
            dest: 'assets/ffmpeg',
          },
          {
            src: 'node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm',
            dest: 'assets/ffmpeg',
          },
        ],
      }),
    ],
    ...(isDev && {
      server: {
        host: true,
        port: 4443,
        https: {
          key: fs.readFileSync(path.resolve(__dirname, 'server-key.pem')),
          cert: fs.readFileSync(path.resolve(__dirname, 'server-cert.pem')),
        },
        hmr: {
          protocol: 'wss',
          host: 'fpv',
          port: 4443,
          clientPort: 4443,
        },
      },
    }),
  }
})
