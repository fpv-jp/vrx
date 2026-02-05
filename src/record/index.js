import Alpine from 'alpinejs'
import StreamHandler, { PostMessageType } from '../stream/handler.js'

let recordWorker = null

// stream-processor.js から届いた VideoFrame をルーティング
StreamHandler.addEventListener('message', ({ data }) => {
  if (data.type !== PostMessageType.RecordFrame) return

  if (!recordWorker) {
    data.frame.close()
    return
  }

  const hudCanvas = document.getElementById('HeadUpDisplay')
  createImageBitmap(hudCanvas)
    .then((hudBitmap) => {
      recordWorker.postMessage(
        { type: 'Frame', videoFrame: data.frame, hudBitmap },
        [data.frame, hudBitmap],
      )
    })
    .catch(() => data.frame.close())
})

export function startRecording() {
  if (recordWorker) return

  recordWorker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })

  recordWorker.onmessage = ({ data }) => {
    if (data.type !== 'Done') return
    const blob = new Blob([data.buffer], { type: 'video/mp4' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fpv-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.mp4`
    a.click()
    URL.revokeObjectURL(url)
    recordWorker.terminate()
    recordWorker = null
    Alpine.store('menu').recording = false
  }

  recordWorker.postMessage({ type: 'Start' })
  StreamHandler.postMessage({ type: PostMessageType.StartRecord })
  Alpine.store('menu').recording = true
}

export function stopRecording() {
  if (!recordWorker) return
  StreamHandler.postMessage({ type: PostMessageType.StopRecord })
  recordWorker.postMessage({ type: 'Stop' })
}
