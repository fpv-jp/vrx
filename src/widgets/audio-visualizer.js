/**
 * canvas に接続された音声ストリームをリアルタイムで可視化するファクトリ関数
 * 周波数バーと波形をオーバーレイ表示する
 * @param {HTMLCanvasElement} canvas
 * @param {MediaStream} stream
 * @returns {{ resizeCanvas: Function, setColor: Function, setFont: Function, start: Function, stop: Function, clear: Function, text: Function }}
 */
export default (canvas, stream) => {
  let animationId = null
  let audioText = ''
  let width = canvas.width
  let height = canvas.height
  let _r = 0, _g = 255, _b = 0
  let _font = "'Share Tech Mono', monospace"

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  if (!audioCtx) {
    console.warn('Web Audio API is not supported in this browser.')
    return
  }

  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true

  const analyser = audioCtx.createAnalyser()
  analyser.fftSize = 512
  analyser.minDecibels = -140
  analyser.maxDecibels = 0
  analyser.smoothingTimeConstant = 0.8

  const source = audioCtx.createMediaStreamSource(stream)
  source.connect(analyser)

  const bufferLength = analyser.frequencyBinCount
  const freqs = new Uint8Array(bufferLength)
  const times = new Uint8Array(bufferLength)

  // barWidth はリサイズ時のみ変化するのでキャッシュ
  let barWidth = width / bufferLength

  /** 1フレームの周波数バー・波形を描画して次フレームをリクエストする */
  function draw() {
    analyser.getByteFrequencyData(freqs)
    analyser.getByteTimeDomainData(times)

    ctx.clearRect(0, 0, width, height)

    ctx.font = `12px ${_font}`
    ctx.textBaseline = 'top'
    ctx.fillStyle = `rgba(${_r}, ${_g}, ${_b}, 1)`
    ctx.fillText(audioText, 2, 2)

    ctx.fillStyle = `rgba(${_r}, ${_g}, ${_b}, 0.7)`
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (freqs[i] / 256) * height
      ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight)
    }

    ctx.strokeStyle = `rgba(${_r}, ${_g}, ${_b}, 1)`
    ctx.beginPath()
    ctx.moveTo(0, (times[0] / 128.0 * height) / 2)
    for (let i = 1; i < bufferLength; i++) {
      ctx.lineTo(i * barWidth, (times[i] / 128.0 * height) / 2)
    }
    ctx.stroke()

    animationId = requestAnimationFrame(draw)
  }

  /**
   * canvas のサイズを devicePixelRatio を考慮してリサイズする
   * @param {number} w - 論理幅（px）
   * @param {number} h - 論理高さ（px）
   */
  function resizeCanvas(w, h) {
    let devicePixelRatio = window.devicePixelRatio || 1
    width = w
    height = h
    barWidth = w / bufferLength
    canvas.width = w * devicePixelRatio
    canvas.height = h * devicePixelRatio
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.scale(devicePixelRatio, devicePixelRatio)
  }

  /**
   * オーバーレイに表示するテキストを更新する
   * @param {string} a
   */
  function text(a) {
    audioText = a
    return a
  }

  /** RAF ループを開始して描画を始める */
  function start() {
    if (!animationId) {
      draw()
    }
  }

  /** RAF ループをキャンセルしてトラックを停止する */
  function stop() {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  /** canvas をクリアする */
  function clear() {
    stop()
    ctx.clearRect(0, 0, width, height)
  }

  /**
   * 描画カラーを RGB 値で変更する
   * @param {number} r
   * @param {number} g
   * @param {number} b
   */
  function setColor(r, g, b) { _r = r; _g = g; _b = b }

  /**
   * オーバーレイテキストのフォントを変更する
   * @param {string} f - CSS font-family 文字列
   */
  function setFont(f) { _font = f }

  return { resizeCanvas, text, start, stop, clear, setColor, setFont }
}
