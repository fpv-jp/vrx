// ===========================
// スタイル設定ヘルパー
// ===========================
const Styles = {
  cyaan: 'rgba(0, 174, 239, 1)',
  magenta: 'rgba(255, 0, 255, 1)',
  yellow: 'rgba(255, 212, 0, 1)',

  green: 'rgba(0, 255, 0, 1)',
  greenAlpha: 'rgba(0, 255, 0, 0.2)',

  black: 'rgba(0, 0, 0, 0.7)',
  blackAlpha: 'rgba(0, 0, 0, 0.3)',

  red: 'red',
  white: 'rgba(255, 255, 255, 1)',
  font: '18px monospace',
  fontBold: 'bold 20px monospace',

  fontSmall: '11px Arial',
  fontSmall2: '11px monospace',

  fontBattery: 'bold 12px Arial',
  fontVideoText: '12px Arial',
  thickLineWidth: 2,
  thinLineWidth: 1,
}

const TelemetryRenderer = {
  // Compass
  // ---------------------------
  Compass(ctx, position, heading, canvasWidth) {
    let { width, center } = position

    // スタイル設定
    ctx.font = `900 ${Styles.font}`
    ctx.fillStyle = Styles.green
    ctx.strokeStyle = Styles.green
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'

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

      if (x > -tickWidth && x < canvasWidth + tickWidth) {
        ctx.fillText(directions[dirIndex], x, center.y + 20)

        ctx.beginPath()
        ctx.lineWidth = Styles.thickLineWidth * 1.25
        ctx.moveTo(x, center.y + 38)
        ctx.lineTo(x, center.y + 25)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineWidth = Styles.thinLineWidth
        for (let j = 1; j <= 2; j++) {
          const smallRight = x + j * smallTickWidth
          if (0 < smallRight && smallRight < canvasWidth) {
            ctx.moveTo(smallRight, center.y + 35)
            ctx.lineTo(smallRight, center.y + 25)
          }
          const smallLeft = x - j * smallTickWidth
          if (0 < smallLeft && smallLeft < canvasWidth) {
            ctx.moveTo(smallLeft, center.y + 35)
            ctx.lineTo(smallLeft, center.y + 25)
          }
        }
        ctx.stroke()
      }
    }

    // Center indicator (red triangle)
    ctx.beginPath()
    ctx.moveTo(center.x, center.y + 40)
    ctx.lineTo(center.x - 7, center.y + 55)
    ctx.lineTo(center.x + 7, center.y + 55)
    ctx.closePath()
    ctx.fillStyle = Styles.red
    ctx.fill()
  },

  // Crosshair
  // ---------------------------
  Crosshair(ctx, position) {
    let { width, center } = position

    // スタイル設定
    ctx.strokeStyle = Styles.green
    ctx.lineWidth = Styles.thickLineWidth

    const squareSize = width / 4
    const lineLength = width

    ctx.beginPath()
    ctx.rect(center.x - squareSize / 2, center.y - squareSize / 2, squareSize, squareSize)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(center.x - squareSize / 2 - lineLength, center.y)
    ctx.lineTo(center.x - squareSize / 2, center.y)
    ctx.moveTo(center.x + squareSize / 2, center.y)
    ctx.lineTo(center.x + squareSize / 2 + lineLength, center.y)
    ctx.moveTo(center.x, center.y - squareSize / 2 - lineLength)
    ctx.lineTo(center.x, center.y - squareSize / 2)
    ctx.moveTo(center.x, center.y + squareSize / 2)
    ctx.lineTo(center.x, center.y + squareSize / 2 + lineLength)
    ctx.stroke()
  },

  // PitchLadder
  // ---------------------------
  PitchLadder(ctx, position, pitch, roll) {
    let { width, height, center } = position

    // スタイル設定
    ctx.strokeStyle = Styles.green
    ctx.fillStyle = Styles.green
    ctx.font = Styles.font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.translate(center.x, center.y)
    ctx.rotate((roll * Math.PI) / 180)

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
      ctx.lineWidth = isMajorLine ? Styles.thickLineWidth : Styles.thinLineWidth

      const lineLength = width / 2
      ctx.beginPath()
      ctx.moveTo(-lineLength, yPos)
      ctx.lineTo(lineLength, yPos)
      ctx.stroke()

      if (angle % degreeStep === 0 && angle !== 0) {
        const text = Math.abs(angle % 360).toString()
        const textWidth = ctx.measureText(text).width
        const textPos = width / 3

        ctx.textAlign = 'right'
        ctx.save()
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillRect(-textPos - textWidth - 4, yPos - 12, textWidth + 8, 24)
        ctx.restore()
        ctx.fillText(text, -textPos, yPos)

        ctx.textAlign = 'left'
        ctx.save()
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillRect(textPos - 4, yPos - 12, textWidth + 8, 24)
        ctx.restore()
        ctx.fillText(text, textPos, yPos)
      }
    }
  },

  // RollIndicator
  // ---------------------------
  RollIndicator(ctx, position, roll) {
    let { width, center } = position

    // スタイル設定
    ctx.strokeStyle = Styles.green
    ctx.lineWidth = Styles.thinLineWidth

    const radius = width

    ctx.translate(center.x, center.y)

    ctx.beginPath()
    ctx.arc(0, 0, radius, 0, Math.PI * 2)
    ctx.stroke()

    ctx.rotate((roll * Math.PI) / 180)
    ctx.beginPath()
    ctx.moveTo(0, -radius)
    ctx.lineTo(-7, -radius + 14)
    ctx.lineTo(7, -radius + 14)
    ctx.closePath()
    ctx.fillStyle = Styles.green
    ctx.fill()
  },

  // Altitude
  // ---------------------------
  Altitude(ctx, position, _altitude, currentDisplayAltitude, canvasWidth) {
    let { width, height, center } = position

    // スタイル設定
    ctx.strokeStyle = Styles.green
    ctx.fillStyle = Styles.green
    ctx.font = Styles.font
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'

    const tapeWidth = width
    const tapeRight = canvasWidth < 450 ? width - 20 : center.x + tapeWidth / 2
    const tapeLeft = tapeRight - tapeWidth

    ctx.translate(0.5, 0.5)

    const visibleRange = 15
    const altitudeStep = 1
    const centerAltitude = Math.round(currentDisplayAltitude / altitudeStep) * altitudeStep
    const altitudeMajorStep = 10

    ctx.beginPath()
    for (let alt = centerAltitude - visibleRange; alt <= centerAltitude + visibleRange; alt += altitudeStep) {
      if (alt < 0) continue

      const yPos = center.y - (alt - centerAltitude) * (height / 26)
      if (yPos < -50 || yPos > height * 2) continue

      const isMajorLine = alt % altitudeMajorStep === 0
      ctx.lineWidth = isMajorLine ? Styles.thickLineWidth : Styles.thinLineWidth

      ctx.moveTo(tapeRight - (isMajorLine ? tapeWidth * 0.9 : tapeWidth / 2), yPos)
      ctx.lineTo(tapeRight, yPos)

      if (isMajorLine) {
        ctx.fillText(alt.toString(), tapeLeft, yPos)
      }
    }
    ctx.stroke()

    // Current altitude box
    const boxHeight = 30
    const boxY = center.y - boxHeight / 2
    ctx.fillStyle = Styles.black
    ctx.fillRect(tapeLeft - 10, boxY, tapeWidth + 20, boxHeight)

    ctx.strokeStyle = Styles.green
    ctx.lineWidth = Styles.thickLineWidth
    ctx.strokeRect(tapeLeft - 10, boxY, tapeWidth + 20, boxHeight)

    ctx.fillStyle = Styles.green
    ctx.textAlign = 'left'
    ctx.fillText('ALT', tapeRight - tapeWidth, boxY - 15)

    ctx.font = Styles.fontBold
    ctx.textAlign = 'center'
    ctx.fillText(Math.round(currentDisplayAltitude).toString(), tapeRight - tapeWidth / 2, center.y)
  },

  // Speed
  // ---------------------------
  Speed(ctx, position, _speed, currentDisplaySpeed, canvasWidth) {
    let { width, height, center } = position

    // スタイル設定
    ctx.strokeStyle = Styles.green
    ctx.fillStyle = Styles.green
    ctx.font = Styles.font
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    const tapeWidth = width
    const tapeRight = canvasWidth < 450 ? width - 20 : center.x + tapeWidth / 2
    const tapeLeft = tapeRight - tapeWidth

    ctx.translate(0.5, 0.5)

    const visibleRange = 15
    const speedStep = 1
    const centerSpeed = Math.round(currentDisplaySpeed / speedStep) * speedStep
    const speedMajorStep = 10

    ctx.beginPath()
    for (let spd = centerSpeed - visibleRange; spd <= centerSpeed + visibleRange; spd += speedStep) {
      if (spd < 0) continue

      const yPos = center.y - (spd - centerSpeed) * (height / 26)
      if (yPos < -50 || yPos > height * 2) continue

      const isMajorLine = spd % speedMajorStep === 0
      const isFiveMultiple = spd % 5 === 0
      ctx.lineWidth = isMajorLine ? Styles.thickLineWidth : Styles.thinLineWidth

      ctx.moveTo(tapeLeft, yPos)
      ctx.lineTo(tapeLeft + (isMajorLine ? tapeWidth * 0.9 : tapeWidth / 2), yPos)

      if (isMajorLine || isFiveMultiple) {
        ctx.fillText(spd.toString(), tapeRight, yPos)
      }
    }
    ctx.stroke()

    // Current speed box
    const boxHeight = 30
    const boxY = center.y - boxHeight / 2
    ctx.fillStyle = Styles.black
    ctx.fillRect(tapeLeft - 10, boxY, tapeWidth + 20, boxHeight)

    ctx.strokeStyle = Styles.green
    ctx.lineWidth = Styles.thickLineWidth
    ctx.strokeRect(tapeLeft - 10, boxY, tapeWidth + 20, boxHeight)

    ctx.fillStyle = Styles.green
    ctx.textAlign = 'right'
    ctx.fillText('SPD', tapeRight, boxY - 15)

    ctx.font = Styles.fontBold
    ctx.textAlign = 'center'
    ctx.fillText(Math.round(currentDisplaySpeed).toString(), tapeLeft + tapeWidth / 2, center.y)
  },

  // Battery
  // ---------------------------
  Battery(ctx, position, level, charging, videoText) {
    let { x, y, width, height, center } = position

    if (Number.isNaN(width) || Number.isNaN(height)) return

    const percentage = Math.floor(level * 100)
    const BORDER_RADIUS = 5
    const TIP_WIDTH = width / 8
    const TIP_HEIGHT = width / 4
    const fillWidth = width * (percentage / 100)

    const colors = charging ? ['rgba(0,255,0,1)', 'rgba(0,255,0,1)'] : percentage > 30 ? ['rgba(76,175,80,0.9)', 'rgba(139,195,74,0.9)'] : percentage > 10 ? ['rgba(255,193,7,0.9)', 'rgba(255,235,59,0.9)'] : ['rgba(244,67,54,0.9)', 'rgba(255,152,0,0.9)']

    // Battery body
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, BORDER_RADIUS)
    ctx.fillStyle = Styles.greenAlpha
    ctx.fill()
    ctx.strokeStyle = Styles.white
    ctx.lineWidth = 2
    ctx.stroke()

    // Battery tip
    ctx.beginPath()
    ctx.roundRect(x + width, y + (height - TIP_HEIGHT) / 2, TIP_WIDTH, TIP_HEIGHT, 2)
    ctx.fillStyle = Styles.white
    ctx.fill()

    // Battery fill
    ctx.beginPath()
    ctx.roundRect(x, y, fillWidth, height, 4)
    const gradient = ctx.createLinearGradient(x, 0, x + fillWidth, 0)
    gradient.addColorStop(0, colors[0])
    gradient.addColorStop(1, colors[1])
    ctx.fillStyle = gradient
    ctx.fill()

    // Charging icon or percentage text
    if (charging) {
      ctx.fillStyle = 'rgba(250,250,0,1)'
      ctx.beginPath()
      ctx.moveTo(center.x + 7, center.y - 15)
      ctx.lineTo(center.x - 10, center.y + 2)
      ctx.lineTo(center.x - 1, center.y + 2)
      ctx.lineTo(center.x - 7, center.y + 15)
      ctx.lineTo(center.x + 10, center.y - 2)
      ctx.lineTo(center.x + 1, center.y - 2)
      ctx.closePath()
      ctx.fill()
    } else {
      ctx.fillStyle = Styles.white
      ctx.font = Styles.fontBattery
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${percentage}%`, x + width / 2, y + height / 2)
    }

    // Video text
    ctx.font = Styles.fontVideoText
    ctx.fillStyle = Styles.green
    ctx.textAlign = 'right'
    ctx.textBaseline = 'top'
    ctx.fillText(videoText, center.x + width, 0)
  },

  // TelemetryInfo
  // ---------------------------
  TelemetryInfo(ctx, position, lines) {
    ctx.fillStyle = Styles.blackAlpha
    ctx.fillRect(position.x, position.y, position.width, position.height)

    ctx.fillStyle = Styles.green
    ctx.font = Styles.fontSmall2

    let y = position.y + position.charHeight
    lines.forEach((line) => {
      ctx.fillText(line, position.x + position.padding, y)
      y += position.charHeight
    })
  },

  // HomeIndicator
  // ---------------------------
  HomeIndicator(ctx, position, directionToHome, distanceToHome, heading) {
    const { center } = position
    const radius = position.width / 2

    // Relative bearing: angle from current heading to home
    const relBearing = ((directionToHome - heading) + 360) % 360
    const angle = ((relBearing - 90) * Math.PI) / 180

    // Circle
    ctx.beginPath()
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
    ctx.strokeStyle = Styles.cyaan
    ctx.lineWidth = Styles.thickLineWidth
    ctx.stroke()

    // H label
    ctx.fillStyle = Styles.cyaan
    ctx.font = `bold ${Math.round(radius * 1.1)}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('H', center.x, center.y)

    // Arrow pointing toward home
    const arrowStart = radius + 4
    const arrowEnd = radius + radius * 0.9
    const ax = center.x + Math.cos(angle) * arrowEnd
    const ay = center.y + Math.sin(angle) * arrowEnd

    ctx.beginPath()
    ctx.moveTo(center.x + Math.cos(angle) * arrowStart, center.y + Math.sin(angle) * arrowStart)
    ctx.lineTo(ax, ay)
    ctx.strokeStyle = Styles.cyaan
    ctx.lineWidth = Styles.thickLineWidth
    ctx.stroke()

    // Arrowhead
    const headLen = radius * 0.4
    const headAngle = Math.PI / 5
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(ax - headLen * Math.cos(angle - headAngle), ay - headLen * Math.sin(angle - headAngle))
    ctx.moveTo(ax, ay)
    ctx.lineTo(ax - headLen * Math.cos(angle + headAngle), ay - headLen * Math.sin(angle + headAngle))
    ctx.stroke()

    // Distance text
    const dist = distanceToHome >= 1000 ? `${(distanceToHome / 1000).toFixed(1)}km` : `${distanceToHome}m`
    ctx.font = Styles.fontSmall2
    ctx.fillStyle = Styles.cyaan
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(dist, center.x, center.y + radius + 4)
  },

  // SonarDistance
  // ---------------------------
  SonarDistance(ctx, position, sonar) {
    const { center } = position
    const dist = (sonar / 100).toFixed(2)

    ctx.fillStyle = Styles.yellow
    ctx.font = Styles.font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`◆ ${dist}m`, center.x, center.y)
  },

  // DebugParameter
  // ---------------------------
  DebugParameter(ctx, position, lines) {
    ctx.fillStyle = Styles.blackAlpha
    ctx.fillRect(position.x, position.y, position.width, position.height)

    ctx.fillStyle = Styles.green
    ctx.font = Styles.fontSmall2

    let y = position.y + position.charHeight
    lines.forEach((line) => {
      ctx.fillText(line, position.x + position.padding, y)
      y += position.charHeight
    })
  },
}

// TelemetryOverlay --------------------------------------------------------------------------------------------
export default (hud) => {
  const state = {
    canvas: hud,
    ctx: hud.getContext('2d', { alpha: true }),

    width: 640,
    height: 360,
    center: { x: 640 / 2, y: 360 / 2 },

    logicalWidth: 1280,
    logicalHeight: 720,
    logicalCenter: { x: 1280 / 2, y: 720 / 2 },

    currentDisplayAltitude: 0,
    currentDisplaySpeed: 0,

    pendingData: null,
    pendingType: null,
    dirty: false,
    animationId: null,
  }

  const TelemetryOverlay = {
    // update - データを保存してdirtyフラグを立てるだけ
    // ---------------------------
    update(telemetryData = {}) {
      state.pendingData = telemetryData
      state.pendingType = 'update'
      state.dirty = true
    },

    // MSP - データを保存してdirtyフラグを立てるだけ
    // ---------------------------
    MSP(telemetryData = {}) {
      state.pendingData = telemetryData
      state.pendingType = 'MSP'
      state.dirty = true
    },

    // _drawUpdate - update の実際の描画処理
    // ---------------------------
    _drawUpdate(telemetryData) {
      state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height)

      let { heading, pitch, roll, gps, battery, videoText, telemetryInfo } = telemetryData

      this.drawCompass(heading ?? 0)
      this.drawCrosshair()
      this.drawPitchLadder(pitch ?? 0, roll ?? 0)
      this.drawRollIndicator(roll ?? 0)
      this.drawAltitude(gps?.altitude ?? 0)
      this.drawSpeed(gps?.speed ?? 0)
      this.drawBattery(battery?.level ?? 0, battery?.charging ?? false, videoText ?? '')
      this.drawTelemetryInfo(telemetryInfo)
      this.drawDebugParameter(telemetryData)
    },

    // _drawMSP - MSP の実際の描画処理
    // ---------------------------
    _drawMSP(telemetryData) {
      state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height)

      let { roll, pitch, yaw, altitude, analog, battery, gps, compGps, sonar, videoText, telemetryInfo } = telemetryData

      // yaw from MSP_ATTITUDE = heading (0-360 degrees)
      const level = analog && battery ? this.calculateBatteryLevel(analog, battery) : 0
      this.drawCompass(yaw ?? 0)
      this.drawCrosshair()
      this.drawPitchLadder(pitch ?? 0, roll ?? 0)
      this.drawRollIndicator(roll ?? 0)
      this.drawAltitude(altitude ?? 0)          // MSP_ALTITUDE (meters)
      this.drawSpeed(gps?.speed ?? 0)           // MSP_RAW_GPS speed (cm/s)
      this.drawBattery(level, false, videoText ?? '')
      if (compGps?.update) this.drawHomeIndicator(compGps.directionToHome, compGps.distanceToHome, yaw ?? 0)
      if (sonar != null) this.drawSonarDistance(sonar)
      this.drawTelemetryInfo(telemetryInfo)
      this.drawDebugParameter(telemetryData)
    },

    // _renderFrame - dirty なときだけ描画
    // ---------------------------
    _renderFrame() {
      if (!state.dirty || !state.pendingData) return
      state.dirty = false
      const data = state.pendingData
      if (state.pendingType === 'MSP') {
        this._drawMSP(data)
      } else {
        this._drawUpdate(data)
      }
    },

    // start - RAF ループ開始（ループ関数は一度だけ生成）
    // ---------------------------
    start() {
      if (!state.animationId) {
        const loop = () => {
          this._renderFrame()
          state.animationId = requestAnimationFrame(loop)
        }
        loop()
      }
    },

    // stop - RAF ループ停止
    // ---------------------------
    stop() {
      if (state.animationId) {
        cancelAnimationFrame(state.animationId)
        state.animationId = null
      }
    },

    // calculateBatteryLevel
    // ---------------------------
    calculateBatteryLevel(mspAnalog, mspBatteryState) {
      const { voltage, mAhdrawn } = mspAnalog
      const { cellCount, capacity } = mspBatteryState
      let level = 0
      if (capacity > 0 && mAhdrawn >= 0) {
        const remaining = capacity - mAhdrawn
        level = Math.max(0, Math.min(1, remaining / capacity))
      } else if (cellCount > 0 && voltage > 0) {
        const cellVoltage = voltage / cellCount
        const minVoltage = 3.3
        const maxVoltage = 4.2
        level = Math.max(0, Math.min(1, (cellVoltage - minVoltage) / (maxVoltage - minVoltage)))
      }
      return level
    },

    // clear
    // ---------------------------
    clear() {
      this.stop()
      state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height)
    },

    // resizeCanvas
    // ---------------------------
    resizeCanvas(width, height) {
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

      state.ctx.imageSmoothingEnabled = false
    },

    // renderPosition
    // ---------------------------
    renderPosition(type) {
      switch (type) {
        case 'Compass': {
          const width = state.width * (2 / 5)
          const height = state.height / 12
          const center = {
            //
            x: state.center.x,
            y: state.center.y / 10,
          }
          const x = center.x - width / 2
          const y = center.y - height / 2
          return { x, y, width, height, center }
        }
        case 'Crosshair': {
          const width = state.width / 8
          const height = width
          const center = {
            //
            x: state.center.x,
            y: state.center.y,
          }
          const x = center.x - width / 2
          const y = center.y - height / 2
          return { x, y, width, height, center }
        }
        case 'PitchLadder': {
          const width = state.width / (7 / 2)
          const height = state.height / (13 / 10)
          const center = {
            //
            x: state.center.x,
            y: state.center.y,
          }
          const x = center.x - width / 2
          const y = center.y - height / 2
          return { x, y, width, height, center }
        }
        case 'RollIndicator': {
          const width = state.width / 10
          const height = width
          const center = {
            //
            x: state.center.x,
            y: state.center.y,
          }
          const x = center.x - width / 2
          const y = center.y - height / 2
          return { x, y, width, height, center }
        }
        case 'Altitude': {
          const width = state.width / 22
          const height = state.height / 1.75
          const center = {
            //
            x: (state.center.x + state.width) / 2,
            y: state.center.y,
          }
          const x = center.x - width / 2
          const y = center.y - height / 2
          return { x, y, width, height, center }
        }
        case 'Speed': {
          const width = state.width / 22
          const height = state.height / 1.75
          const center = {
            //
            x: state.center.x / 2,
            y: state.center.y,
          }
          const x = center.x - width / 2
          const y = center.y - height / 2
          return { x, y, width, height, center }
        }
        case 'Battery': {
          const width = state.width / 30
          const height = state.height / 35
          const center = {
            //
            x: state.width - width,
            y: height * 1.25,
          }
          const x = center.x - width / 2
          const y = center.y - height / 2
          return { x, y, width, height, center }
        }
        case 'SonarDistance': {
          const center = {
            x: state.center.x,
            y: state.height - state.height / 12,
          }
          return { center }
        }
        case 'HomeIndicator': {
          // Right side, below battery
          const width = state.width / 18
          const height = width
          const center = {
            x: state.width - width * 1.5,
            y: state.height / 8,
          }
          const x = center.x - width / 2
          const y = center.y - height / 2
          return { x, y, width, height, center }
        }
      }
    },

    // renderSize
    // ---------------------------
    renderSize(type, lines) {
      let padding = 5
      let charWidth = 5.5
      let charHeight = 16

      const maxLength = Math.max(...lines.map((line) => line.length))

      switch (type) {
        case 'TelemetryInfo': {
          const width = maxLength * charWidth + padding * 2
          const height = lines.length * charHeight + padding * 2
          const center = {
            //
            x: state.width - 5 - width / 2,
            y: state.height / 2,
          }
          const x = center.x - width / 2
          const y = center.y - height / 2
          return { x, y, width, height, center, padding, charWidth, charHeight }
        }
        case 'Debug': {
          const width = Math.max(maxLength * charWidth + padding * 2, state.width / 9)
          const height = lines.length * charHeight + padding * 2
          const center = {
            //
            x: 5 + width / 2,
            y: state.height / 2,
          }
          const x = center.x - width / 2
          const y = center.y - height / 2
          return { x, y, width, height, center, padding, charWidth, charHeight }
        }
      }
    },

    // drawCompass
    // ---------------------------
    drawCompass(heading) {
      let current = 'Compass'
      let position = this.renderPosition(current)

      state.ctx.save()
      try {
        TelemetryRenderer.Compass(state.ctx, position, heading, state.canvas.width)
        // this.print(current, position, 'rgba(0, 0, 0, 0.3)', 'rgba(0, 255, 0, 1)')
      } catch (e) {
        console.error(current, ' : ', e)
      } finally {
        state.ctx.restore()
      }
    },

    // drawCrosshair
    // ---------------------------
    drawCrosshair() {
      let current = 'Crosshair'
      let position = this.renderPosition(current)

      state.ctx.save()
      try {
        TelemetryRenderer.Crosshair(state.ctx, position)
        // this.print(current, position, 'rgba(0, 0, 0, 0.3)', 'rgba(0, 255, 0, 1)')
      } catch (e) {
        console.error(current, ' : ', e)
      } finally {
        state.ctx.restore()
      }
    },

    // drawPitchLadder
    // ---------------------------
    drawPitchLadder(pitch, roll) {
      let current = 'PitchLadder'
      let position = this.renderPosition(current)

      state.ctx.save()
      try {
        TelemetryRenderer.PitchLadder(state.ctx, position, pitch, roll)
        // this.print(current, position, 'rgba(0, 0, 0, 0.3)', 'rgba(0, 255, 0, 1)')
      } catch (e) {
        console.error(current, ' : ', e)
      } finally {
        state.ctx.restore()
      }
    },

    // drawRollIndicator
    // ---------------------------
    drawRollIndicator(roll) {
      let current = 'RollIndicator'
      let position = this.renderPosition(current)

      state.ctx.save()
      try {
        TelemetryRenderer.RollIndicator(state.ctx, position, roll)
        // this.print(current, position, 'rgba(0, 0, 0, 0.3)', 'rgba(0, 255, 0, 1)')
      } catch (e) {
        console.error(current, ' : ', e)
      } finally {
        state.ctx.restore()
      }
    },

    // drawAltitude
    // ---------------------------
    drawAltitude(altitude) {
      const altitudeLerpFactor = 0.1
      state.currentDisplayAltitude += (altitude - state.currentDisplayAltitude) * altitudeLerpFactor

      let current = 'Altitude'
      let position = this.renderPosition(current)

      state.ctx.save()
      try {
        TelemetryRenderer.Altitude(state.ctx, position, altitude, state.currentDisplayAltitude, state.canvas.width)
        // this.print(current, position, 'rgba(0, 0, 0, 0.3)', 'rgba(0, 255, 0, 1)')
      } catch (e) {
        console.error(current, ' : ', e)
      } finally {
        state.ctx.restore()
      }
    },

    // drawSpeed
    // ---------------------------
    drawSpeed(speed) {
      const speedLerpFactor = 0.1
      state.currentDisplaySpeed += (speed - state.currentDisplaySpeed) * speedLerpFactor

      let current = 'Speed'
      let position = this.renderPosition(current)

      state.ctx.save()
      try {
        TelemetryRenderer.Speed(state.ctx, position, speed, state.currentDisplaySpeed, state.canvas.width)
        // this.print(current, position, 'rgba(0, 0, 0, 0.3)', 'rgba(0, 255, 0, 1)')
      } catch (e) {
        console.error(current, ' : ', e)
      } finally {
        state.ctx.restore()
      }
    },

    // drawSonarDistance
    // ---------------------------
    drawSonarDistance(sonar) {
      let current = 'SonarDistance'
      let position = this.renderPosition(current)

      state.ctx.save()
      try {
        TelemetryRenderer.SonarDistance(state.ctx, position, sonar)
      } catch (e) {
        console.error(current, ' : ', e)
      } finally {
        state.ctx.restore()
      }
    },

    // drawHomeIndicator
    // ---------------------------
    drawHomeIndicator(directionToHome, distanceToHome, heading) {
      let current = 'HomeIndicator'
      let position = this.renderPosition(current)

      state.ctx.save()
      try {
        TelemetryRenderer.HomeIndicator(state.ctx, position, directionToHome, distanceToHome, heading)
      } catch (e) {
        console.error(current, ' : ', e)
      } finally {
        state.ctx.restore()
      }
    },

    // drawBattery
    // ---------------------------
    drawBattery(level, charging, videoText) {
      let current = 'Battery'
      let position = this.renderPosition(current)

      state.ctx.save()
      try {
        TelemetryRenderer.Battery(state.ctx, position, level, charging, videoText)
        // this.print(current, position, 'rgba(0, 0, 0, 0.3)', 'rgba(0, 255, 0, 1)')
      } catch (e) {
        console.error(current, ' : ', e)
      } finally {
        state.ctx.restore()
      }
    },

    // drawTelemetryInfo
    // ---------------------------
    drawTelemetryInfo(telemetryInfo) {
      let current = 'TelemetryInfo'

      if (!telemetryInfo || Object.keys(telemetryInfo).length === 0) return

      const lines = []
      this.collectLines(telemetryInfo, lines)

      let position = this.renderSize(current, lines)

      state.ctx.save()
      try {
        TelemetryRenderer.TelemetryInfo(state.ctx, position, lines)
        // this.print(current, position, 'rgba(0, 0, 0, 0.3)', 'rgba(0, 255, 0, 1)')
      } catch (e) {
        console.error(current, ' : ', e)
      } finally {
        state.ctx.restore()
      }
    },

    // drawDebugParameter
    // ---------------------------
    drawDebugParameter(telemetryData) {
      let current = 'Debug'

      let filtered = Object.fromEntries(Object.entries(telemetryData).filter(([key]) => key !== 'telemetryInfo' && key !== 'videoText'))
      if (!filtered || Object.keys(filtered).length === 0) return

      const lines = []
      this.collectLines(filtered, lines)

      let position = this.renderSize(current, lines)

      state.ctx.save()
      try {
        TelemetryRenderer.DebugParameter(state.ctx, position, lines)
        // this.print(current, position, 'rgba(0, 0, 0, 0.3)', 'rgba(0, 255, 0, 1)')
      } catch (e) {
        console.error(current, ' : ', e)
      } finally {
        state.ctx.restore()
      }
    },

    // collectLines
    // ---------------------------
    collectLines(obj, lines, indent = 0) {
      const entries = Object.entries(obj)
      const maxKeyLength = Math.max(...entries.map(([key]) => key.length))

      entries.forEach(([key, value]) => {
        const paddedKey = ' '.repeat(indent * 2) + key.padEnd(maxKeyLength, ' ')
        if (typeof value === 'object' && value !== null) {
          lines.push(`${paddedKey}:`)
          this.collectLines(value, lines, indent + 1)
        } else {
          lines.push(`${paddedKey}: ${value}`)
        }
      })
    },

    // print
    // ---------------------------
    print(name, position, bgColor, textColor) {
      state.ctx.fillStyle = bgColor
      state.ctx.fillRect(position.x, position.y, position.width, position.height)

      let fontSize = 11
      state.ctx.fillStyle = textColor
      state.ctx.font = `${fontSize}px Arial`

      state.ctx.fillText(name, position.x, position.y)

      Object.entries(position).forEach(([key, value], index) => {
        state.ctx.fillText(`${key}: ${value}`, position.x, position.y + (index + 1) * fontSize)
      })
    },
  }

  return TelemetryOverlay
}
