/**
 * 要素を非表示（visibility: hidden）にする
 * @param {...HTMLElement} elements
 */
function hidden(...elements) {
  elements.forEach((el) => {
    if (el) el.style.visibility = 'hidden'
  })
}

/**
 * 要素を表示（visibility: visible）にする
 * @param {...HTMLElement} elements
 */
function visible(...elements) {
  elements.forEach((el) => {
    if (el) el.style.visibility = 'visible'
  })
}

/**
 * 要素を display:none にする
 * @param {...HTMLElement} elements
 */
function displayNone(...elements) {
  elements.forEach((el) => {
    if (el) el.style.display = 'none'
  })
}

import Alpine from 'alpinejs'
import SenderManager from '../sender'
import ReceiverManager from '../receiver'
import AudioStreamVisualizer from './audio-visualizer.js'
import { ReceiverState, resetTelemetryData } from '../receiver'
import * as Utils from '../utils.js'
import RtcStats, { MonitorState } from '../stats/index.js'
import NetworkMonitor from './network-monitor.js'
import StreamHandler, { PostMessageType } from '../stream/handler.js'
import * as VtxConsole from './vtx-console.js'
import * as DroneMap from './map.js'

/** 不明なモード（?p= なし）のときに Receiver・Sender コンテナを非表示にする */
function initializeUnknown() {
  ReceiverContainer.style.display = 'none'
  SenderContainer.style.display = 'none'
}

/**
 * Sender モードの初期化を行う
 * iOS の場合は DeviceMotionEvent のパーミッションボタンを設定する
 */
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

/**
 * Receiver モードの初期化を行う
 * 各 UI 要素を非表示にしてリサイズオブザーバーとイベントリスナーを登録する
 */
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

  if (import.meta.env.MODE === 'public') SenderQR.style.display = 'block'

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

/** WebRTC 接続確立後に映像・HUD・チャートなどの UI を表示状態に切り替える */
function connectionEstablishment() {
  visible(
    //
    RemoteVideo,
    HeadUpDisplay,
    Aircraft,
    AudioVisualizer,
    NetworkMonitoring,
    RadarMap,
  )

  const store = Alpine.store('menu')
  ReceiverState.headUpDisplay.start()
  ReceiverState.headUpDisplay.setDebugVisible(store.showDebug)
  RemoteVideo.style.filter = store.grayscale ? 'grayscale(1)' : ''
  RemoteVideo.style.webkitFilter = store.grayscale ? 'grayscale(1)' : ''
  DroneMap.init()
}

/**
 * 音声ストリームを AudioVisualizer に接続して再生を開始する
 * @param {MediaStream} srcObject - WebRTC audio track のストリーム
 */
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

/**
 * 接続切断時に映像・HUD・音声などの UI をクリーンアップして非表示に戻す
 * NetworkMonitor / RtcStats の停止と StreamHandler の終了も含む
 */
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
  VtxConsole.hide()
  VtxConsole.clear()
  DroneMap.destroy()

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
        RtcStats.stop()
        NetworkMonitor.stop()
        MonitorState.dataChannelInfo = {}
        resetTelemetryData()
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
