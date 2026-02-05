function hidden(...elements) {
  elements.forEach((el) => {
    if (el) el.style.visibility = 'hidden'
  })
}

function visible(...elements) {
  elements.forEach((el) => {
    if (el) el.style.visibility = 'visible'
  })
}

function displayNone(...elements) {
  elements.forEach((el) => {
    if (el) el.style.display = 'none'
  })
}

import Alpine from 'alpinejs'
import SenderManager from '../sender'
import ReceiverManager from '../receiver'
import AudioStreamVisualizer from './audio-visualizer.js'
import { ReceiverState } from '../receiver'
import * as Utils from '../utils.js'
import ConnectionMonitoring from '../widgets/monitoring.js'
import StreamHandler, { PostMessageType } from '../stream/handler.js'

// initializeUnknown -----------------------------------------------
function initializeUnknown() {
  ReceiverContainer.style.display = 'none'
  SenderContainer.style.display = 'none'
}

// initializeSender -----------------------------------------------
function initializeSender() {
  document.title = 'FPV Japan VTX'

  if (Utils.isIOS()) {
    PermissionButton.onclick = async () => {
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        let permissionState = await DeviceMotionEvent.requestPermission()
        if (permissionState === 'granted') {
          console.log('Motion permission granted!')
        } else {
          console.error('Motion permission denied.')
        }
      }
    }
  } else {
    hidden(PermissionButton)
  }

  displayNone(ReceiverContainer)

  window.addEventListener('unload', (e) => {
    SenderManager.onunload(e)
  })
}

// initializeReceiver -----------------------------------------------
function initializeReceiver() {
  document.title = 'FPV Japan VRX'

  displayNone(SenderContainer)

  hidden(
    //
    RemoteVideo,
    HeadUpDisplay,
    Aircraft,
    AudioVisualizer,
    NetworkMonitoring,
    WebrtcReport,
    RadarMap,
  )

  if (import.meta.env.MODE === 'production') SenderQR.style.display = 'block'

  window.addEventListener('unload', (e) => {
    ReceiverManager.onunload(e)
  })
  document.addEventListener('fullscreenchange', (e) => {
    ReceiverManager.onfullscreenchange(e)
  })
  document.addEventListener('webkitfullscreenchange', (e) => {
    ReceiverManager.onfullscreenchange(e)
  })
  new ResizeObserver(ReceiverManager.onReceiverContainerResize).observe(ReceiverContainer)
  new ResizeObserver(ReceiverManager.onRemoteVideorResize).observe(RemoteVideo)
}

// connectionEstablishment -----------------------------------------------
function connectionEstablishment() {
  visible(
    //
    RemoteVideo,
    HeadUpDisplay,
    Aircraft,
    AudioVisualizer,
    NetworkMonitoring,
    // WebrtcReport,
    // RadarMap,
  )

  const store = Alpine.store('menu')
  ReceiverState.headUpDisplay.start()
  ReceiverState.headUpDisplay.setDebugVisible(store.showDebug)
  RemoteVideo.style.filter = store.grayscale ? 'grayscale(1)' : ''
  RemoteVideo.style.webkitFilter = store.grayscale ? 'grayscale(1)' : ''
}

// attachAudioStream -----------------------------------------------
function attachAudioStream(srcObject) {
  var audioVisualizer = AudioStreamVisualizer(AudioVisualizer, srcObject)
  audioVisualizer.resizeCanvas(240, 80)
  const { selectedColor } = Alpine.store('menu')
  const COLOR_THEMES = { green:[0,255,0], amber:[255,176,0], cyan:[0,210,255], white:[200,200,200], red:[255,50,50] }
  const [r, g, b] = COLOR_THEMES[selectedColor] || COLOR_THEMES.green
  audioVisualizer.setColor(r, g, b)
  audioVisualizer.setFont(Alpine.store('menu').selectedFont)
  audioVisualizer.start(ReceiverState.audioText)
  ReceiverState.audioVisualizer = audioVisualizer

  var audio = new Audio()
  audio.srcObject = srcObject
  audio.muted = Alpine.store('menu').mute
  audio.play().catch(() => {})
  ReceiverState.audio = audio
}

// destroyReceiver -----------------------------------------------
function destroyReceiver() {
  //
  hidden(
    //
    RemoteVideo,
    HeadUpDisplay,
    Aircraft,
    AudioVisualizer,
    NetworkMonitoring,
    WebrtcReport,
    RadarMap,
  )

  for (const child of ReceiverContainer.children) {
    const { id, tagName } = child

    switch (id) {
      case 'AlpineMenu':
        break

      case 'RemoteVideo':
        let type = PostMessageType.Terminate
        StreamHandler.postMessage({ type })
        break

      case 'HeadUpDisplay':
        ReceiverState.headUpDisplay.clear()
        break

      case 'Aircraft':
        break

      case 'SenderQR':
        break

      case 'AudioVisualizer':
        if (ReceiverState?.audio?.srcObject) {
          ReceiverState.audio.srcObject.getTracks().forEach((track) => track.stop())
        }
        ReceiverState.audio = null
        if (ReceiverState.audioVisualizer) ReceiverState.audioVisualizer.clear()
        ReceiverState.audioVisualizer = null
        break

      case 'NetworkMonitoring':
        ConnectionMonitoring.stop()
        child.innerHTML = ''
        break

      case 'WebrtcReport':
        break

      case 'RadarMap':
        ReceiverState?.searchRadar.stop()
        break

      default:
        console.log(`??? id=${id}, tag=${tagName}`)
        break
    }
  }
}

export {
  //
  initializeUnknown,
  initializeSender,
  initializeReceiver,
  connectionEstablishment,
  attachAudioStream,
  destroyReceiver,
}
