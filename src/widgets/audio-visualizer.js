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

  // draw ------------------------------
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

  // resizeCanvas ------------------------------
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

  // text ------------------------------
  function text(a) {
    audioText = a
    return a
  }

  // start ------------------------------
  function start() {
    if (!animationId) {
      draw()
    }
  }

  // stop ------------------------------
  function stop() {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  // clear ------------------------------
  function clear() {
    stop()
    ctx.clearRect(0, 0, width, height)
  }

  function setColor(r, g, b) { _r = r; _g = g; _b = b }
  function setFont(f) { _font = f }

  return { resizeCanvas, text, start, stop, clear, setColor, setFont }
}
