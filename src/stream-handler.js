// Hooks encoding and decoding
// --------------------------------------------------------------------------------------------
const StreamHandler = new Worker(new URL('./stream-processor.js', import.meta.url), {
  type: 'module',
  name: 'Encode/Decode worker',
})

StreamHandler.onerror = (e) => console.error('StreamHandler load error:', e.message)
StreamHandler.onmessage = (e) => console.log('StreamHandler message:', e.data)

// encode
export function setupSenderTransform(sender) {
  let options = { type: 'encode', kind: sender.track.kind }
  if (window.RTCRtpScriptTransform) {
    // Safari, Firefox
    sender.transform = new RTCRtpScriptTransform(StreamHandler, options)
  } else {
    // Chrome
    const { readable, writable } = sender.createEncodedStreams()
    StreamHandler.postMessage({ options, readable, writable }, [readable, writable])
  }
}

// decode
export function setupReceiverTransform(receiver) {
  let options = { type: 'decode', kind: receiver.track.kind }
  if (window.RTCRtpScriptTransform) {
    // Safari, Firefox
    receiver.transform = new RTCRtpScriptTransform(StreamHandler, options)
  } else {
    // Chrome
    const { readable, writable } = receiver.createEncodedStreams()
    StreamHandler.postMessage({ options, readable, writable }, [readable, writable])
  }
}

export default StreamHandler
