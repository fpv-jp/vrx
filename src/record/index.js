import Alpine from 'alpinejs'
import StreamHandler, { PostMessageType } from '../stream/handler.js'
import { ReceiverState } from '../receiver/index.js'

let isRecording = false
let mediaRecorder = null
let recordCanvas = null
let recordCtx = null
let chunks = []

// NetworkMonitor SVG を定期的にキャンバスへ焼き付けてキャッシュする
let overlayBitmap = null
let overlayDomRect = null
let overlayTimer = null

async function refreshOverlay() {
  const el = document.getElementById('NetworkMonitoring')
  if (!el || el.style.visibility === 'hidden') {
    overlayBitmap = null
    return
  }

  const elRect = el.getBoundingClientRect()
  if (elRect.width === 0 || elRect.height === 0) return

  const buf = document.createElement('canvas')
  buf.width = Math.round(elRect.width)
  buf.height = Math.round(elRect.height)
  const ctx = buf.getContext('2d')

  for (const svg of el.querySelectorAll('svg')) {
    const svgRect = svg.getBoundingClientRect()
    let str = new XMLSerializer().serializeToString(svg)
    // width/height が未設定のときに画像サイズが 0 になるのを防ぐ
    str = str.replace(/<svg([^>]*)>/, (_, attrs) =>
      `<svg${attrs} width="${svgRect.width}" height="${svgRect.height}">`,
    )
    try {
      const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.src = url
      await img.decode()
      ctx.drawImage(img, svgRect.left - elRect.left, svgRect.top - elRect.top, svgRect.width, svgRect.height)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.warn('overlay capture:', e)
    }
  }

  const prev = overlayBitmap
  overlayBitmap = await createImageBitmap(buf)
  overlayDomRect = elRect
  if (prev) prev.close()
}

StreamHandler.addEventListener('message', ({ data }) => {
  if (data.type !== PostMessageType.RecordFrame) return

  const { frame } = data

  if (!isRecording) {
    frame.close()
    return
  }

  const w = frame.displayWidth
  const h = frame.displayHeight

  // 最初のフレームで canvas・MediaRecorder を初期化
  if (!recordCanvas) {
    recordCanvas = document.createElement('canvas')
    recordCanvas.width = w
    recordCanvas.height = h
    recordCtx = recordCanvas.getContext('2d')

    const stream = new MediaStream()

    // 映像トラック
    for (const t of recordCanvas.captureStream(30).getVideoTracks()) stream.addTrack(t)

    // 音声トラック（WebRTC から）
    const audioSrc = ReceiverState.audio?.srcObject
    if (audioSrc) {
      for (const t of audioSrc.getAudioTracks()) stream.addTrack(t)
    }

    const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
      .find((m) => MediaRecorder.isTypeSupported(m)) ?? 'video/webm'

    mediaRecorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 10_000_000 })

    mediaRecorder.ondataavailable = ({ data }) => {
      if (data.size > 0) chunks.push(data)
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fpv-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
      a.click()
      URL.revokeObjectURL(url)
      recordCanvas = null
      recordCtx = null
      chunks = []
      mediaRecorder = null
      Alpine.store('menu').recording = false
    }

    mediaRecorder.start()

    // NetworkMonitor SVG のキャプチャを開始（200ms ごとに更新）
    refreshOverlay()
    overlayTimer = setInterval(refreshOverlay, 200)
  } else if (recordCanvas.width !== w || recordCanvas.height !== h) {
    recordCanvas.width = w
    recordCanvas.height = h
  }

  // 1. 映像フレーム
  recordCtx.drawImage(frame, 0, 0, w, h)
  frame.close()

  // DOM 座標 → 映像ピクセル座標への変換スケール
  const videoEl = document.getElementById('RemoteVideo')
  const videoRect = videoEl.getBoundingClientRect()
  const scaleX = videoRect.width > 0 ? w / videoRect.width : 1
  const scaleY = videoRect.height > 0 ? h / videoRect.height : 1

  const drawOverElement = (el, { alpha, filter } = {}) => {
    if (!el || el.style.visibility === 'hidden') return
    const r = el.getBoundingClientRect()
    const prevAlpha = recordCtx.globalAlpha
    const prevFilter = recordCtx.filter
    if (alpha !== undefined) recordCtx.globalAlpha = alpha
    if (filter) recordCtx.filter = filter
    recordCtx.drawImage(
      el,
      (r.left - videoRect.left) * scaleX,
      (r.top - videoRect.top) * scaleY,
      r.width * scaleX,
      r.height * scaleY,
    )
    recordCtx.globalAlpha = prevAlpha
    recordCtx.filter = prevFilter
  }

  // 2. HUD
  drawOverElement(document.getElementById('HeadUpDisplay'))

  // 3. Aircraft（img: CSS opacity / filter を手動適用）
  const aircraft = document.getElementById('Aircraft')
  if (aircraft) {
    const cs = window.getComputedStyle(aircraft)
    drawOverElement(aircraft, { alpha: parseFloat(cs.opacity) || 1, filter: cs.filter || 'none' })
  }

  // 4. AudioVisualizer
  drawOverElement(document.getElementById('AudioVisualizer'))

  // 5. NetworkMonitor（キャッシュ済み SVG ビットマップ）
  if (overlayBitmap && overlayDomRect) {
    recordCtx.drawImage(
      overlayBitmap,
      (overlayDomRect.left - videoRect.left) * scaleX,
      (overlayDomRect.top - videoRect.top) * scaleY,
      overlayDomRect.width * scaleX,
      overlayDomRect.height * scaleY,
    )
  }
})

/**
 * 録画を開始する
 * 最初の VideoFrame 受信時に canvas・MediaRecorder を初期化する
 */
export function startRecording() {
  if (isRecording) return
  isRecording = true
  chunks = []
  StreamHandler.postMessage({ type: PostMessageType.StartRecord })
  Alpine.store('menu').recording = true
}

/**
 * 録画を停止して WebM ファイルをダウンロードする
 */
export function stopRecording() {
  if (!isRecording) return
  isRecording = false
  StreamHandler.postMessage({ type: PostMessageType.StopRecord })
  clearInterval(overlayTimer)
  overlayTimer = null
  if (overlayBitmap) { overlayBitmap.close(); overlayBitmap = null }
  if (mediaRecorder?.state === 'recording') mediaRecorder.stop()
}
