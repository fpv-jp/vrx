export const PostMessageType = Object.freeze({
  RemoteVideo: 'RemoteVideo',
  KeyFrame: 'KeyFrame',
  Offer: 'Offer',
  Terminate: 'Terminate',
  StartRecord: 'StartRecord',
  StopRecord: 'StopRecord',
  RecordFrame: 'RecordFrame',
})

// Hooks encoding and decoding
// --------------------------------------------------------------------------------------------
const StreamHandler = new Worker(new URL('./processor.js', import.meta.url), {
  type: 'module',
  name: 'Encode/Decode worker',
})

StreamHandler.onerror = (e) => console.error('StreamHandler load error:', e.message)
StreamHandler.addEventListener('message', ({ data }) => {
  if (data.type !== PostMessageType.RecordFrame && data.type !== PostMessageType.KeyFrame) {
    console.log('StreamHandler message:', data)
  }
})

// encode
export function senderEncodeTransform(sender) {
  let options = { process: 'encode', kind: sender.track.kind }
  if (window.RTCRtpScriptTransform) {
    sender.transform = new RTCRtpScriptTransform(StreamHandler, options)
  } else {
    const { readable, writable } = sender.createEncodedStreams()
    StreamHandler.postMessage(
      {
        //
        options,
        readable,
        writable,
      },
      [readable, writable],
    )
  }
}

// decode
export function receiverDecodeTransform(receiver) {
  let options = { process: 'decode', kind: receiver.track.kind }
  if (window.RTCRtpScriptTransform) {
    receiver.transform = new RTCRtpScriptTransform(StreamHandler, options)
  } else {
    const { readable, writable } = receiver.createEncodedStreams()
    StreamHandler.postMessage(
      {
        //
        options,
        readable,
        writable,
      },
      [readable, writable],
    )
  }
}

export default StreamHandler
