const PostMessageType = Object.freeze({
  RemoteVideo: 'RemoteVideo',
  KeyFrame: 'KeyFrame',
  Offer: 'Offer',
  Terminate: 'Terminate',
  StartRecord: 'StartRecord',
  StopRecord: 'StopRecord',
  RecordFrame: 'RecordFrame',
})

let offer, answer
let RemoteVideo, RemoteVideoContext, pixelRatio
let rendering = false
let isRecording = false
let currentDisplayWidth = 0
let currentDisplayHeight = 0

// PC1 Encoder

const videoEncoder = new VideoEncoder({
  output(chunk, metadata) {
    if (metadata?.decoderConfig?.description) {
      // const description = new Uint8Array(metadata.decoderConfig.description)
    }
  },
  error: (e) => console.error('VideoEncoder error:', e),
})

/**
 * Sender 側の映像フレームをそのままエンキューする TransformStream コールバック
 * @param {RTCEncodedVideoFrame} frame
 * @param {TransformStreamDefaultController} controller
 */
const encodeVideo = (frame, controller) => {
  if (frame.type === 'key') {
    const { width, height, payloadType } = frame.getMetadata()
    console.log(`Encoder keyFrame: ${width}x${height} payloadType:${payloadType}`)
  }

  controller.enqueue(frame)
}

/**
 * Sender 側の音声フレームをそのままエンキューする TransformStream コールバック
 * @param {RTCEncodedAudioFrame} frame
 * @param {TransformStreamDefaultController} controller
 */
const encodeAudio = (frame, controller) => {
  controller.enqueue(frame)
}

// PC2 Decoder

const videoDecoder = new VideoDecoder({
  output: async (frame) => {
    const recordFrame = isRecording ? frame.clone() : null
    const { displayWidth, displayHeight } = frame

    if (rendering) {
      frame.close()
    } else {
      rendering = true
      let bitmap
      try {
        bitmap = await createImageBitmap(frame)
      } catch (e) {
        console.error('VideoDecoder render error:', e)
      } finally {
        frame.close()
        rendering = false
      }
      if (bitmap) {
        if (displayWidth !== currentDisplayWidth || displayHeight !== currentDisplayHeight) {
          currentDisplayWidth = displayWidth
          currentDisplayHeight = displayHeight
          RemoteVideo.width = displayWidth
          RemoteVideo.height = displayHeight
          postMessage({ type: PostMessageType.KeyFrame, width: displayWidth, height: displayHeight })
        }
        RemoteVideoContext.transferFromImageBitmap(bitmap)
        bitmap.close()
      }
    }

    if (recordFrame) {
      postMessage({ type: PostMessageType.RecordFrame, frame: recordFrame }, [recordFrame])
    }
  },
  error: (e) => console.error('VideoDecoder error:', e),
})

/**
 * Receiver 側の映像フレームを VideoDecoder でデコードする TransformStream コールバック
 * キーフレーム受信時に SDP から codec 文字列を推定して VideoDecoder を再設定する
 * @param {RTCEncodedVideoFrame} frame
 * @param {TransformStreamDefaultController} controller
 */
const decodeVideo = (frame, controller) => {
  if (frame.type === 'key') {
    const { mimeType, payloadType } = frame.getMetadata()
    const codec = inferCodecString(answer.sdp, mimeType, payloadType)
    try {
      videoDecoder.configure({ codec })
    } catch (err) {
      console.error(err)
    }
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

/**
 * Receiver 側の音声フレームをそのままエンキューする TransformStream コールバック
 * @param {RTCEncodedAudioFrame} frame
 * @param {TransformStreamDefaultController} controller
 */
const decodeAudio = (frame, controller) => {
  controller.enqueue(frame)
}

/**
 * Worker に届くすべてのメッセージを処理する
 * options 付きメッセージは EncodedStreams を TransformStream にパイプし、
 * type 付きメッセージは PostMessageType に応じて状態を更新する
 * @param {object|RTCTransformEvent} data
 */
async function onPostMessage(data) {
  // Initilize
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
    // RemoteVideo
    case PostMessageType.RemoteVideo:
      RemoteVideo = data.offscreen
      RemoteVideoContext = data.offscreen.getContext('bitmaprenderer')
      answer = data.answer
      pixelRatio = data.devicePixelRatio
      break
    // Offer
    case PostMessageType.Offer:
      offer = data.offer
      break
    // StartRecord
    case PostMessageType.StartRecord:
      isRecording = true
      break
    // StopRecord
    case PostMessageType.StopRecord:
      isRecording = false
      break
    // Terminate
    case PostMessageType.Terminate:
      isRecording = false
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

/**
 * SDP と RTP ペイロードタイプから WebCodecs 用の codec 文字列を推定する
 * H264 / H265 / VP9 / VP8 / AV1 に対応し、fmtp パラメータから詳細を読み取る
 * @param {string} sdp - SDP 文字列
 * @param {string} mimeType - RTP mimeType（例: "video/H264"）
 * @param {number} payloadType
 * @returns {string|null}
 */
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
