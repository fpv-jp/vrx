import Alpine from 'alpinejs'
import { ReceiverState } from '../receiver'
import { startRecording, stopRecording } from '../record'

window.addEventListener('menu:grayscale-change', () => {
  const gray = Alpine.store('menu').grayscale
  RemoteVideo.style.filter = gray ? 'grayscale(1)' : ''
  RemoteVideo.style.webkitFilter = gray ? 'grayscale(1)' : ''
})

window.addEventListener('menu:mute-change', () => {
  if (ReceiverState.audio) ReceiverState.audio.muted = Alpine.store('menu').mute
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
  RadarMap.style.visibility = RadarMap.style.visibility === 'visible' ? 'hidden' : 'visible'
  if (RadarMap.style.visibility === 'visible') {
    ReceiverState.searchRadar.start()
  } else {
    ReceiverState.searchRadar.stop()
  }
})

window.addEventListener('menu:record-click', () => {
  if (Alpine.store('menu').recording) {
    stopRecording()
  } else {
    startRecording()
  }
})
