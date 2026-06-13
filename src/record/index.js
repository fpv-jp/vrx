import Alpine from 'alpinejs'

let mediaRecorder = null
let chunks = []
let recording = false

/**
 * getDisplayMedia を使って画面録画を開始する
 * ブラウザのダイアログでタブ・ウィンドウ・画面を選択する
 */
export async function startScreenRecording() {
  if (recording) return

  let stream
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true })
  } catch {
    return // ユーザーがキャンセル
  }

  const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
    .find((m) => MediaRecorder.isTypeSupported(m)) ?? 'video/webm'

  mediaRecorder = new MediaRecorder(stream, { mimeType })
  chunks = []

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
    for (const t of stream.getTracks()) t.stop()
    chunks = []
    mediaRecorder = null
    recording = false
    Alpine.store('menu').recording = false
  }

  // ブラウザの「共有を停止」ボタンが押された場合
  stream.getVideoTracks()[0].addEventListener('ended', () => stopScreenRecording())

  mediaRecorder.start()
  recording = true
  Alpine.store('menu').recording = true
}

/**
 * 画面録画を停止して WebM ファイルをダウンロードする
 */
export function stopScreenRecording() {
  if (!recording) return
  recording = false
  if (mediaRecorder?.state === 'recording') mediaRecorder.stop()
}
