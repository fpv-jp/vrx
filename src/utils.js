/** 値が undefined / null / 空文字でないかをチェックする */
const isNonEmpty = (v) => v !== undefined && v !== null && String(v) !== ''

/**
 * navigator.userAgent からブラウザ名とバージョンを "Name/version" 形式で返す
 * @returns {string}
 */
export function parseBrowserInfo() {
  const ua = navigator.userAgent
  const browsers = [
    { name: 'Chrome', regex: /Chrome\/(\d+\.\d+)/ },
    { name: 'Firefox', regex: /Firefox\/(\d+\.\d+)/ },
    { name: 'Safari', regex: /Version\/(\d+\.\d+).*Safari/ },
    { name: 'Edge', regex: /Edg\/(\d+\.\d+)/ },
    { name: 'Opera', regex: /OPR\/(\d+\.\d+)/ },
  ]
  for (const { name, regex } of browsers) {
    const match = ua.match(regex)
    if (match) {
      return `${name}/${match[1]}`
    }
  }
  return 'Unknown'
}

/**
 * WebSocket 経由でシグナリングメッセージを送信する
 * ws の id / pair が揃っていない場合はエラーログを出力する
 * @param {WebSocket} ws
 * @param {number} type - シグナリングメッセージ型番号
 * @param {object} [message={}]
 */
export async function sendSignalingMessage(ws, type, message = {}) {
  let { readyState, protocol, id, pair } = ws
  if (isNonEmpty(id) && isNonEmpty(pair)) {
    if (readyState === WebSocket.OPEN) {
      if (protocol === 'sender') {
        ws.send(type, id, pair, message)
        return
      }
      if (protocol === 'receiver') {
        ws.send(type, pair, id, message)
        return
      }
    }
  }
  console.error('Could not send:', { readyState, protocol, id, pair })
}

/**
 * getUserMedia でパーミッションを取得してからデバイス一覧を返す
 * @param {{ video?: boolean, audio?: boolean }} [option]
 * @returns {Promise<MediaDeviceInfo[]|Error>}
 */
export async function getInputMediaDevicesList(option = { video: true, audio: true }) {
  let stream = null
  try {
    stream = await navigator.mediaDevices.getUserMedia(option)
    let devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter((d) => d.kind.endsWith('input'))
  } catch (error) {
    return error
  } finally {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      stream = null
    }
  }
}

/**
 * Sender または Receiver の RTP コーデック capabilities を取得する
 * @param {'Sender'|'Receiver'} type
 * @param {'video'|'audio'} kind
 * @returns {RTCRtpCapabilities}
 */
export function getCodecs(type = 'Sender', kind = 'video') {
  return type === 'Sender' ? RTCRtpSender.getCapabilities(kind) : RTCRtpReceiver.getCapabilities(kind)
}

/**
 * 対応する映像・音声コーデックを種別でフィルタして返す
 * @param {'Sender'|'Receiver'} [type]
 * @returns {{ video: RTCRtpCodecCapability[], audio: RTCRtpCodecCapability[] }}
 */
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
  return {
    video: getCodecs(type, 'video').codecs.filter((codec) => videoFilter.includes(codec.mimeType)),
    audio: getCodecs(type, 'audio').codecs.filter((codec) => audioFilter.includes(codec.mimeType)),
  }
}

/**
 * トランシーバーに指定コーデックを先頭に並べてコーデック優先順位をセットする
 * @param {RTCRtpTransceiver[]} transceivers
 * @param {string} video_codec - JSON.stringify 済みの映像コーデック
 * @param {string} audio_codec - JSON.stringify 済みの音声コーデック
 * @param {'Sender'|'Receiver'} [type]
 */
export function setCapabilityCodec(transceivers, video_codec, audio_codec, type = 'Sender') {
  const codecs = getCapabilityCodecs(type)

  transceivers.forEach((transceiver) => {
    const kind = type === 'Sender' ? transceiver.sender.track.kind : transceiver.receiver.track.kind

    if (kind === 'video') {
      let video = getCodecs(type, kind)
      const requestVideoCodec = video.codecs.find((c) => JSON.stringify(c) === video_codec)
      if (requestVideoCodec) {
        const otherCodecs = video.codecs.filter((c) => JSON.stringify(c) !== video_codec)
        transceiver.setCodecPreferences([requestVideoCodec, ...otherCodecs])
      }
    }

    if (kind === 'audio') {
      let audio = getCodecs(type, kind)
      const requestAudioCodec = audio.codecs.find((c) => JSON.stringify(c) === audio_codec)
      if (requestAudioCodec) {
        const otherCodecs = audio.codecs.filter((c) => JSON.stringify(c) !== audio_codec)
        transceiver.setCodecPreferences([requestAudioCodec, ...otherCodecs])
      }
    }
  })
}

/**
 * 映像 Sender に high 優先度と最大ビットレート 15Mbps をセットする
 * @param {RTCRtpSender[]} senders
 */
export function setSenderPriority(senders) {
  const sender = senders.find((s) => s.track?.kind === 'video')
  if (!sender) return

  const params = sender.getParameters()
  if (params.encodings.length > 0) {
    params.encodings[0].priority = 'high'
    params.encodings[0].networkPriority = 'high'
    params.encodings[0].maxBitrate = 15 * 1000 * 1000
  }
  sender.setParameters(params).catch((err) => console.warn('setParameters failed:', err))
}

/**
 * 映像トラックを一時的に差し替えることで Sender にキーフレームを要求する
 * @param {RTCPeerConnection} pc
 */
export async function sendKeyFrameRequest(pc) {
  const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
  if (!sender) return
  const original = sender.track
  const clone = original.clone()
  const settings = clone.getSettings()
  clone.applyConstraints({ width: settings.width / 1.05, height: settings.height / 1.05 })
  await sender.replaceTrack(clone)
  await new Promise((r) => setTimeout(r, 100))
  await sender.replaceTrack(original)
}

/**
 * 現在のページが localhost またはプライベート IP から配信されているかを判定する
 * @returns {boolean}
 */
export function isLocalHost() {
  const hostname = location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true
  if (/^(10|172\.(1[6-9]|2[0-9]|3[0-1])|192\.168)\./.test(hostname)) return true
  if (hostname === '[::1]' || /^f[c-d][0-9a-f]{2}(:|$)/i.test(hostname)) return true
  return false
}

/**
 * IPv4 アドレス文字列かどうかを判定する
 * @param {string} address
 * @returns {boolean}
 */
export function isIPv4(address) {
  return /^((25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)$/.test(address)
}

/**
 * ICE candidate 文字列を構造化オブジェクトにパースする
 * @param {string} candidate
 * @returns {object|null}
 */
export function toICE(candidate) {
  const m = candidate.match(/candidate:(\d+) (\d+) (UDP|TCP|udp|tcp) (\d+) ([^\s]+) (\d+) typ (\w+)(?:\s+(.*))?/)
  if (!m) return null

  const result = {
    foundation: m[1],
    component: m[2],
    protocol: m[3].toUpperCase(),
    priority: m[4],
    ip: m[5],
    port: m[6],
    type: m[7],
  }

  if (m[8]) {
    const attrs = m[8].split(/\s+/)
    for (let i = 0; i < attrs.length; i += 2) {
      if (attrs[i] && attrs[i + 1]) {
        result[attrs[i]] = attrs[i + 1]
      }
    }
  }
  return result
}

/**
 * ICE candidate 文字列を "key:value key:value..." 形式の人読み可能な文字列に変換する
 * @param {string} candidate
 * @returns {string|null}
 */
export function parseICE(candidate) {
  const ice = toICE(candidate)
  if (ice) {
    return JSON.stringify(ice).replace('{', '').replace('}', '').replaceAll('"', '').replaceAll(',', ' ')
  }
  return null
}

/**
 * RTCIceCandidate 統計オブジェクトから表示に不要なフィールドを除いたコピーを返す
 * @param {object} candidate
 * @returns {object}
 */
export function excludedCandidate(candidate) {
  const excludedKeys = ['transportId', 'usernameFragment', 'isRemote']
  const excludedValues = ['', 'unknown']
  return Object.fromEntries(
    Object.entries(candidate).filter(([key, value]) => {
      if (excludedKeys.includes(key)) return false
      if (excludedValues.includes(value)) return false
      return true
    }),
  )
}

/**
 * connectionstatechange イベントから RTCPeerConnection の各状態をログ出力して返す
 * @param {Event} e
 * @returns {{ connectionState: string, iceConnectionState: string, iceGatheringState: string, signalingState: string }}
 */
export function stats(e) {
  const { canTrickleIceCandidates, connectionState, iceConnectionState, iceGatheringState, signalingState } = e.currentTarget
  const stats = { canTrickleIceCandidates, connectionState, iceConnectionState, iceGatheringState, signalingState }
  console.log(e.type, stats)
  return stats
}

/**
 * iOS デバイス（iPhone / iPad / iPod）かどうかを判定する
 * @returns {boolean}
 */
export function isIOS() {
  let appleProduct = ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod']
  return appleProduct.includes(navigator.platform) || (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1)
}

/**
 * Wi-Fi 周波数（MHz）からバンドとチャンネル番号を返す
 * 2.4GHz / 5GHz / 6GHz に対応し、該当しない場合は null を返す
 * @param {number|string} freqMHz
 * @returns {{ band: string, channel: number }|null}
 */
export function frequencyToWifiChannel(freqMHz) {
  const f = Number(freqMHz)
  if (!Number.isFinite(f)) return null

  if (f === 2484) {
    return { band: '2.4GHz', channel: 14 }
  }
  if (f >= 2412 && f <= 2472) {
    const ch = Math.round((f - 2407) / 5)
    if (ch >= 1 && ch <= 13 && 2407 + ch * 5 === f) {
      return { band: '2.4GHz', channel: ch }
    }
  }

  if (f >= 5000 && f < 5925) {
    const ch = Math.round((f - 5000) / 5)
    if (5000 + ch * 5 === f) {
      return { band: '5GHz', channel: ch }
    }
  }

  if (f >= 5925 && f <= 7125) {
    const ch = Math.round((f - 5950) / 5)
    if (ch > 0 && 5950 + ch * 5 === f) {
      return { band: '6GHz', channel: ch }
    }
  }

  return null
}

/**
 * 指定 H264 プロファイルで VideoDecoder がスムーズに動作するかを確認する
 * @param {string} profile - profile-level-id 16進数文字列（例: '640028'）
 * @param {number} width
 * @param {number} height
 * @param {number} framerate
 * @param {number} bitrate
 * @returns {Promise<MediaDecodingInfo|null>}
 */
export async function checkH264Profile(profile, width, height, framerate, bitrate) {
  let contentType = `video/H264; profile-level-id=${profile}`
  try {
    const result = await navigator.mediaCapabilities.decodingInfo({
      type: 'webrtc',
      video: { contentType, width, height, bitrate, framerate },
    })
    console.log(`Profile ${profile}:`, JSON.stringify(result))
    return result
  } catch (e) {
    console.log(`Profile ${profile}: Error -`, e.message)
    return null
  }
}

/**
 * フレームレート値を数値に正規化する（"30/1" 形式も対応）
 * @param {number|string} v
 * @returns {number}
 */
export function parseFramerate(v) {
  if (typeof v === 'number') {
    return v
  }
  if (typeof v === 'string' && v.includes('/')) {
    const [numerator, denominator] = v.split('/').map(Number)
    return numerator / denominator
  }
  return Number(v)
}

/**
 * 指定解像度・フレームレートでブラウザが対応できる最良の H264 プロファイル名を返す
 * High → Main → Constrained Baseline → Baseline の順で確認する
 * @param {number} [width=1280]
 * @param {number} [height=720]
 * @param {number} [framerate=30]
 * @param {number} [bitrate=2000000]
 * @returns {Promise<'high'|'main'|'constrained-baseline'|'baseline'|undefined>}
 */
export async function checkDecodingInfo(width = 1280, height = 720, framerate = 30, bitrate = 2000000) {
  framerate = parseFramerate(framerate)
  let result = await checkH264Profile('640028', width, height, framerate, bitrate) // High Level 4.0
  if (result?.smooth) return 'high'
  result = await checkH264Profile('4d001f', width, height, framerate, bitrate) // Main Level 3.1
  if (result?.smooth) return 'main'
  result = await checkH264Profile('42e01f', width, height, framerate, bitrate) // Constrained Baseline Level 3.1
  if (result?.smooth) return 'constrained-baseline'
  result = await checkH264Profile('42001f', width, height, framerate, bitrate) // Baseline Level 3.1
  if (result?.smooth) return 'baseline'
}
