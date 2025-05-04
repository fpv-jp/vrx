export default (canvas) => {
  const state = {
    canvas,
    ctx: canvas.getContext('2d', { alpha: true }),
    style: {
      lineWidth: 1,
      color: 'rgba(0, 255, 0, 1)',
      font: '18px monospace',
      thickLineWidth: 2,
      thinLineWidth: 1,
    },
    currentDisplayAltitude: 0,
    currentDisplaySpeed: 0,
    width: 640,
    height: 360,
    logicalWidth: 1280,
    logicalHeight: 720,
    center: { x: 640, y: 360 },
    videoText: '',
  }

  const TelemetryOverlay = {
    // update
    // ---------------------------
    update(telemetryData = {}, videoText) {
      state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height)
      state.videoText = videoText
      this.compassDraw(telemetryData.heading ?? 0)
      this.crosshairDraw()
      this.pitchLadderDraw(telemetryData.pitch ?? 0, telemetryData.roll ?? 0)
      this.rollIndicatorDraw(telemetryData.roll ?? 0)
      this.altitudeDraw(telemetryData.altitude ?? 0)
      this.speedDraw(telemetryData.speed ?? 0)
      this.batteryDraw(telemetryData.level ?? 0, telemetryData.charging ?? false)
    },

    // clear
    // ---------------------------
    clear() {
      state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height)
    },

    // resizeCanvas
    // ---------------------------
    resizeCanvas(width, height, devicePixelRatio) {
      state.canvas.width = width * devicePixelRatio
      state.canvas.height = height * devicePixelRatio
      state.canvas.style.width = `${width}px`
      state.canvas.style.height = `${height}px`

      state.ctx.resetTransform()
      state.ctx.scale(devicePixelRatio, devicePixelRatio)

      state.ctx.imageSmoothingEnabled = false
      state.ctx.lineWidth = state.style.lineWidth

      state.width = width
      state.height = height
      state.center = { x: width / 2, y: height / 2 }
    },

    // positionSize
    // ---------------------------
    positionSize(component) {
      switch (component) {
        case 'Compass': {
          state.ctx.font = `900 ${state.style.font}`
          state.ctx.fillStyle = state.style.color
          state.ctx.strokeStyle = state.style.color
          state.ctx.textAlign = 'center'
          state.ctx.textBaseline = 'bottom'
          const width = state.width * (2 / 5)
          const height = state.height / 12
          const center = { x: state.center.x, y: state.center.y / 10 }
          const x = center.x - width / 2
          const y = center.y - height / 2
          return { x, y, center, width, height }
        }
        case 'Crosshair': {
          state.ctx.strokeStyle = state.style.color
          state.ctx.lineWidth = state.style.thickLineWidth
          const width = state.width / 8
          const height = width
          const center = { x: state.center.x, y: state.center.y }
          const x = center.x - width / 2
          const y = center.y - height / 2
          return { x, y, center, width, height }
        }
        case 'PitchLadder': {
          state.ctx.strokeStyle = state.style.color
          state.ctx.fillStyle = state.style.color
          state.ctx.font = state.style.font
          state.ctx.textAlign = 'center'
          state.ctx.textBaseline = 'middle'
          const width = state.width / (7 / 2)
          const height = state.height / (13 / 10)
          const center = { x: state.center.x, y: state.center.y }
          const x = center.x - width / 2
          const y = center.y - height / 2
          return { x, y, center, width, height }
        }
        case 'RollIndicator': {
          state.ctx.strokeStyle = state.style.color
          state.ctx.lineWidth = state.style.thinLineWidth
          const width = state.width / 10
          const height = width
          const center = { x: state.center.x, y: state.center.y }
          const x = center.x - width / 2
          const y = center.y - height / 2
          return { x, y, center, width, height }
        }
        case 'Altitude': {
          state.ctx.strokeStyle = state.style.color
          state.ctx.fillStyle = state.style.color
          state.ctx.font = state.style.font
          state.ctx.textAlign = 'right'
          state.ctx.textBaseline = 'middle'
          const width = state.width / 22
          const height = state.height / (175 / 100)
          const center = { x: (state.center.x + state.width) / 2, y: state.center.y }
          const x = center.x - width / 2
          const y = center.y - height / 2
          return { x, y, center, width, height }
        }
        case 'Speed': {
          state.ctx.strokeStyle = state.style.color
          state.ctx.fillStyle = state.style.color
          state.ctx.font = state.style.font
          state.ctx.textAlign = 'left'
          state.ctx.textBaseline = 'middle'
          const width = state.width / 22
          const height = state.height / (175 / 100)
          const center = { x: state.center.x / 2, y: state.center.y }
          const x = center.x - width / 2
          const y = center.y - height / 2
          return { x, y, center, width, height }
        }
        case 'Battery': {
          const width = state.width / 30
          const height = state.height / 35
          const center = { x: state.width - width, y: height * (125 / 100) }
          const x = center.x - width / 2
          const y = center.y - height / 2
          return { x, y, center, width, height }
        }
      }
    },

    // compassDraw
    // ---------------------------
    compassDraw(heading) {
      const { center, width } = this.positionSize('Compass')

      state.ctx.save()
      try {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
        const tickWidth = width / 8
        const smallTickWidth = width / 24

        const stepSize = width / 360
        const offset = (-stepSize * heading) % width

        const visibleRange = width / 2
        const startIndex = Math.floor((-offset - visibleRange) / tickWidth)
        const endIndex = Math.ceil((-offset + visibleRange) / tickWidth)

        for (let i = startIndex; i <= endIndex; i++) {
          const x = center.x + offset + i * tickWidth
          const dirIndex = ((i % directions.length) + directions.length) % directions.length

          if (x > -tickWidth && x < state.canvas.width + tickWidth) {
            state.ctx.fillText(directions[dirIndex], x, center.y + 20)

            state.ctx.beginPath()
            state.ctx.lineWidth = state.style.thickLineWidth * 1.25
            state.ctx.moveTo(x, center.y + 38)
            state.ctx.lineTo(x, center.y + 25)
            state.ctx.stroke()

            state.ctx.beginPath()
            state.ctx.lineWidth = state.style.thinLineWidth
            for (let j = 1; j <= 2; j++) {
              const smallRight = x + j * smallTickWidth
              if (0 < smallRight && smallRight < state.canvas.width) {
                state.ctx.moveTo(smallRight, center.y + 35)
                state.ctx.lineTo(smallRight, center.y + 25)
              }
              const smallLeft = x - j * smallTickWidth
              if (0 < smallLeft && smallLeft < state.canvas.width) {
                state.ctx.moveTo(smallLeft, center.y + 35)
                state.ctx.lineTo(smallLeft, center.y + 25)
              }
            }
            state.ctx.stroke()
          }
        }

        state.ctx.beginPath()
        state.ctx.moveTo(center.x, center.y + 40)
        state.ctx.lineTo(center.x - 7, center.y + 55)
        state.ctx.lineTo(center.x + 7, center.y + 55)
        state.ctx.closePath()
        state.ctx.fillStyle = 'red'
        state.ctx.fill()
      } finally {
        state.ctx.restore()
      }
    },

    // crosshairDraw
    // ---------------------------
    crosshairDraw() {
      const { center, width } = this.positionSize('Crosshair')

      state.ctx.save()
      try {
        const squareSize = width / 4
        const lineLength = width

        state.ctx.beginPath()
        state.ctx.rect(center.x - squareSize / 2, center.y - squareSize / 2, squareSize, squareSize)
        state.ctx.stroke()

        state.ctx.beginPath()
        state.ctx.moveTo(center.x - squareSize / 2 - lineLength, center.y)
        state.ctx.lineTo(center.x - squareSize / 2, center.y)
        state.ctx.moveTo(center.x + squareSize / 2, center.y)
        state.ctx.lineTo(center.x + squareSize / 2 + lineLength, center.y)
        state.ctx.moveTo(center.x, center.y - squareSize / 2 - lineLength)
        state.ctx.lineTo(center.x, center.y - squareSize / 2)
        state.ctx.moveTo(center.x, center.y + squareSize / 2)
        state.ctx.lineTo(center.x, center.y + squareSize / 2 + lineLength)
        state.ctx.stroke()
      } finally {
        state.ctx.restore()
      }
    },

    // pitchLadderDraw
    // ---------------------------
    pitchLadderDraw(pitch, roll) {
      const { center, width, height } = this.positionSize('PitchLadder')

      state.ctx.save()
      try {
        state.ctx.translate(center.x, center.y)
        state.ctx.rotate((roll * Math.PI) / 180)

        const degreeStep = 15
        const majorLineStep = 30
        const pixelPerDegree = height / 100
        const visibleRange = 45
        const centerPitch = Math.round(pitch / degreeStep) * degreeStep
        const startAngle = Math.max(centerPitch - visibleRange, -180)
        const endAngle = Math.min(centerPitch + visibleRange, 180)
        const centerOffset = (pitch - centerPitch) * pixelPerDegree

        for (let angle = startAngle; angle <= endAngle; angle += degreeStep) {
          const yPos = (angle - centerPitch) * pixelPerDegree - centerOffset

          if (Math.abs(yPos) > center.y + 100) continue

          const isMajorLine = angle % majorLineStep === 0
          state.ctx.lineWidth = isMajorLine ? state.style.thickLineWidth : state.style.thinLineWidth

          const lineLength = width / 2
          state.ctx.beginPath()
          state.ctx.moveTo(-lineLength, yPos)
          state.ctx.lineTo(lineLength, yPos)
          state.ctx.stroke()

          if (angle % degreeStep === 0 && angle !== 0) {
            const text = Math.abs(angle % 360).toString()
            const textWidth = state.ctx.measureText(text).width
            const textPos = width / 3

            state.ctx.textAlign = 'right'
            state.ctx.save()
            state.ctx.globalCompositeOperation = 'destination-out'
            state.ctx.fillRect(-textPos - textWidth - 4, yPos - 12, textWidth + 8, 24)
            state.ctx.restore()
            state.ctx.fillText(text, -textPos, yPos)

            state.ctx.textAlign = 'left'
            state.ctx.save()
            state.ctx.globalCompositeOperation = 'destination-out'
            state.ctx.fillRect(textPos - 4, yPos - 12, textWidth + 8, 24)
            state.ctx.restore()
            state.ctx.fillText(text, textPos, yPos)
          }
        }
      } finally {
        state.ctx.restore()
      }
    },

    // rollIndicatorDraw
    // ---------------------------
    rollIndicatorDraw(roll) {
      const { center, width } = this.positionSize('RollIndicator')
      const radius = width

      state.ctx.save()
      try {
        state.ctx.translate(center.x, center.y)

        state.ctx.beginPath()
        state.ctx.arc(0, 0, radius, 0, Math.PI * 2)
        state.ctx.stroke()

        state.ctx.rotate((roll * Math.PI) / 180)
        state.ctx.beginPath()
        state.ctx.moveTo(0, -radius)
        state.ctx.lineTo(-7, -radius + 14)
        state.ctx.lineTo(7, -radius + 14)
        state.ctx.closePath()
        state.ctx.fillStyle = state.style.color
        state.ctx.fill()
      } finally {
        state.ctx.restore()
      }
    },

    // altitudeDraw
    // ---------------------------
    altitudeDraw(altitude = 0) {
      const { center, width, height } = this.positionSize('Altitude')

      const altitudeLerpFactor = 0.1
      state.currentDisplayAltitude += (altitude - state.currentDisplayAltitude) * altitudeLerpFactor

      state.ctx.save()
      try {
        const tapeWidth = width
        const tapeRight = state.canvas.width < 450 ? width - 20 : center.x + tapeWidth / 2
        const tapeLeft = tapeRight - tapeWidth

        state.ctx.translate(0.5, 0.5)

        const visibleRange = 15
        const altitudeStep = 1
        const centerAltitude = Math.round(state.currentDisplayAltitude / altitudeStep) * altitudeStep
        const altitudeMajorStep = 10

        state.ctx.beginPath()
        for (let alt = centerAltitude - visibleRange; alt <= centerAltitude + visibleRange; alt += altitudeStep) {
          if (alt < 0) continue

          const yPos = center.y - (alt - centerAltitude) * (height / 26)
          if (yPos < -50 || yPos > height * 2) continue

          const isMajorLine = alt % altitudeMajorStep === 0
          state.ctx.lineWidth = isMajorLine ? state.style.thickLineWidth : state.style.thinLineWidth

          state.ctx.moveTo(tapeRight - (isMajorLine ? tapeWidth * 0.9 : tapeWidth / 2), yPos)
          state.ctx.lineTo(tapeRight, yPos)

          if (isMajorLine) {
            state.ctx.fillText(alt.toString(), tapeLeft, yPos)
          }
        }
        state.ctx.stroke()

        const boxHeight = 30
        const boxY = center.y - boxHeight / 2
        state.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        state.ctx.fillRect(tapeLeft - 10, boxY, tapeWidth + 20, boxHeight)

        state.ctx.strokeStyle = state.style.color
        state.ctx.lineWidth = state.style.thickLineWidth
        state.ctx.strokeRect(tapeLeft - 10, boxY, tapeWidth + 20, boxHeight)

        state.ctx.fillStyle = state.style.color
        state.ctx.textAlign = 'left'
        state.ctx.fillText('ALT', tapeRight - tapeWidth, boxY - 15)

        state.ctx.font = 'bold 20px monospace'
        state.ctx.textAlign = 'center'
        state.ctx.fillText(Math.round(state.currentDisplayAltitude).toString(), tapeRight - tapeWidth / 2, center.y)
      } finally {
        state.ctx.restore()
      }
    },

    // speedDraw
    // ---------------------------
    speedDraw(speed = 0) {
      const { center, width, height } = this.positionSize('Speed')

      const speedLerpFactor = 0.1
      state.currentDisplaySpeed += (speed - state.currentDisplaySpeed) * speedLerpFactor

      state.ctx.save()
      try {
        const tapeWidth = width
        const tapeRight = state.canvas.width < 450 ? width - 20 : center.x + tapeWidth / 2
        const tapeLeft = tapeRight - tapeWidth

        state.ctx.translate(0.5, 0.5)

        const visibleRange = 15
        const speedStep = 1
        const centerSpeed = Math.round(state.currentDisplaySpeed / speedStep) * speedStep
        const speedMajorStep = 10

        state.ctx.beginPath()
        for (let spd = centerSpeed - visibleRange; spd <= centerSpeed + visibleRange; spd += speedStep) {
          if (spd < 0) continue

          const yPos = center.y - (spd - centerSpeed) * (height / 26)
          if (yPos < -50 || yPos > height * 2) continue

          const isMajorLine = spd % speedMajorStep === 0
          const isFiveMultiple = spd % 5 === 0
          state.ctx.lineWidth = isMajorLine ? state.style.thickLineWidth : state.style.thinLineWidth

          state.ctx.moveTo(tapeLeft, yPos)
          state.ctx.lineTo(tapeLeft + (isMajorLine ? tapeWidth * 0.9 : tapeWidth / 2), yPos)

          if (isMajorLine || isFiveMultiple) {
            state.ctx.fillText(spd.toString(), tapeRight, yPos)
          }
        }
        state.ctx.stroke()

        const boxHeight = 30
        const boxY = center.y - boxHeight / 2
        state.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        state.ctx.fillRect(tapeLeft - 10, boxY, tapeWidth + 20, boxHeight)

        state.ctx.strokeStyle = state.style.color
        state.ctx.lineWidth = state.style.thickLineWidth
        state.ctx.strokeRect(tapeLeft - 10, boxY, tapeWidth + 20, boxHeight)

        state.ctx.fillStyle = state.style.color
        state.ctx.textAlign = 'right'
        state.ctx.fillText('SPD', tapeRight, boxY - 15)

        state.ctx.font = 'bold 20px monospace'
        state.ctx.textAlign = 'center'
        state.ctx.fillText(Math.round(state.currentDisplaySpeed).toString(), tapeLeft + tapeWidth / 2, center.y)
      } finally {
        state.ctx.restore()
      }
    },

    // batteryDraw
    // ---------------------------
    batteryDraw(level, charging) {
      const { x, y, center, width, height } = this.positionSize('Battery')
      if (Number.isNaN(width) || Number.isNaN(height)) return

      const percentage = Math.floor(level * 100)
      const BORDER_RADIUS = 5
      const TIP_WIDTH = width / 8
      const TIP_HEIGHT = width / 4
      const fillWidth = width * (percentage / 100)

      const colors = charging
        ? ['rgba(0,255,0,1)', 'rgba(0,255,0,1)'] //
        : percentage > 30
          ? ['rgba(76,175,80,0.9)', 'rgba(139,195,74,0.9)']
          : percentage > 10
            ? ['rgba(255,193,7,0.9)', 'rgba(255,235,59,0.9)']
            : ['rgba(244,67,54,0.9)', 'rgba(255,152,0,0.9)']

      state.ctx.save()

      try {
        state.ctx.beginPath()
        state.ctx.roundRect(x, y, width, height, BORDER_RADIUS)
        state.ctx.fillStyle = 'rgba(0,255,0,0.2)'
        state.ctx.fill()
        state.ctx.strokeStyle = 'rgba(255,255,255,1)'
        state.ctx.lineWidth = 2
        state.ctx.stroke()

        state.ctx.beginPath()
        state.ctx.roundRect(x + width, y + (height - TIP_HEIGHT) / 2, TIP_WIDTH, TIP_HEIGHT, 2)
        state.ctx.fillStyle = 'rgba(255,255,255,1)'
        state.ctx.fill()

        state.ctx.beginPath()
        state.ctx.roundRect(x, y, fillWidth, height, 4)
        const gradient = state.ctx.createLinearGradient(x, 0, x + fillWidth, 0)
        gradient.addColorStop(0, colors[0])
        gradient.addColorStop(1, colors[1])
        state.ctx.fillStyle = gradient
        state.ctx.fill()

        if (charging) {
          state.ctx.fillStyle = 'rgba(250,250,0,1)'
          state.ctx.beginPath()
          state.ctx.moveTo(center.x + 7, center.y - 15)
          state.ctx.lineTo(center.x - 10, center.y + 2)
          state.ctx.lineTo(center.x - 1, center.y + 2)
          state.ctx.lineTo(center.x - 7, center.y + 15)
          state.ctx.lineTo(center.x + 10, center.y - 2)
          state.ctx.lineTo(center.x + 1, center.y - 2)
          state.ctx.closePath()
          state.ctx.fill()
        } else {
          state.ctx.fillStyle = 'rgba(255,255,255,1)'
          state.ctx.font = 'bold 12px Arial'
          state.ctx.textAlign = 'center'
          state.ctx.textBaseline = 'middle'
          state.ctx.fillText(`${percentage}%`, x + width / 2, y + height / 2)
        }

        state.ctx.font = '12px Arial'
        state.ctx.fillStyle = 'rgba(0, 255, 0, 1)'
        state.ctx.textAlign = 'right'
        state.ctx.textBaseline = 'top'
        state.ctx.fillText(state.videoText, center.x + width, 0)
      } finally {
        state.ctx.restore()
      }
    },
  }

  return TelemetryOverlay
}
