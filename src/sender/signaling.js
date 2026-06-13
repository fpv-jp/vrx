import Constants from '../constants.js'
import { SenderState } from './index.js'
import StreamHandler, { PostMessageType } from '../stream/handler.js'

import * as Utils from '../utils.js'

const SENDER = Constants.SENDER
const RECEIVER = Constants.RECEIVER

/**
 * Sender 側のシグナリングメッセージを振り分けて処理する
 * MEDIA_STREAM_START 受信時にメディア取得・PeerConnection 生成・SDP Offer 送信を行う
 * @param {object} message - WebSocket から受け取ったシグナリングメッセージ
 * @param {Function} initSenderPeerConnection - PeerConnection を初期化するコールバック
 */
export default async function comingSignalingMessage(message, initSenderPeerConnection) {
  const { type, ws1Id, ws2Id } = message

  switch (type) {
    case SENDER.SESSION_ID_ISSUANCE:
      SenderState.ws.id = message.sessionId
      console.log(`assigned session id : ${message.sessionId}`)
      SenderId.textContent = `Your Sender Id: ${message.sessionId}`

      if (message.pin && import.meta.env.VITE_PIN_AUTH === 'true') {
        const pinBox = document.getElementById('SenderPinBox')
        const pinEl = document.getElementById('SenderPin')
        if (pinBox && pinEl) {
          pinEl.innerHTML = message.pin.split('').map(d => `<span class="pin-digit">${d}</span>`).join('')
          pinBox.style.display = ''
        }
      }

      const browserInfo = Utils.parseBrowserInfo()
      const platformInfo = {
        type: SENDER.PLATFORM_INFO,
        platform: 'BROWSER',
        gpu: browserInfo,
      }
      SenderState.ws.originalSend(JSON.stringify(platformInfo))
      console.log(`<<< ${SENDER.PLATFORM_INFO} SENDER_PLATFORM_INFO:`, platformInfo)
      break

    case SENDER.MEDIA_DEVICE_LIST_REQUEST:
      SenderState.ws.pair = ws2Id
      const devices = await Utils.getInputMediaDevicesList()
      const codecs = Utils.getCapabilityCodecs()
      let source = 'browser'
      Utils.sendSignalingMessage(SenderState.ws, RECEIVER.MEDIA_DEVICE_LIST_RESPONSE, { source, devices, codecs })
      break

    case SENDER.MEDIA_STREAM_START:
      SenderState.ws.pair = ws2Id
      const { constraints, video_codec, audio_codec } = message

      SenderState.stream = await navigator.mediaDevices.getUserMedia(constraints)

      initSenderPeerConnection()

      Utils.setSenderPriority(SenderState.pc.getSenders())
      Utils.setCapabilityCodec(SenderState.pc.getTransceivers(), video_codec, audio_codec)

      const offer = await SenderState.pc.createOffer()
      await SenderState.pc.setLocalDescription(offer)

      Utils.sendSignalingMessage(SenderState.ws, RECEIVER.SDP_OFFER, { offer })

      StreamHandler.postMessage({
        //
        type: PostMessageType.Offer,
        offer,
      })

      break

    case SENDER.SDP_ANSWER:
      await SenderState.pc.setRemoteDescription(new RTCSessionDescription(message.answer))
      break

    case SENDER.ICE:
      await SenderState.pc.addIceCandidate(new RTCIceCandidate(message.candidate))
      break

    case SENDER.RECEIVER_CLOSE:
      console.warn('RECEIVER_CLOSE:', type)

      SenderState?.stream.getTracks().forEach((track) => track.stop())
      SenderState.stream = null

      SenderState?.pc.close()
      SenderState.pc = null

      break

    case SENDER.SYSTEM_ERROR:
      console.error('Error message type:', type)
      break

    default:
      console.error('Unknown sender message type:', type)
  }
}
