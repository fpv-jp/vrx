// Get sender camera and microphone list
// --------------------------------------------------------------------------------------------
export async function getMediaDevicesList(option = { video: true, audio: true }) {
  let stream = null
  try {
    stream = await navigator.mediaDevices.getUserMedia(option)
    return await navigator.mediaDevices.enumerateDevices()
  } catch (error) {
    return error
  } finally {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      stream = null
    }
  }
}

// Gets the available codecs
// --------------------------------------------------------------------------------------------
export function getCapabilityCodecs(type = 'Sender') {
  let videoFilter = [
    'video/VP9', //
    'video/VP8',
    'video/H264',
    'video/H265',
    'video/AV1',
  ]
  let audioFilter = [
    'audio/opus', //
    'audio/PCMU',
  ]
  let video = type === 'Sender' ? RTCRtpSender.getCapabilities('video') : RTCRtpReceiver.getCapabilities('video')
  let audio = type === 'Sender' ? RTCRtpSender.getCapabilities('audio') : RTCRtpReceiver.getCapabilities('audio')
  return {
    video: video.codecs.filter((codec) => videoFilter.includes(codec.mimeType)),
    audio: audio.codecs.filter((codec) => audioFilter.includes(codec.mimeType)),
  }
}

// Gets the available codecs
// --------------------------------------------------------------------------------------------
export function getAllowNegotiationCodecs(sender, receiver) {
  const compareSdpFmtpLines = (senderLine, receiverLine) => {
    const parseParams = (line = '') =>
      Object.fromEntries(
        line
          .toLowerCase()
          .split(';')
          .map((entry) => {
            const [k, v] = entry.trim().split('=')
            return [k, v ?? '']
          })
          .filter(([k]) => k),
      )

    const defaults = { 'packetization-mode': '0' }
    const senderParams = { ...defaults, ...parseParams(senderLine) }
    const receiverParams = { ...defaults, ...parseParams(receiverLine) }

    const importantKeys = ['packetization-mode', 'profile-level-id']

    for (const key of importantKeys) {
      const a = senderParams[key]
      const b = receiverParams[key]
      if (a && b && a !== b) {
        return false
      }
    }

    return true
  }

  const matchCodecs = (rcList, scList) =>
    rcList.filter((rc) => {
      const scCandidates = scList.filter((sc) => sc.mimeType.toLowerCase() === rc.mimeType.toLowerCase())
      if (scCandidates.length === 0) return false
      return scCandidates.some((sc) => compareSdpFmtpLines(sc.sdpFmtpLine, rc.sdpFmtpLine))
    })

  return {
    video: matchCodecs(receiver.video, sender.video),
    audio: matchCodecs(receiver.audio, sender.audio),
  }
}

// Change the codec priority
// --------------------------------------------------------------------------------------------
export function preferredCodecs(transceivers, connectionParams) {
  transceivers.forEach((transceiver) => {
    const kind = transceiver.receiver.track.kind
    const target = JSON.parse(kind === 'video' ? connectionParams.videocodec : connectionParams.audiocodec)
    const codecs = RTCRtpReceiver.getCapabilities(kind).codecs

    const targetJson = JSON.stringify(target)
    const preferred = codecs.find((c) => JSON.stringify(c) === targetJson)
    const reordered = preferred
      ? [
          preferred, //
          ...codecs.filter((c) => JSON.stringify(c) !== targetJson),
        ]
      : codecs // fallback to original order if not found
    transceiver.setCodecPreferences(reordered)
  })
}

// Fix the codec to H264
// --------------------------------------------------------------------------------------------
// 42001f	Baseline Profile
// 42e01f	Constrained Baseline Profile
// 4d001f	Main Profile
// f4001f	High Profile
// 64001f	High Profile (Level 3.1)
export function fixedCodecH264(transceivers, profileLevelId = '42001f', packetizationMode = '1') {
  transceivers.forEach((transceiver) => {
    const kind = transceiver.receiver.track.kind
    // const codecs = RTCRtpSender.getCapabilities(kind).codecs
    const codecs = RTCRtpReceiver.getCapabilities(kind).codecs
    let filteredCodecs
    if (kind === 'video') {
      filteredCodecs = codecs.filter(
        (codec) =>
          codec.mimeType === 'video/H264' && //
          codec.sdpFmtpLine.includes(`profile-level-id=${profileLevelId}`) && //
          codec.sdpFmtpLine.includes(`packetization-mode=${packetizationMode}`), //
      )
    } else if (kind === 'audio') {
      filteredCodecs = codecs.filter((codec) => codec.mimeType === 'audio/opus')
    }
    transceiver.setCodecPreferences(filteredCodecs)
  })
}

// Sender network priority
// --------------------------------------------------------------------------------------------
export function setSenderPriority(pc1) {
  const sender = pc1.getSenders().find((s) => s.track?.kind === 'video')
  if (!sender) return

  const params = sender.getParameters()
  if (params.encodings.length > 0) {
    params.encodings[0].priority = 'high'
    params.encodings[0].networkPriority = 'high'
    params.encodings[0].maxBitrate = 15 * 1000 * 1000
  }
  sender.setParameters(params).catch((err) => console.warn('setParameters failed:', err))
}

// KeyFrame Request
// --------------------------------------------------------------------------------------------
export async function sendKeyFrameRequest(pc1) {
  const sender = pc1.getSenders().find((s) => s.track?.kind === 'video')
  if (!sender) return
  const original = sender.track
  const clone = original.clone()
  const settings = clone.getSettings()
  clone.applyConstraints({ width: settings.width / 1.05, height: settings.height / 1.05 })
  await sender.replaceTrack(clone)
  await new Promise((r) => setTimeout(r, 100))
  await sender.replaceTrack(original)
}

export function isLocalHost() {
  const hostname = location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true
  if (/^(10|172\.(1[6-9]|2[0-9]|3[0-1])|192\.168)\./.test(hostname)) return true
  if (hostname === '[::1]' || /^f[c-d][0-9a-f]{2}(:|$)/i.test(hostname)) return true
  return false
}

export function isIPv4(address) {
  return /^((25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)$/.test(address)
}

export function toICE(candidate) {
  const m = candidate.match(/candidate:(\d+) (\d+) (udp|tcp) (\d+) ([^\s]+) (\d+) typ (\w+)/)
  if (!m) return null
  return {
    foundation: m[1],
    component: m[2],
    protocol: m[3],
    priority: m[4],
    ip: m[5],
    port: m[6],
    type: m[7],
  }
}
