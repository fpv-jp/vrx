import { Muxer, ArrayBufferTarget } from 'mp4-muxer'

let state = 'idle' // 'idle' | 'starting' | 'recording' | 'stopping'
let muxer = null
let encoder = null
let canvas = null
let ctx = null
let frameCount = 0
let startTimestamp = null

self.onmessage = async ({ data }) => {
  switch (data.type) {
    case 'Start':
      state = 'starting'
      frameCount = 0
      startTimestamp = null
      break

    case 'Frame': {
      const { videoFrame, hudBitmap } = data

      if (state === 'idle' || state === 'stopping') {
        videoFrame.close()
        hudBitmap.close()
        break
      }

      const ts = videoFrame.timestamp
      const w = videoFrame.displayWidth
      const h = videoFrame.displayHeight

      if (state === 'starting') {
        canvas = new OffscreenCanvas(w, h)
        ctx = canvas.getContext('2d')
        startTimestamp = ts

        muxer = new Muxer({
          target: new ArrayBufferTarget(),
          video: { codec: 'avc', width: w, height: h },
          fastStart: 'in-memory',
        })

        encoder = new VideoEncoder({
          output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
          error: (e) => console.error('RecordEncoder:', e),
        })
        encoder.configure({
          codec: 'avc1.640028',
          width: w,
          height: h,
          bitrate: 10_000_000,
          framerate: 30,
          latencyMode: 'quality',
        })
        state = 'recording'
      }

      // composite: video + HUD overlay
      ctx.drawImage(videoFrame, 0, 0, canvas.width, canvas.height)
      videoFrame.close()
      ctx.drawImage(hudBitmap, 0, 0, canvas.width, canvas.height)
      hudBitmap.close()

      const frame = new VideoFrame(canvas, { timestamp: ts - startTimestamp })
      encoder.encode(frame, { keyFrame: frameCount % 60 === 0 })
      frame.close()
      frameCount++
      break
    }

    case 'Stop': {
      if (!encoder || state !== 'recording') break
      state = 'stopping'
      await encoder.flush()
      muxer.finalize()
      const buffer = muxer.target.buffer
      self.postMessage({ type: 'Done', buffer }, [buffer])
      encoder.close()
      encoder = null
      muxer = null
      canvas = null
      state = 'idle'
      break
    }
  }
}
