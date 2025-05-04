export default () => {
  let chunks = []
  let mimeType = null
  let recorder = null

  async function start(stream, codec, videoBitsPerSecond, alpha) {
    mimeType = codec
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      throw new Error(`MIME type ${mimeType} is not supported`)
    }
    chunks = []
    if (alpha) {
      recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond, alpha })
    } else {
      recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond })
    }
    recorder.ondataavailable = ({ data }) => {
      if (data && data.size > 0) chunks.push(data)
    }
    recorder.start()
  }

  function stop() {
    if (recorder?.state === 'recording') recorder.stop()
  }

  function blob() {
    return new Blob(chunks, { type: mimeType })
  }

  return { start, stop, blob }
}

// Supported MediaType
// --------------------------------------------------------------------------------------------
export function SupportedVideoAudioMediaType(
  containerFormats = ['video/mp4', 'video/webm', 'video/x-matroska'], //
  videoCodecs = ['avc1.64003E', 'avc3.64003E', 'h264', 'hev1.1.6.L186', 'hvc1.1.6.L186', 'h265', 'vp9', 'vp8', 'av1'], //
  audioCodecs = ['mp4a.40.2', 'opus'],
) {
  let result = []
  for (const containerFormat of containerFormats) {
    for (const videoCodec of videoCodecs) {
      for (const audioCodec of audioCodecs) {
        let value = `${containerFormat};codecs=${videoCodec},${audioCodec}`
        if (MediaRecorder.isTypeSupported(value)) {
          let container = containerFormat.split('/')[1]
          let video = videoCodec
          let temp = videoCodec.split('.')
          if (temp.length > 1) {
            if (temp[0].startsWith('a')) video = `h264(${temp[0]})`
            if (temp[0].startsWith('h')) video = `h265(${temp[0]})`
          }
          let audio = audioCodec === 'mp4a.40.2' ? 'aac' : audioCodec
          let text = `${container} ${video} ${audio}`
          result.push({ value, text })
        }
      }
    }
  }
  return result
}

// Supported MediaType
// --------------------------------------------------------------------------------------------
export function SupportedVideoMediaType(
  containerFormats = ['video/webm', 'video/mp4', 'video/x-matroska'], //
  videoCodecs = ['vp9', 'vp8', 'av1', 'avc1.64003E', 'avc3.64003E', 'h264', 'hev1.1.6.L186', 'hvc1.1.6.L186', 'h265'],
) {
  let result = []
  for (const containerFormat of containerFormats) {
    for (const videoCodec of videoCodecs) {
      let value = `${containerFormat};codecs=${videoCodec}`
      if (MediaRecorder.isTypeSupported(value)) {
        let container = containerFormat.split('/')[1]
        let video = videoCodec
        let temp = videoCodec.split('.')
        if (temp.length > 1) {
          if (temp[0].startsWith('a')) video = `h264(${temp[0]})`
          if (temp[0].startsWith('h')) video = `h265(${temp[0]})`
        }
        let text = `${container} ${video}`
        result.push({ value, text })
      }
    }
  }
  return result
}

// generateWebP
// --------------------------------------------------------------------------------------------
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export async function generateWebP(recordingOverlayData) {
  const ffmpeg = new FFmpeg()
  const coreURL = await toBlobURL('/assets/ffmpeg/ffmpeg-core.js', 'text/javascript')
  const wasmURL = await toBlobURL('/assets/ffmpeg/ffmpeg-core.wasm', 'application/wasm')
  await ffmpeg.load({ coreURL, wasmURL, log: true })
  for (const f of recordingOverlayData) {
    await ffmpeg.writeFile(f.name, await fetchFile(f.blob))
  }
  await ffmpeg.exec([
    // '-framerate', '60',
    // '-i', 'frame_%05d.png',
    // '-loop', '0',
    // '-c:v', 'libwebp',
    // '-pix_fmt', 'yuva420p',
    // 'output.webp'
    '-framerate',
    '60',
    '-i',
    'frame_%05d.png',
    '-c:v',
    'libvpx-vp9',
    '-pix_fmt',
    'yuva420p',
    '-b:v',
    '2M',
    'output.webm',
  ])
  const data = await ffmpeg.readFile('output.webp')
  return new Blob([data.buffer], { type: 'image/webp' })
}
