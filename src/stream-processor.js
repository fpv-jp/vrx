const PostMessageType = Object.freeze({
  RemoteVideo: 'RemoteVideo',
  KeyFrame: 'KeyFrame',
  Offer: 'Offer',
  Terminate: 'Terminate',
})

let offer, answer
let RemoteVideo, RemoteVideoContext2D, pixelRatio

//--------------------------------------------------------------------------
// PC1 Encoder
//--------------------------------------------------------------------------

// --- Sender VideoEncoder ----------------------------
const videoEncoder = new VideoEncoder({
  output(chunk, metadata) {
    if (metadata?.decoderConfig?.description) {
      // const description = new Uint8Array(metadata.decoderConfig.description)
    }
  },
  error: (e) => console.error('VideoEncoder error:', e),
})

// --- Sender Encode Video ----------------------------
const encodeVideo = (frame, controller) => {
  if (frame.type === 'key') {
    const { width, height, payloadType } = frame.getMetadata()
    console.log(`Encoder keyFrame: ${width}x${height} payloadType:${payloadType}`)
  }

  controller.enqueue(frame)
}

// --- Sender Encode Audio ----------------------------
const encodeAudio = (frame, controller) => {
  controller.enqueue(frame)
}

//--------------------------------------------------------------------------
// PC2 Decoder
//--------------------------------------------------------------------------

// --- Receiver VideoDecoder ----------------------------
const videoDecoder = new VideoDecoder({
  output: (frame) => {
    // RemoteVideoContext2D.drawImage(frame, 0, 0, RemoteVideo.width / pixelRatio, RemoteVideo.height / pixelRatio)
    RemoteVideoContext2D.drawImage(frame, 0, 0, RemoteVideo.width, RemoteVideo.height)
    frame.close()
  },
  error: (e) => console.error('VideoDecoder error:', e),
})

// --- Receiver Decode Video ----------------------------
const decodeVideo = (frame, controller) => {
  if (frame.type === 'key') {
    const { width, height, mimeType, payloadType } = frame.getMetadata()

    const codec = inferCodecString(answer.sdp, mimeType, payloadType)
    // console.log(`Decode keyFrame: ${mimeType} ${width}x${height} ${codec}`)
    try {
      videoDecoder.configure({ codec })
    } catch (err) {
      console.error(err)
    }

    // RemoteVideo.width = width * pixelRatio
    // RemoteVideo.height = height * pixelRatio
    RemoteVideo.width = width
    RemoteVideo.height = height

    postMessage({
      //
      type: PostMessageType.KeyFrame,
      width,
      height,
      mimeType,
      payloadType,
      codec,
    })

    // RemoteVideoContext2D.scale(pixelRatio, pixelRatio)
  }

  let { type, timestamp, data } = frame
  const chunk = new EncodedVideoChunk({ type, timestamp, data })

  try {
    videoDecoder.decode(chunk)
  } catch (err) {
    console.error(err)
  }
  controller.enqueue(frame)
}

// --- Receiver Decode Audio ----------------------------
const decodeAudio = (frame, controller) => {
  controller.enqueue(frame)
}

//--------------------------------------------------------------------------
// onPostMessage
//--------------------------------------------------------------------------
async function onPostMessage(data) {
  // --- Initilize -------------------------
  if (data.options) {
    let { options, readable, writable } = data
    if (options.process === 'encode') {
      let transform = options.kind === 'video' ? encodeVideo : encodeAudio
      readable.pipeThrough(new TransformStream({ transform })).pipeTo(writable)
    } else if (options.process === 'decode') {
      let transform = options.kind === 'video' ? decodeVideo : decodeAudio
      readable.pipeThrough(new TransformStream({ transform })).pipeTo(writable)
    }
    return
  }

  switch (data.type) {
    // --- RemoteVideo -------------------------
    case PostMessageType.RemoteVideo:
      RemoteVideo = data.offscreen
      RemoteVideoContext2D = data.offscreen.getContext('2d')
      // RemoteVideoContext2D.imageSmoothingQuality = 'high'
      // RemoteVideoContext2D.mozImageSmoothingEnabled = true
      // RemoteVideoContext2D.webkitImageSmoothingEnabled = true
      // RemoteVideoContext2D.msImageSmoothingEnabled = true
      // RemoteVideoContext2D.imageSmoothingEnabled = true
      answer = data.answer
      pixelRatio = data.devicePixelRatio
      break
    // --- Offer -------------------------
    case PostMessageType.Offer:
      offer = data.offer
      break
    // --- Terminate -------------------------
    case PostMessageType.Terminate:
      // if (RemoteVideo) {
      //   RemoteVideo.clearRect(0, 0, RemoteVideo.width, RemoteVideo.height)
      // }
      break

    default:
      console.log('unknown PostMessageType ', data)
  }
}

// Old Chrome
onmessage = ({ data }) => onPostMessage(data)

if (self.RTCTransformEvent) {
  self.onrtctransform = ({ transformer }) => onPostMessage(transformer)
}

//--------------------------------------------------------------------------
// inferCodecString
//--------------------------------------------------------------------------
function inferCodecString(sdp, mimeType, payloadType) {
  const codec = mimeType.replace(/^video\//i, '').toUpperCase()
  const lines = sdp.split('\n')
  const fmtpLine = lines.find((l) => l.startsWith(`a=fmtp:${payloadType}`))
  const rtpmapLine = lines.find((l) => l.startsWith(`a=rtpmap:${payloadType}`))

  switch (codec) {
    case 'H264': {
      // profile-level-id を取得（必須）
      const match = fmtpLine?.match(/profile-level-id=([0-9a-fA-F]{6})/)
      if (match) {
        const profileLevelId = match[1].toLowerCase()
        // console.log(`H264: Using profile-level-id=${profileLevelId}`)
        return `avc1.${profileLevelId}`
      }
      // フォールバック: Baseline Profile, Level 3.1（最も互換性が高い）
      console.warn('H264: profile-level-id not found, using Baseline Profile fallback')
      return 'avc1.42e01f'
    }

    case 'H265':
    case 'HEVC': {
      // profile-id, tier-flag, level-id を取得
      const profileMatch = fmtpLine?.match(/profile-id=(\d+)/)
      const tierMatch = fmtpLine?.match(/tier-flag=(\d+)/)
      const levelMatch = fmtpLine?.match(/level-id=(\d+)/)

      // sprop-vps があれば hvc1、なければ hev1
      const hasVPS = fmtpLine?.includes('sprop-vps=')
      const prefix = hasVPS ? 'hvc1' : 'hev1'

      if (profileMatch && levelMatch) {
        const profile = profileMatch[1]
        const tier = tierMatch ? tierMatch[1] : '0'
        const level = levelMatch[1]
        // console.log(`H265: Using profile=${profile}, tier=${tier}, level=${level}`)
        // 例: hvc1.1.6.L93.B0 → profile=1, tier=0(Main), level=93(Level 3.1)
        return `${prefix}.${profile}.6.L${level}.B${tier}`
      }

      // フォールバック: Main Profile, Main Tier, Level 3.1
      // console.warn('H265: Parameters not found, using Main Profile fallback')
      return `${prefix}.1.6.L93.B0`
    }

    case 'VP9': {
      // profile-id (0-3), level-idx, bit-depth を取得
      const profileMatch = fmtpLine?.match(/profile-id=(\d+)/)
      const levelMatch = fmtpLine?.match(/level-idx=(\d+)/)
      const bitDepthMatch = fmtpLine?.match(/bit-depth=(\d+)/)

      const profile = profileMatch ? profileMatch[1].padStart(2, '0') : '00'
      const level = levelMatch ? levelMatch[1].padStart(2, '0') : '10'
      const bitDepth = bitDepthMatch ? bitDepthMatch[1].padStart(2, '0') : '08'

      // console.log(`VP9: profile=${profile}, level=${level}, bitDepth=${bitDepth}`)
      return `vp09.${profile}.${level}.${bitDepth}`
    }

    case 'VP8': {
      // VP8 は固定で問題なし
      return 'vp8'
    }

    case 'AV1':
    case 'AV1X': {
      // profile, level, tier, bitDepth を取得
      const profileMatch = fmtpLine?.match(/profile=(\d+)/)
      const levelMatch = fmtpLine?.match(/level-idx=(\d+)/)
      const tierMatch = fmtpLine?.match(/tier=(\d+)/)

      const profile = profileMatch ? profileMatch[1] : '0'
      const tier = tierMatch ? tierMatch[1] : '0'

      // Level mapping (level-idx から文字列へ)
      const levelMap = {
        0: '2.0',
        1: '2.1',
        2: '2.2',
        3: '2.3',
        4: '3.0',
        5: '3.1',
        6: '3.2',
        7: '3.3',
        8: '4.0',
        9: '4.1',
        10: '4.2',
        11: '4.3',
      }
      const levelIdx = levelMatch ? levelMatch[1] : '8'
      const level = levelMap[levelIdx] || '08M'

      // console.log(`AV1: profile=${profile}, tier=${tier}, level=${level}`)
      return `av01.${profile}.${level.replace('.', '')}${tier === '1' ? 'H' : 'M'}.08`
    }

    default: {
      console.error(`Unknown codec: ${codec}`)
      return null
    }
  }
}
