export default (canvas, stream) => {
  let animationId = null
  let audioText = ''
  let width = canvas.width
  let height = canvas.height

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

  function draw() {
    analyser.getByteFrequencyData(freqs)
    analyser.getByteTimeDomainData(times)

    ctx.clearRect(0, 0, width, height)

    ctx.font = '14px Arial'
    ctx.fillStyle = 'rgba(0, 255, 0, 1)'
    ctx.fillText(audioText, 5, 15)

    const barWidth = width / bufferLength
    ctx.fillStyle = 'rgba(0, 255, 0, 0.7)'
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (freqs[i] / 256) * height
      const y = height - barHeight
      ctx.fillRect(i * barWidth, y, barWidth, barHeight)
    }

    ctx.strokeStyle = 'rgba(0, 255, 0, 1)'
    ctx.beginPath()
    for (let i = 0; i < bufferLength; i++) {
      const v = times[i] / 128.0
      const y = (v * height) / 2
      const x = i * barWidth
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
    ctx.closePath()

    animationId = requestAnimationFrame(draw)
  }

  function resizeCanvas(_width, _height, _audioText, devicePixelRatio) {
    width = _width
    height = _height
    audioText = _audioText
    canvas.width = _width * devicePixelRatio
    canvas.height = _height * devicePixelRatio
    canvas.style.width = `${_width}px`
    canvas.style.height = `${_height}px`
    ctx.scale(devicePixelRatio, devicePixelRatio)
  }

  function start() {
    if (!animationId) {
      const audio = new Audio()
      audio.srcObject = stream
      audio.muted = true
      audio.play().catch(() => {})
      draw()
    }
  }

  function stop() {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  function clear() {
    stop()
    ctx.clearRect(0, 0, width, height)
  }

  return { resizeCanvas, start, stop, clear }
}
