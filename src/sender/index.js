import Constants from '../constants.js'
import ComingSignalingMessage from './signaling.js'
import CreateVtxDataChannel from './datachannel.js'
import { senderEncodeTransform } from '../stream/handler.js'

import * as Utils from '../utils.js'

const RECEIVER = Constants.RECEIVER

/** Sender 側の接続状態を保持するグローバル状態 */
export const SenderState = {
  ws: null,
  pc: null,

  stream: null,
  sensor: null,

  cmd: null,

  dummyIntervalId: null,
  gpsWatchId: null,
}

/** WebRTC Sender の接続・シグナリング・メディア送信を管理するモジュール */
const SenderManager = {
  /**
   * WebSocket シグナリングメッセージを受信して処理する
   * @param {WebSocket} ws
   * @param {Object} message - 受信したシグナリングメッセージ
   */
  async handleSignalingMessage(ws, message) {
    SenderState.ws = ws
    ComingSignalingMessage(message, this.initSenderPeerConnection)
  },

  /**
   * RTCPeerConnection を生成してイベントリスナーを登録する
   * メディアトラックを追加し DataChannel を作成する
   */
  initSenderPeerConnection() {
    let pc = new RTCPeerConnection({ iceServers: Constants.ICE_SERVERS })
    SenderState.pc = pc

    pc.addEventListener('connectionstatechange', (e) => {
      const s = Utils.stats(e)
      switch (s.connectionState) {
        case 'connecting':
          break
        case 'connected':
          console.log('OK! Connection established')
          break
        case 'disconnected':
          console.warn('Warning! Connection disconnected')
          break
        case 'failed':
          console.error('Error! Connection failed')
          SenderState?.stream.getTracks().forEach((track) => track.stop())
          SenderState.stream = null

          SenderState?.pc.close()
          SenderState.pc = null
          break
      }
    })

    pc.addEventListener('icecandidate', ({ candidate }) => {
      if (candidate && Utils.isIPv4(candidate.address)) {
        Utils.sendSignalingMessage(SenderState.ws, RECEIVER.ICE, { candidate })
      }
    })

    CreateVtxDataChannel(pc)

    SenderState.stream.getTracks().forEach((track) => {
      const sender = pc.addTrack(track, SenderState.stream)
      if (track.kind === 'video') {
        senderEncodeTransform(sender)
      }
    })
  },

  /** ページアンロード時の後処理 */
  onunload(e) {
    console.log('unload', e)
  },
}

export default SenderManager
