import Constants from '../constants.js'
import ComingSignalingMessage from './signaling.js'
import OpenVtxDataChannel, { resetTelemetryData } from './datachannel.js'
export { resetTelemetryData }

import { receiverDecodeTransform } from '../stream/handler.js'
import RtcStats from '../stats/index.js'
import NetworkMonitor from '../widgets/network-monitor.js'
import TelemetryOverlay from '../widgets/telemetry-overlay.js'
import SearchRadar from '../widgets/search-radar.js'
import * as Menu from '../menu'
import * as Widgets from '../widgets'
import * as Utils from '../utils.js'

/** Receiver 側の接続状態を保持するグローバル状態 */
export const ReceiverState = {
  ws: null,
  pc: null,

  stream: null,
  audio: null,
  audioVisualizer: null,

  videoText: '',
  audioText: '',
  headUpDisplay: TelemetryOverlay(HeadUpDisplay),

  searchRadar: SearchRadar(RadarMap),

  cmd: null,
}

const SENDER = Constants.SENDER

/** WebRTC Receiver の接続・シグナリング・メディア受信を管理するモジュール */
const ReceiverManager = {
  /**
   * WebSocket シグナリングメッセージを受信して処理する
   * @param {WebSocket} ws
   * @param {Object} message - 受信したシグナリングメッセージ
   */
  async handleSignalingMessage(ws, message) {
    ReceiverState.ws = ws
    ComingSignalingMessage(message)
  },

  /**
   * RTCPeerConnection を生成してイベントリスナーを登録する
   * 接続確立時に RtcStats・NetworkMonitor・Menu・Widgets を起動する
   */
  initReceiverPeerConnection() {
    let pc = new RTCPeerConnection()
    ReceiverState.pc = pc

    pc.addEventListener('connectionstatechange', (e) => {
      const s = Utils.stats(e)
      switch (s.connectionState) {
        case 'connecting':
          break

        case 'connected':
          console.log('OK! Connection established')
          RtcStats.start()
          NetworkMonitor.start()
          Menu.connectionEstablishment()
          Widgets.connectionEstablishment()
          break

        case 'disconnected':
          console.warn('Warning! Connection disconnected')
          break

        case 'failed':
          console.error('Error! Connection failed')
          break
      }
    })

    pc.addEventListener('icecandidate', ({ candidate }) => {
      if (candidate) {
        const ice = Utils.parseICE(candidate.candidate)
        if (ice) {
          console.log(`<<< ${SENDER.ICE} SENDER.ICE: ${ice}`)
        } else {
          console.log(`<<< ${SENDER.ICE} SENDER.ICE: ${candidate.candidate}`)
        }
        Utils.sendSignalingMessage(ReceiverState.ws, SENDER.ICE, { candidate })
      }
    })

    pc.addEventListener('track', ({ receiver, streams, track }) => {
      if (track.kind === 'video') {
        receiverDecodeTransform(receiver)
      } else if (track.kind === 'audio') {
        receiverDecodeTransform(receiver)
        Widgets.attachAudioStream(streams[0])
      }

      if (ReceiverState.stream != streams[0]) {
        ReceiverState.stream = streams[0]
      }
    })

    pc.addEventListener('datachannel', ({ channel }) => {
      OpenVtxDataChannel(channel)
    })
  },

  /** ページアンロード時の後処理 */
  onunload(e) {
    console.log('unload', e)
  },

  /** フルスクリーン切り替え時の後処理 */
  onfullscreenchange(e) {
    console.log('fullscreenchange', e)
  },

  /** ReceiverContainer のリサイズ時に呼ばれる ResizeObserver コールバック */
  onReceiverContainerResize(e) {
    // console.log('ReceiverContainerResize', e)
  },

  /**
   * RemoteVideo のリサイズ時に HUD キャンバスを同期リサイズする
   * @param {ResizeObserverEntry[]} entries
   */
  onRemoteVideorResize(entries) {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        ReceiverState.headUpDisplay.resizeCanvas(width, height)
      }
    }
  },
}

export default ReceiverManager
