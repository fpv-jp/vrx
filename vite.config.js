import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import fs from 'fs'
import path from 'path'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  optimizeDeps: {
    exclude: ['@ffmpeg/core', '@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  worker: {
    format: 'es',
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'favicon.ico', dest: '.' },
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
      https: {
        key: fs.readFileSync(path.resolve(__dirname, 'key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, 'cert.pem')),
      },
      port: 8443,
      host: true,
    },
  }),
})
