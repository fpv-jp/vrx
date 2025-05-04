import { Muxer as WebMMuxer, ArrayBufferTarget as WebMTarget } from 'webm-muxer'
import { Muxer as MP4Muxer, ArrayBufferTarget as MP4Target } from 'mp4-muxer'

export default (match, width, height, answer) => {
  const codec =
    match.codec.startsWith('avc1') || match.codec.startsWith('avc3')
      ? 'avc' // MP4 (H264/AAC)
      : match.codec.startsWith('hev1') || match.codec.startsWith('hvc1')
        ? 'hevc' // MP4 (H265/AAC)
        : match.codec.startsWith('vp8')
          ? 'V_VP8' // WebM (VP8/Opus)
          : match.codec.startsWith('vp09')
            ? 'V_VP9' // WebM (VP9/Opus)
            : match.codec.startsWith('av01')
              ? 'V_AV1' // WebM (AV1/Opus)
              : match.codec
  let videoOption = { codec, width, height }
  let isWebM = videoOption.codec.startsWith('V_')

  let baseTimestampVideo = null
  let baseTimestampAudio = null
  let encodedVideoChunks = []
  let encodedAudioChunks = []

  let videoDecoderMeta = null

  function isMP4() {
    return !isWebM
  }

  function videoDecoder(frame) {
    videoDecoderMeta = {
      decoderConfig: {
        codec: match.codec,
        codedWidth: frame.codedWidth,
        codedHeight: frame.codedHeight,
        description: frame.description,
        colorSpace: {
          primaries: frame.colorSpace.primaries,
          transfer: frame.colorSpace.transfer,
          matrix: frame.colorSpace.matrix,
          fullRange: frame.colorSpace.fullRange ?? false,
        },
      },
    }
  }

  function addEncodedVideoChunks(frame) {
    let { type, timestamp, data } = frame
    if (baseTimestampVideo === null) baseTimestampVideo = timestamp
    let relTimestamp = timestamp - baseTimestampVideo
    let prev = encodedVideoChunks.at(-1)?.timestamp ?? relTimestamp
    let duration = relTimestamp - prev
    timestamp = relTimestamp * 10
    duration = Math.max(0, duration * 1000)
    let init = { type, timestamp, duration, data }
    encodedVideoChunks.push(new EncodedVideoChunk(init))
  }

  let audioPayloadType

  function addEncodedAudioChunks(frame) {
    audioPayloadType = frame.getMetadata().payloadType
    let { type = 'delta', timestamp, data } = frame
    if (baseTimestampAudio === null) baseTimestampAudio = timestamp
    let relTimestamp = timestamp - baseTimestampAudio
    let prev = encodedAudioChunks.at(-1)?.timestamp ?? relTimestamp
    let duration = relTimestamp - prev
    timestamp = relTimestamp * 10
    duration = Math.max(0, duration * 1000)
    let init = { type, timestamp, duration, data }
    encodedAudioChunks.push(new EncodedAudioChunk(init))
  }

  function sendPostMessage() {
    let target = isWebM
      ? {
          target: new WebMTarget(), //
          video: videoOption,
          audio: getAudioOption(),
          firstTimestampBehavior: 'offset',
        }
      : {
          target: new MP4Target(), //
          video: videoOption,
          audio: getAudioOption(),
          fastStart: 'in-memory',
          firstTimestampBehavior: 'offset',
        }

    let muxer = isWebM ? new WebMMuxer(target) : new MP4Muxer(target)

    if (isWebM) {
      encodedVideoChunks.forEach((chunk) => {
        muxer.addVideoChunk(chunk)
      })
    } else {
      encodedVideoChunks.forEach((chunk) => {
        muxer.addVideoChunk(chunk, videoDecoderMeta)
      })
    }

    encodedAudioChunks.forEach((chunk) => {
      muxer.addAudioChunk(chunk)
    })

    muxer.finalize()

    let type = isWebM ? 'video/webm' : 'video/mp4'
    const blob = new Blob([muxer.target.buffer], { type })
    postMessage({ type: 'recordingData', blob })
  }

  function getAudioOption(payloadType) {
    if (payloadType == null) {
      const mline = answer.sdp.match(/^m=audio\s+\d+\s+\S+\s+(.+)$/m)
      if (mline) {
        const payloadTypes = mline[1].split(/\s+/)
        payloadType = parseInt(payloadTypes[0], 10)
      }
    }

    if (payloadType == null || Number.isNaN(payloadType)) {
      console.warn('No valid payloadType found in SDP')
      return null
    }

    const regex = new RegExp(`a=rtpmap:${audioPayloadType} ([^/]+)/([0-9]+)/?([0-9]*)`)
    const match = answer.sdp.match(regex)
    if (!match) return undefined

    let codec = match[1].toLowerCase()
    if (videoOption.codec.startsWith('V_')) {
      codec = codec.startsWith('opus')
        ? 'A_OPUS' //
        : codec.startsWith('vorbis')
          ? 'A_VORBIS'
          : codec
    }

    const sampleRate = parseInt(match[2], 10)
    const numberOfChannels = parseInt(match[3] || '1', 10)
    return { codec, sampleRate, numberOfChannels }
  }

  return { isMP4, videoDecoder, addEncodedVideoChunks, addEncodedAudioChunks, sendPostMessage }
}
