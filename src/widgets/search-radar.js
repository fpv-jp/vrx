// FlyingObject
// --------------------------------------------------------------------------------------------
class FlyingObject {
  constructor(radius) {
    this.radius = radius
    this.reset()
  }

  // reset
  // ---------------------------
  reset() {
    const startAngle = Math.random() * Math.PI * 2
    const endAngle = startAngle + Math.PI + (Math.random() - 1)

    const startDist = this.radius + 60 + Math.random() * 40
    const endDist = this.radius + 60 + Math.random() * 40

    this.x = Math.cos(startAngle) * startDist
    this.y = Math.sin(startAngle) * startDist
    const endX = Math.cos(endAngle) * endDist
    const endY = Math.sin(endAngle) * endDist

    const dx = endX - this.x
    const dy = endY - this.y
    const len = Math.sqrt(dx * dx + dy * dy)
    // const speed = 1 + Math.random() * 1.5
    const speed = 0.25 + Math.random()

    this.speedX = (dx / len) * speed
    this.speedY = (dy / len) * speed
  }

  // update
  // ---------------------------
  update() {
    this.x += this.speedX
    this.y += this.speedY
  }

  // draw
  // ---------------------------
  draw(ctx, centerX, centerY, radarAngle, radius) {
    const dist = Math.sqrt(this.x * this.x + this.y * this.y)
    if (dist <= radius) {
      const opacity = 1 - dist / radius
      ctx.beginPath()
      ctx.fillStyle = `rgba(0, 255, 0, ${opacity.toFixed(2)})`
      ctx.arc(centerX + this.x, centerY + this.y, 3, 0, Math.PI * 2)
      ctx.fill()

      const aircraftAngle = Math.atan2(this.y, this.x)
      const diff = Math.abs(aircraftAngle - radarAngle)
      if (diff < 0.2 || Math.abs(diff - Math.PI * 2) < 0.2) {
        ctx.beginPath()
        ctx.arc(centerX + this.x, centerY + this.y, 6, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0, 255, 0, ${opacity.toFixed(2)})`
        ctx.stroke()
      }
    }

    if (dist > radius * 2) {
      this.reset()
    }
  }
}

// SearchRadar --------------------------------------------------------------------------------------------
export default (map) => {
  const state = {
    canvas: map,
    ctx: map.getContext('2d', { alpha: true }),

    width: 675,
    height: 675,
    center: { x: 675 / 2, y: 675 / 2 },

    logicalWidth: 1350,
    logicalHeight: 1350,
    logicalCenter: { x: 1350 / 2, y: 1350 / 2 },

    radius: 300,
    angle: 0,
    gridSize: 20,

    aircrafts: [],

    animationId: null,
    scannerGradient: null,  // createRadialGradient キャッシュ
  }

  const SearchRadar = {
    // drawBackground
    // ---------------------------
    drawBackground(ctx) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, state.width, state.height)

      // グリッド線
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)'
      ctx.lineWidth = 0.25
      ctx.beginPath()

      const verticalCount = Math.ceil(state.width / state.gridSize)
      for (let i = -verticalCount; i <= verticalCount; i++) {
        const x = state.center.x + i * state.gridSize
        ctx.moveTo(x, 0)
        ctx.lineTo(x, state.height)
      }

      const horizontalCount = Math.ceil(state.height / state.gridSize)
      for (let i = -horizontalCount; i <= horizontalCount; i++) {
        const y = state.center.y + i * state.gridSize
        ctx.moveTo(0, y)
        ctx.lineTo(state.width, y)
      }

      ctx.stroke()

      // 同心円
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)'
      ctx.lineWidth = 0.75
      ctx.beginPath()
      for (let i = 1; i <= 5; i++) {
        const circleRadius = i * 3 * state.gridSize
        ctx.arc(state.center.x, state.center.y, circleRadius, 0, Math.PI * 2)
      }
      ctx.stroke()

      // 放射状の線
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)'
      ctx.beginPath()
      for (let i = 0; i < 12; i++) {
        const angle = Math.PI * 2 * (i / 12)
        ctx.moveTo(state.center.x, state.center.y)
        ctx.lineTo(state.center.x + Math.cos(angle) * state.radius, state.center.y + Math.sin(angle) * state.radius)
      }
      ctx.stroke()

      // 十字線
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)'
      ctx.lineWidth = 1.25
      ctx.beginPath()
      ctx.moveTo(state.center.x, state.center.y - state.radius)
      ctx.lineTo(state.center.x, state.center.y + state.radius)
      ctx.moveTo(state.center.x - state.radius, state.center.y)
      ctx.lineTo(state.center.x + state.radius, state.center.y)
      ctx.stroke()

      // 目盛り（バッチ描画: 360回の個別stroke → 3回の一括strokeに削減）
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.7)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = '10px Arial'

      const tickLength = 10
      const labelRadius = state.radius + 20

      // 30度ごとの太い目盛り（12本）
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let deg = 0; deg < 360; deg += 30) {
        const angle = (deg * Math.PI) / 180 - Math.PI / 2
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        ctx.moveTo(state.center.x + cos * (state.radius - 5), state.center.y + sin * (state.radius - 5))
        ctx.lineTo(state.center.x + cos * (state.radius + tickLength), state.center.y + sin * (state.radius + tickLength))
      }
      ctx.stroke()

      // 10度ごとの細い目盛り（24本、30の倍数を除く）
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let deg = 10; deg < 360; deg += 10) {
        if (deg % 30 !== 0) {
          const angle = (deg * Math.PI) / 180 - Math.PI / 2
          const cos = Math.cos(angle)
          const sin = Math.sin(angle)
          ctx.moveTo(state.center.x + cos * (state.radius - 3), state.center.y + sin * (state.radius - 3))
          ctx.lineTo(state.center.x + cos * (state.radius + tickLength), state.center.y + sin * (state.radius + tickLength))
        }
      }
      ctx.stroke()

      // 1度ごとの極細目盛り（324本）
      ctx.lineWidth = 0.5
      ctx.beginPath()
      for (let deg = 1; deg < 360; deg++) {
        if (deg % 10 !== 0) {
          const angle = (deg * Math.PI) / 180 - Math.PI / 2
          const cos = Math.cos(angle)
          const sin = Math.sin(angle)
          ctx.moveTo(state.center.x + cos * state.radius, state.center.y + sin * state.radius)
          ctx.lineTo(state.center.x + cos * (state.radius + tickLength / 2), state.center.y + sin * (state.radius + tickLength / 2))
        }
      }
      ctx.stroke()

      // ラベル（10度ごと）
      ctx.fillStyle = 'rgba(0, 255, 0, 0.9)'
      for (let deg = 0; deg < 360; deg += 10) {
        const angle = (deg * Math.PI) / 180 - Math.PI / 2
        ctx.fillText(deg.toString(), state.center.x + Math.cos(angle) * labelRadius, state.center.y + Math.sin(angle) * labelRadius)
      }

      // 距離ラベル
      ctx.fillStyle = 'rgba(0, 255, 0, 1)'
      ctx.font = 'bold 12px Arial'
      for (let i = 1; i <= 5; i++) {
        const label = i * 100
        const radiusPos = i * 3 * state.gridSize
        ctx.fillText(label.toString(), state.center.x + radiusPos, state.center.y + 10)
        ctx.fillText(label.toString(), state.center.x - radiusPos, state.center.y + 10)
      }
    },

    // drawScanner
    // ---------------------------
    drawScanner(ctx) {
      // スキャナー線
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(state.center.x, state.center.y)
      ctx.lineTo(state.center.x + Math.cos(state.angle) * state.radius, state.center.y + Math.sin(state.angle) * state.radius)
      ctx.stroke()

      // グラデーション効果（リサイズ時のみ再生成）
      if (!state.scannerGradient) {
        const gradient = ctx.createRadialGradient(state.center.x, state.center.y, 0, state.center.x, state.center.y, state.radius)
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.2)')
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0)')
        state.scannerGradient = gradient
      }

      ctx.fillStyle = state.scannerGradient
      ctx.beginPath()
      ctx.moveTo(state.center.x, state.center.y)
      ctx.arc(state.center.x, state.center.y, state.radius, state.angle - 0.2, state.angle, false)
      ctx.closePath()
      ctx.fill()
    },

    // drawAircrafts
    // ---------------------------
    drawAircrafts(ctx) {
      for (const aircraft of state.aircrafts) {
        aircraft.update()
        aircraft.draw(ctx, state.center.x, state.center.y, state.angle, state.radius)
      }
    },

    // draw
    // ---------------------------
    draw() {
      this.drawBackground(state.ctx)
      this.drawScanner(state.ctx)
      this.drawAircrafts(state.ctx)

      state.angle += 0.02
      if (state.angle > Math.PI * 2) {
        state.angle = 0
      }
    },

    // resizeCanvas
    // ---------------------------
    resizeCanvas(radius) {
      state.radius = radius
      let width = radius * 2.25
      let height = radius * 2.25

      state.gridSize = radius / 15

      state.width = width
      state.height = height
      state.center = { x: width / 2, y: height / 2 }

      const devicePixelRatio = window.devicePixelRatio || 1

      state.logicalWidth = width * devicePixelRatio
      state.logicalHeight = height * devicePixelRatio
      state.logicalCenter = { x: state.logicalWidth / 2, y: state.logicalHeight / 2 }

      state.canvas.width = state.logicalWidth
      state.canvas.height = state.logicalHeight
      state.canvas.style.width = `${width}px`
      state.canvas.style.height = `${height}px`

      state.ctx.resetTransform()
      state.ctx.scale(devicePixelRatio, devicePixelRatio)

      state.ctx.imageSmoothingEnabled = true

      // グラデーションキャッシュを無効化（中心・半径が変わるため）
      state.scannerGradient = null

      state.aircrafts.forEach((aircraft) => {
        aircraft.radius = state.radius
      })
    },

    // clear
    // ---------------------------
    clear() {
      state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height)
    },

    // start
    // ---------------------------
    start() {
      this.resizeCanvas(window.innerHeight / 3)

      state.aircrafts = []
      for (let i = 0; i < 10; i++) {
        state.aircrafts.push(new FlyingObject(state.radius))
      }
      if (!state.animationId) {
        const loop = () => {
          this.draw()
          state.animationId = requestAnimationFrame(loop)
        }
        loop()
      }
    },

    // stop
    // ---------------------------
    stop() {
      if (state.animationId) {
        cancelAnimationFrame(state.animationId)
        state.animationId = null
      }
    },
  }

  return SearchRadar
}
