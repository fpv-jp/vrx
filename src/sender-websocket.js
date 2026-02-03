import Constants from './constants.js'
import { SenderState } from './sender.js'
import StreamHandler, { PostMessageType } from './stream-handler.js'

import * as Utils from './utils.js'

const SENDER = Constants.SENDER
const RECEIVER = Constants.RECEIVER

// -----------------------------------
// comingSignalingMessage
// -----------------------------------
export default async function comingSignalingMessage(message, initSenderPeerConnection) {
  const { type, ws1Id, ws2Id } = message

  switch (type) {
    case SENDER.SESSION_ID_ISSUANCE:
      SenderState.ws1.id = message.sessionId
      console.log(`assigned session id : ${message.sessionId}`)
      SenderId.textContent = `Your Sender Id: ${message.sessionId}`

      // Send platform info to server
      const browserInfo = Utils.parseBrowserInfo()
      const platformInfo = {
        type: SENDER.PLATFORM_INFO,
        platform: 'BROWSER',
        gpu: browserInfo,
      }
      SenderState.ws1.originalSend(JSON.stringify(platformInfo))
      console.log(`<<< ${SENDER.PLATFORM_INFO} SENDER_PLATFORM_INFO:`, platformInfo)
      break

    case SENDER.MEDIA_DEVICE_LIST_REQUEST:
      SenderState.ws1.pair = ws2Id
      const devices = await Utils.getInputMediaDevicesList()
      const codecs = Utils.getCapabilityCodecs()
      let source = 'browser'
      Utils.sendSignalingMessage(SenderState.ws1, RECEIVER.MEDIA_DEVICE_LIST_RESPONSE, { source, devices, codecs })
      break

    case SENDER.MEDIA_STREAM_START:
      SenderState.ws1.pair = ws2Id
      const { constraints, video_codec, audio_codec } = message

      SenderState.stream = await navigator.mediaDevices.getUserMedia(constraints)

      initSenderPeerConnection()

      Utils.setSenderPriority(SenderState.pc1.getSenders())
      Utils.setCapabilityCodec(SenderState.pc1.getTransceivers(), video_codec, audio_codec)

      const offer = await SenderState.pc1.createOffer()
      await SenderState.pc1.setLocalDescription(offer)

      Utils.sendSignalingMessage(SenderState.ws1, RECEIVER.SDP_OFFER, { offer })

      StreamHandler.postMessage({
        //
        type: PostMessageType.Offer,
        offer,
      })

      break

    case SENDER.SDP_ANSWER:
      await SenderState.pc1.setRemoteDescription(new RTCSessionDescription(message.answer))
      break

    case SENDER.ICE:
      await SenderState.pc1.addIceCandidate(new RTCIceCandidate(message.candidate))
      break

    case SENDER.RECEIVER_CLOSE:
      console.warn('RECEIVER_CLOSE:', type)

      SenderState?.stream.getTracks().forEach((track) => track.stop())
      SenderState.stream = null

      SenderState?.pc1.close()
      SenderState.pc1 = null

      break

    case SENDER.SYSTEM_ERROR:
      console.error('Error message type:', type)
      break

    default:
      console.error('Unknown sender message type:', type)
  }
}
