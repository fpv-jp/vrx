// FlyingObject(SearchRadar)
// --------------------------------------------------------------------------------------------
class FlyingObject {
  constructor(radius) {
    this.radius = radius
    this.reset()
  }

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

  update() {
    this.x += this.speedX
    this.y += this.speedY
  }

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

// SearchRadar
// --------------------------------------------------------------------------------------------
export default class SearchRadar {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.ctx.imageSmoothingEnabled = true

    this.angle = 0
    this.aircrafts = []

    this.resizeCanvas(300)

    for (let i = 0; i < 10; i++) {
      this.aircrafts.push(new FlyingObject(this.radius))
    }

    this.animationId = null
  }

  resizeCanvas(radius, devicePixelRatio) {
    this.radius = radius
    let size = radius * 2.25
    this.center = { x: size / 2, y: size / 2 }
    this.canvas.width = size * devicePixelRatio
    this.canvas.height = size * devicePixelRatio
    this.canvas.style.width = `${size}px`
    this.canvas.style.height = `${size}px`
    this.ctx.scale(devicePixelRatio, devicePixelRatio)

    this.gridSize = this.radius / 15
    this.aircrafts.forEach((aircraft) => {
      aircraft.radius = this.radius
    })
  }

  drawBackground() {
    const ctx = this.ctx

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)'
    ctx.lineWidth = 0.25
    ctx.beginPath()

    const verticalCount = Math.ceil(this.canvas.width / this.gridSize)
    for (let i = -verticalCount; i <= verticalCount; i++) {
      const x = this.center.x + i * this.gridSize
      ctx.moveTo(x, 0)
      ctx.lineTo(x, this.canvas.height)
    }

    const horizontalCount = Math.ceil(this.canvas.height / this.gridSize)
    for (let i = -horizontalCount; i <= horizontalCount; i++) {
      const y = this.center.y + i * this.gridSize
      ctx.moveTo(0, y)
      ctx.lineTo(this.canvas.width, y)
    }

    ctx.stroke()

    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)'
    ctx.lineWidth = 0.75
    ctx.beginPath()
    for (let i = 1; i <= 5; i++) {
      const circleRadius = i * 3 * this.gridSize
      ctx.arc(this.center.x, this.center.y, circleRadius, 0, Math.PI * 2)
    }
    ctx.stroke()

    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)'
    ctx.beginPath()
    for (let i = 0; i < 12; i++) {
      const angle = Math.PI * 2 * (i / 12)
      ctx.moveTo(this.center.x, this.center.y)
      ctx.lineTo(this.center.x + Math.cos(angle) * this.radius, this.center.y + Math.sin(angle) * this.radius)
    }
    ctx.stroke()

    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)'
    ctx.lineWidth = 1.25
    ctx.beginPath()
    ctx.moveTo(this.center.x, this.center.y - this.radius)
    ctx.lineTo(this.center.x, this.center.y + this.radius)
    ctx.moveTo(this.center.x - this.radius, this.center.y)
    ctx.lineTo(this.center.x + this.radius, this.center.y)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(0, 255, 0, 0.7)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '10px Arial'

    const tickLength = 10
    const labelRadius = this.radius + 20

    for (let deg = 0; deg < 360; deg++) {
      const angle = (deg * Math.PI) / 180 - Math.PI / 2
      const isMajorTick = deg % 10 === 0

      if (isMajorTick) {
        ctx.lineWidth = deg % 30 === 0 ? 2 : 1
        const startRadius = deg % 30 === 0 ? this.radius - 5 : this.radius - 3

        ctx.beginPath()
        ctx.moveTo(this.center.x + Math.cos(angle) * startRadius, this.center.y + Math.sin(angle) * startRadius)
        ctx.lineTo(this.center.x + Math.cos(angle) * (this.radius + tickLength), this.center.y + Math.sin(angle) * (this.radius + tickLength))
        ctx.stroke()

        if (deg % 10 === 0) {
          ctx.fillStyle = 'rgba(0, 255, 0, 0.9)'
          ctx.fillText(deg.toString(), this.center.x + Math.cos(angle) * labelRadius, this.center.y + Math.sin(angle) * labelRadius)
        }
      } else {
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(this.center.x + Math.cos(angle) * this.radius, this.center.y + Math.sin(angle) * this.radius)
        ctx.lineTo(this.center.x + Math.cos(angle) * (this.radius + tickLength / 2), this.center.y + Math.sin(angle) * (this.radius + tickLength / 2))
        ctx.stroke()
      }
    }

    ctx.fillStyle = 'rgba(0, 255, 0, 1)'
    ctx.font = 'bold 12px Arial'
    for (let i = 1; i <= 5; i++) {
      const label = i * 100
      const radiusPos = i * 3 * this.gridSize
      ctx.fillText(label.toString(), this.center.x + radiusPos, this.center.y + 10)
      ctx.fillText(label.toString(), this.center.x - radiusPos, this.center.y + 10)
    }
  }

  drawScanner() {
    const ctx = this.ctx

    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(this.center.x, this.center.y)
    ctx.lineTo(this.center.x + Math.cos(this.angle) * this.radius, this.center.y + Math.sin(this.angle) * this.radius)
    ctx.stroke()

    const gradient = ctx.createRadialGradient(this.center.x, this.center.y, 0, this.center.x, this.center.y, this.radius)
    gradient.addColorStop(0, 'rgba(0, 255, 0, 0.2)')
    gradient.addColorStop(1, 'rgba(0, 255, 0, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.moveTo(this.center.x, this.center.y)
    ctx.arc(this.center.x, this.center.y, this.radius, this.angle - 0.2, this.angle, false)
    ctx.closePath()
    ctx.fill()
  }

  drawAircrafts() {
    for (const aircraft of this.aircrafts) {
      aircraft.update()
      aircraft.draw(this.ctx, this.center.x, this.center.y, this.angle, this.radius)
    }
  }

  draw() {
    this.drawBackground()
    this.drawScanner()
    this.drawAircrafts()

    this.angle += 0.02
    if (this.angle > Math.PI * 2) {
      this.angle = 0
    }

    this.animationId = requestAnimationFrame(() => this.draw())
  }

  start() {
    if (!this.animationId) {
      this.draw()
    }
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }
}
