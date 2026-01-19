import * as C from './component'
import { ReceiverState } from '../receiver.js'

const subElements = [
  //
  C.WebrtcReportButton,
  C.SearchRadarButton,
  C.FullScreenButton,
  C.GrayscaleCheck,
  C.MuteCheck,
]

export function disabled() {
  subElements.forEach((el) => {
    if (el) el.disabled = true
  })
}

disabled()

export function enable() {
  subElements.forEach((el) => {
    if (el) el.disabled = false
  })
}

function toggleVisibility(...elements) {
  elements.forEach((el) => {
    if (el) el.style.visibility = el.style.visibility === 'visible' ? 'hidden' : 'visible'
  })
}

// WebrtcReportButton -----------------------------------------------
C.WebrtcReportButton.on('click', () => {
  RadarMap.style.visibility = 'hidden'
  toggleVisibility(WebrtcReport)
})

// SearchRadarButton -----------------------------------------------
C.SearchRadarButton.on('click', () => {
  WebrtcReport.style.visibility = 'hidden'
  toggleVisibility(RadarMap)
  if (RadarMap.style.visibility === 'visible') {
    ReceiverState.searchRadar.start()
  } else if (RadarMap.style.visibility === 'hidden') {
    ReceiverState.searchRadar.stop()
  }
})

// FullScreenButton -----------------------------------------------
C.FullScreenButton.on('click', () => {
  const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement
  isFullscreen ? document.exitFullscreen() : ReceiverContainer.requestFullscreen()
  C.FullScreenButton.title = isFullscreen ? 'Fullscreen' : 'Exit Fullscreen'
})

// GrayscaleCheck -----------------------------------------------
C.GrayscaleCheck.on('change', (ev) => {
  if (ev.value) {
    RemoteVideo.style.filter = 'grayscale(1)'
    RemoteVideo.style.webkitFilter = 'grayscale(1)'
  } else {
    RemoteVideo.style.filter = ''
    RemoteVideo.style.webkitFilter = ''
  }
})

// MuteCheck -----------------------------------------------
C.MuteCheck.on('change', (ev) => {
  State.audio.muted = ev.value
})
