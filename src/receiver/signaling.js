import Constants from '../constants.js'
import { ReceiverState } from './index.js'
import StreamHandler, { PostMessageType } from '../stream/handler.js'

import * as Menu from '../menu'
import * as Widgets from '../widgets'
import * as Utils from '../utils.js'

const SENDER = Constants.SENDER
const RECEIVER = Constants.RECEIVER

// -----------------------------------
// transferRemoteVideoWorker
// -----------------------------------
function transferRemoteVideoWorker(answer) {
  if (!RemoteVideo.__offscreenTransferred) {
    let offscreen = RemoteVideo.transferControlToOffscreen()
    RemoteVideo.__offscreenTransferred = true
    let devicePixelRatio = window.devicePixelRatio || 1

    StreamHandler.postMessage(
      {
        //
        type: PostMessageType.RemoteVideo,
        offscreen,
        answer,
        devicePixelRatio,
      },
      [offscreen],
    )
  }

  StreamHandler.onmessage = ({ data }) => {
    switch (data.type) {
      // --- KeyFrame -------------------------
      case PostMessageType.KeyFrame:
        RemoteVideo.style.aspectRatio = `${data.width} / ${data.height}`
        break
    }
  }
}

// -----------------------------------
// comingSignalingMessage
// -----------------------------------
export default async function comingSignalingMessage(message) {
  switch (message.type) {
    case RECEIVER.SESSION_ID_ISSUANCE:
      ReceiverState.ws.id = message.sessionId
      console.log(`assigned session id : ${message.sessionId}`)

    case RECEIVER.CHANGE_SENDER_ENTRIES:
      Menu.setSenderEntryList(message.senders)
      break

    case RECEIVER.MEDIA_DEVICE_LIST_RESPONSE:
      Menu.setMediaDeviceList(message)
      break

    case RECEIVER.SDP_OFFER:
      await ReceiverState.pc.setRemoteDescription(new RTCSessionDescription(message.offer))

      const answer = await ReceiverState.pc.createAnswer()
      await ReceiverState.pc.setLocalDescription(answer)

      Utils.sendSignalingMessage(ReceiverState.ws, SENDER.SDP_ANSWER, { answer })
      transferRemoteVideoWorker(answer)
      break

    case RECEIVER.ICE:
      const ice = Utils.parseICE(message.candidate.candidate)
      if (ice) {
        console.log(`>>> ${RECEIVER.ICE} RECEIVER.ICE: ${ice}`)
      } else {
        console.log(`>>> ${RECEIVER.ICE} RECEIVER.ICE: ${message.candidate.candidate}`)
      }
      await ReceiverState.pc.addIceCandidate(new RTCIceCandidate(message.candidate))
      break

    case RECEIVER.SENDER_CLOSE:
      Widgets.destroyReceiver()
      break

    case RECEIVER.SYSTEM_ERROR:
      console.error('Error message type:', message.type)
      break

    default:
      console.error('Unknown receiver message type:', message.type)
  }
}
