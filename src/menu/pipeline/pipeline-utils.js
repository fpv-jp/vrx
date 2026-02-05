import * as Utils from '../../utils.js'

export const video_priority = 'high'
export const audio_priority = 'high'
export const video_payload_type = 96
export const audio_payload_type = 97

/** GStreamer パイプライン文字列をビルダーパターンで組み立てるクラス */
export class Pipeline {
  /**
   * @param {string} [base] - 先頭要素（`...` プレースホルダーを含む場合あり）
   */
  constructor(base) {
    this.parts = []
    if (base) {
      this.parts.push(base.trim())
    }
    this.hasPlaceholder = this.parts[0]?.includes('...')
  }

  /**
   * 新しい Pipeline インスタンスを生成するファクトリメソッド
   * @param {string} base
   * @returns {Pipeline}
   */
  static start(base) {
    return new Pipeline(base)
  }

  /**
   * パイプライン要素を追加する
   * @param {string} part
   * @returns {Pipeline}
   */
  add(part) {
    if (!part) return this
    const trimmed = part.trim()
    if (!trimmed) return this
    this.parts.push(trimmed)
    return this
  }

  /**
   * caps フィルター要素を追加する（`...` プレースホルダーがあれば置換）
   * @param {string} value
   * @returns {Pipeline}
   */
  caps(value) {
    if (!value) return this
    if (this.hasPlaceholder && this.parts.length > 0) {
      this.parts[0] = this.parts[0].replace('...', value)
      this.hasPlaceholder = false
      return this
    }
    return this.add(value)
  }

  /**
   * 名前付き GStreamer 要素を追加する
   * @param {string} name - 要素名
   * @param {string} [props] - プロパティ文字列
   * @returns {Pipeline}
   */
  elem(name, props) {
    return this.add(props ? `${name} ${props}` : name)
  }

  /**
   * queue 要素を追加する
   * @param {string} [props]
   * @returns {Pipeline}
   */
  queue(props = 'max-size-buffers=1 leaky=downstream') {
    return this.elem('queue', props)
  }

  /** videoconvert 要素を追加する */
  videoconvert() {
    return this.add('videoconvert')
  }

  /** audioconvert 要素を追加する */
  audioconvert() {
    return this.add('audioconvert')
  }

  /** audioresample 要素を追加する */
  audioresample() {
    return this.add('audioresample')
  }

  /** h264parse 要素を追加する */
  h264parse() {
    return this.add('h264parse')
  }

  /** h265parse 要素を追加する */
  h265parse() {
    return this.add('h265parse')
  }

  /** av1parse 要素を追加する */
  av1parse() {
    return this.add('av1parse')
  }

  /** vp9parse 要素を追加する */
  vp9parse() {
    return this.add('vp9parse')
  }

  /**
   * rtph264pay 要素を追加する
   * @param {string} [props]
   * @returns {Pipeline}
   */
  rtph264pay(props) {
    return this.elem('rtph264pay', props)
  }

  /**
   * rtph265pay 要素を追加する
   * @param {string} [props]
   * @returns {Pipeline}
   */
  rtph265pay(props) {
    return this.elem('rtph265pay', props)
  }

  /**
   * rtpav1pay 要素を追加する
   * @param {string} [props]
   * @returns {Pipeline}
   */
  rtpav1pay(props) {
    return this.elem('rtpav1pay', props)
  }

  /**
   * rtpvp8pay 要素を追加する
   * @param {string} [props]
   * @returns {Pipeline}
   */
  rtpvp8pay(props) {
    return this.elem('rtpvp8pay', props)
  }

  /**
   * rtpvp9pay 要素を追加する
   * @param {string} [props]
   * @returns {Pipeline}
   */
  rtpvp9pay(props) {
    return this.elem('rtpvp9pay', props)
  }

  /**
   * rtpopuspay 要素を追加する
   * @param {string} [props]
   * @returns {Pipeline}
   */
  rtpopuspay(props) {
    return this.elem('rtpopuspay', props)
  }

  /**
   * rtppcmupay 要素を追加する
   * @param {string} [props]
   * @returns {Pipeline}
   */
  rtppcmupay(props) {
    return this.elem('rtppcmupay', props)
  }

  /**
   * RTP caps 文字列を追加する
   * @param {string} value
   * @returns {Pipeline}
   */
  rtpCaps(value) {
    return this.add(value)
  }

  /** ` ! ` 区切りのパイプライン文字列を返す */
  toString() {
    return this.parts.join(' ! \n')
  }
}

/**
 * フレームレート値を GStreamer caps 形式 "N/1" に変換する
 * @param {number|string} v
 * @returns {string}
 */
function framerate(v) {
  if (typeof v === 'string' && v.includes('/')) {
    return v
  } else if (!isNaN(Number(v))) {
    return `${Math.round(Number(v))}/1`
  } else {
    return `${v}/1`
  }
}

/**
 * Alpine ストアの選択値を GStreamer video caps 文字列に埋め込んで返す
 * `{}` / `[]` で囲まれたプレースホルダーを実値に置換する
 * @param {object} P - Alpine.store('menu') のスナップショット
 * @returns {string}
 */
export function embeddedVideo(P) {
  const replacers = [
    { key: 'format', value: P.video_format },
    { key: 'drm-format', value: P.video_drm_format },
    { key: 'width', value: P.video_width },
    { key: 'height', value: P.video_height },
    { key: 'framerate', value: framerate(P.video_framerate) },
  ]

  let base = P.video_capture

  for (const { key, value } of replacers) {
    if (value === undefined) continue
    const regex = new RegExp(`${key}=([\\{\\[].*?[\\}\\]])`, 'i')
    base = base.replace(regex, `${key}=${value}`)
  }

  return base.replace(/\s+/g, ' ').trim()
}

/**
 * Alpine ストアの選択値を GStreamer audio caps 文字列に埋め込んで返す
 * 空の format フィールドなど不正な caps フラグメントも除去する
 * @param {object} P - Alpine.store('menu') のスナップショット
 * @returns {string}
 */
export function embeddedAudio(P) {
  const replacers = [
    { key: 'format', value: P.audio_format },
    { key: 'rate', value: P.audio_rate },
    { key: 'channels', value: P.audio_channels },
  ]

  let base = P.audio_sampling

  for (const { key, value } of replacers) {
    if (value === undefined) continue
    const regex = new RegExp(`${key}=([\\{\\[].*?[\\}\\]])`, 'i')
    base = base.replace(regex, `${key}=${value}`)
  }

  base = base.replace(/\s+/g, ' ').trim()
  // Drop empty audio format fields like "format=," to avoid caps parse errors.
  base = base.replace(/,\s*format=\s*(?=,|$)/gi, '')
  base = base.replace(/\s*,\s*,/g, ',')
  base = base.replace(/,\s*$/g, '')
  return base
}

/**
 * H264 ハードウェアデコード対応プロファイルを検出して GStreamer H264 パイプライン文字列を返す
 * @param {object} P - Alpine.store('menu') のスナップショット
 * @param {string} video_launch - デバイス起動要素文字列
 * @param {string} video_capture - caps フィルター文字列
 * @returns {Promise<string>}
 */
export async function buildVidePipeline_H264(P, video_launch, video_capture) {
  // Ensure constrained-baseline profile for broader browser compatibility
  let capture = video_capture
  if (!capture.includes('profile=')) {
    let supportedProfile = await Utils.checkDecodingInfo(P.video_width, P.video_height, P.video_framerate)
    capture = capture.replace('video/x-h264', `video/x-h264,profile=${supportedProfile}`)
  }

  return Pipeline.start(video_launch)
    .caps(capture)
    .queue()
    .h264parse()
    .rtph264pay(`config-interval=-1 aggregate-mode=zero-latency pt=${video_payload_type}`)
    .rtpCaps(`application/x-rtp,media=video,encoding-name=H264,payload=${video_payload_type}`)
    .toString()
}

/**
 * GStreamer H265 パイプライン文字列を返す
 * @param {string} video_launch
 * @param {string} video_capture
 * @returns {string}
 */
export function buildVidePipeline_H265(video_launch, video_capture) {
  return Pipeline.start(video_launch)
    .caps(video_capture)
    .queue()
    .h265parse()
    .rtph265pay(`config-interval=-1 aggregate-mode=zero-latency pt=${video_payload_type}`)
    .rtpCaps(`application/x-rtp,media=video,encoding-name=H265,payload=${video_payload_type}`)
    .toString()

}

/**
 * ALSA デバイスを使った音声パイプライン文字列を返す
 * audio_codec の name に応じて opusenc / mulawenc を切り替える
 * @param {object} P - Alpine.store('menu') のスナップショット
 * @returns {string|null}
 */
export function buildAudioPipeline_ALSA(P) {
  let audio_device = JSON.parse(P.audio_device)
  let audio_codec = JSON.parse(P.audio_codec)

  let audio_launch = audio_device.launch.replaceAll('"', '').replaceAll("'", '').replaceAll('\\', '')
  audio_launch = audio_launch.replace('alsasrc', 'alsasrc do-timestamp=true')

  let audio_sampling = embeddedAudio(P)
  audio_sampling = audio_sampling.replaceAll('channel-mask=', 'channel-mask=\\(bitmask\\)')

  switch (audio_codec.name) {
    case 'opusenc':
      return Pipeline.start(audio_launch)
        .caps(audio_sampling)
        .queue()
        .audioconvert()
        .audioresample()
        .elem('opusenc', 'perfect-timestamp=true')
        .rtpopuspay(`pt=${audio_payload_type}`)
        .rtpCaps(`application/x-rtp,media=audio,encoding-name=OPUS,payload=${audio_payload_type}`)
        .toString()

    case 'mulawenc':
      return Pipeline.start(audio_launch)
        .caps(audio_sampling)
        .queue()
        .audioconvert()
        .audioresample()
        .elem('mulawenc')
        .rtppcmupay('pt=0')
        .rtpCaps('application/x-rtp,media=audio,encoding-name=PCMU,payload=0')
        .toString()

    case 'UNKNOWN':
    default:
      return null
  }
}
