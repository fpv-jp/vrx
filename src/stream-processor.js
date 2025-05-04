import StreamRecorder from './stream-recorder.js'

let offer, answer
let RemoteVideo, RemoteVideoCtx, devicePixelRatio

// VideoEncoder
const videoEncoder = new VideoEncoder({
  output(chunk, metadata) {
    if (chunk.type === 'key' && metadata?.decoderConfig?.description) {
      const description = new Uint8Array(metadata.decoderConfig.description)
      postMessage({
        type: 'sps/pps',
        description: Array.from(description),
        colorSpace: metadata.decoderConfig.colorSpace,
      })
    }
  },
  error: console.error,
})

// Encode Video
const encodeVideo = (frame, controller) => {
  if (frame.type === 'key') {
    const { width, height, payloadType } = frame.getMetadata()
    const codec = getVideoPayloadString(offer.sdp, payloadType).codec
    videoEncoder.configure({ codec, width, height, avc: { format: 'avc' } })
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')
    ctx.fillRect(0, 0, width, height)
    canvas
      .convertToBlob({ type: 'image/webp' })
      .then((blob) => createImageBitmap(blob))
      .then((bitmap) => {
        const vframe = new VideoFrame(bitmap, { timestamp: 0 })
        videoEncoder.encode(vframe)
        vframe.close()
      })
  }
  controller.enqueue(frame)
}

// Encode Audio
const encodeAudio = (frame, controller) => {
  controller.enqueue(frame)
}

let streamRecorder
let isRecording = false

// VideoDecoder
const videoDecoder = new VideoDecoder({
  output: (frame) => {
    if (streamRecorder && !streamRecorder.isMP4()) streamRecorder.videoDecoder(frame)
    RemoteVideoCtx.drawImage(frame, 0, 0, RemoteVideo.width / devicePixelRatio, RemoteVideo.height / devicePixelRatio)
    frame.close()
  },
  error: (e) => console.error('VideoDecoder error:', e),
})

// Decode Video
const decodeVideo = (frame, controller) => {
  const metadata = frame.getMetadata()

  if (frame.type === 'key') {
    const { width, height } = metadata
    RemoteVideo.width = width * devicePixelRatio
    RemoteVideo.height = height * devicePixelRatio

    const match = getVideoPayloadString(answer.sdp, metadata.payloadType)
    videoDecoder.configure({ codec: match.codec })

    postMessage({ type: 'keyFrame', metadata, payloadString: match.payloadString, isRecording })
    RemoteVideoCtx.scale(devicePixelRatio, devicePixelRatio)

    if (isRecording) {
      streamRecorder = StreamRecorder(match, width, height, answer)
    }
  }

  let { type, timestamp, data } = frame
  const chunk = new EncodedVideoChunk({ type, timestamp, data })

  if (streamRecorder && !streamRecorder.isMP4()) streamRecorder.addEncodedVideoChunks(frame)

  videoDecoder.decode(chunk)
  controller.enqueue(frame)
}

// Decode Audio
// ------------------
const decodeAudio = (frame, controller) => {
  if (streamRecorder && !streamRecorder.isMP4()) streamRecorder.addEncodedAudioChunks(frame)
  controller.enqueue(frame)
}

// -------------------------------
async function handleTransform(data) {
  if (data.type === 'RemoteVideo') {
    RemoteVideo = data.offscreen
    RemoteVideoCtx = data.offscreen.getContext('2d')
    // RemoteVideoCtx.imageSmoothingQuality = 'high'
    // RemoteVideoCtx.mozImageSmoothingEnabled = true
    // RemoteVideoCtx.webkitImageSmoothingEnabled = true
    // RemoteVideoCtx.msImageSmoothingEnabled = true
    // RemoteVideoCtx.imageSmoothingEnabled = true
    answer = data.answer
    devicePixelRatio = data.devicePixelRatio
  } else if (data.type === 'clear') {
    RemoteVideoCtx.clearRect(0, 0, RemoteVideo.width, RemoteVideo.height)
  } else if (data.type === 'sps/pps') {
    description = data.description
    colorSpace = data.colorSpace
  } else if (data.type === 'StartRecording') {
    isRecording = true
  } else if (data.type === 'StopRecording') {
    if (streamRecorder && !streamRecorder.isMP4()) streamRecorder.sendPostMessage()
    streamRecorder = null
    isRecording = false
  } else if (data.type === 'offer') {
    offer = data.offer
  } else if (data.options) {
    let { options, readable, writable } = data
    if (options.type === 'encode') {
      let transform = options.kind === 'video' ? encodeVideo : encodeAudio
      readable.pipeThrough(new TransformStream({ transform })).pipeTo(writable)
    } else if (options.type === 'decode') {
      let transform = options.kind === 'video' ? decodeVideo : decodeAudio
      readable.pipeThrough(new TransformStream({ transform })).pipeTo(writable)
    }
  } else {
    console.log(data)
  }
}

// Chrome
onmessage = ({ data }) => handleTransform(data)

// Safari,Firefox
if (self.RTCTransformEvent) {
  self.onrtctransform = ({ transformer }) => handleTransform(transformer)
}

// Video Payload String
function getVideoPayloadString(sdp, payloadType) {
  if (payloadType == null) {
    const mline = sdp.match(/^m=video\s+\d+\s+\S+\s+(.+)$/m)
    if (mline) {
      const payloadTypes = mline[1].split(/\s+/)
      payloadType = parseInt(payloadTypes[0], 10)
    }
  }
  if (payloadType == null || Number.isNaN(payloadType)) {
    console.warn('No valid payloadType found in SDP')
    return null
  }
  let match
  match = sdp.match(new RegExp(`a=fmtp:${payloadType} .*profile-level-id=([0-9a-fA-F]+)`))
  if (match) return { codec: `avc1.${match[1].toLowerCase()}`, payloadString: match[0] }
  match = sdp.match(new RegExp(`a=rtpmap:${payloadType} H264/`))
  if (match) return { codec: 'avc3.42e01f', payloadString: match[0] }
  match = sdp.match(new RegExp(`a=fmtp:${payloadType} .*sprop-vps=`))
  if (match) return { codec: 'hev1.1.6.L93.B0', payloadString: match[0] }
  match = sdp.match(new RegExp(`a=rtpmap:${payloadType} H265/`))
  if (match) return { codec: 'hvc1.1.6.L93.B0', payloadString: match[0] }
  match = sdp.match(new RegExp(`a=rtpmap:${payloadType} VP9/`))
  if (match) return { codec: 'vp09.00.10.08', payloadString: match[0] }
  match = sdp.match(new RegExp(`a=rtpmap:${payloadType} VP8/`))
  if (match) return { codec: 'vp8', payloadString: match[0] }
  match = sdp.match(new RegExp(`a=rtpmap:${payloadType} AV1X/`))
  if (match) return { codec: 'av01.0.08M.08', payloadString: match[0] }
  match = sdp.match(new RegExp(`a=rtpmap:${payloadType} AV1/`))
  if (match) return { codec: 'av01.0.08M.08', payloadString: match[0] }
  return null
}
