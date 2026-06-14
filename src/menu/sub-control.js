import Alpine from 'alpinejs'
import { ReceiverState } from '../receiver'
import { startScreenRecording, stopScreenRecording } from '../record'

const COLOR_THEMES = {
  green: [0,   255, 0  ],
  amber: [255, 176, 0  ],
  cyan:  [0,   210, 255],
  white: [200, 200, 200],
  red:   [255, 50,  50 ],
}


window.addEventListener('menu:grayscale-change', () => {
  const gray = Alpine.store('menu').grayscale
  RemoteVideo.style.filter = gray ? 'grayscale(1)' : ''
  RemoteVideo.style.webkitFilter = gray ? 'grayscale(1)' : ''
})

window.addEventListener('menu:mute-change', () => {
  if (ReceiverState.audio) ReceiverState.audio.muted = Alpine.store('menu').mute
})

window.addEventListener('menu:debug-change', () => {
  const store = Alpine.store('menu')
  ReceiverState.headUpDisplay.setDebugVisible(store.showDebug)
  if (store.showDebug) store.menuOpen = false
})

window.addEventListener('menu:open', () => {
  const store = Alpine.store('menu')
  if (store.showDebug) {
    store.showDebug = false
    ReceiverState.headUpDisplay.setDebugVisible(false)
  }
})

window.addEventListener('menu:color-change', () => {
  const key = Alpine.store('menu').selectedColor
  const [r, g, b] = COLOR_THEMES[key] || COLOR_THEMES.green
  const root = document.documentElement
  root.style.setProperty('--ui-r', r)
  root.style.setProperty('--ui-g', g)
  root.style.setProperty('--ui-b', b)
  ReceiverState.headUpDisplay.setColor(r, g, b)
  ReceiverState.audioVisualizer?.setColor(r, g, b)
  const el = document.getElementById('Aircraft')
  if (el) el.className = `theme-${key}`
})

window.addEventListener('menu:font-change', () => {
  const fontFamily = Alpine.store('menu').selectedFont
  document.documentElement.style.setProperty('--ui-font', fontFamily)
  ReceiverState.headUpDisplay.setFont(fontFamily)
  ReceiverState.audioVisualizer?.setFont(fontFamily)
})

window.addEventListener('menu:aircraft-change', () => {
  Aircraft.src = Alpine.store('menu').selectedAircraft
})

window.addEventListener('menu:fullscreen-click', () => {
  const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement
  if (isFullscreen) {
    document.exitFullscreen()
  } else {
    ReceiverContainer.requestFullscreen()
  }
})

window.addEventListener('menu:webrtc-report-click', () => {
  RadarMap.style.visibility = 'hidden'
  WebrtcReport.style.visibility = WebrtcReport.style.visibility === 'visible' ? 'hidden' : 'visible'
})

window.addEventListener('menu:search-radar-click', () => {
  WebrtcReport.style.visibility = 'hidden'
  SearchRadarCanvas.style.visibility = SearchRadarCanvas.style.visibility === 'visible' ? 'hidden' : 'visible'
  if (SearchRadarCanvas.style.visibility === 'visible') {
    ReceiverState.searchRadar.start()
  } else {
    ReceiverState.searchRadar.stop()
  }
})

window.addEventListener('menu:record-click', () => {
  if (Alpine.store('menu').recording) {
    stopScreenRecording()
  } else {
    startScreenRecording()
  }
})

