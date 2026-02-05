import * as PipelineUtils from './pipeline-utils.js'

/**
 * ストアスナップショット P から RASPBERRY_PI_5 向けの映像 GStreamer パイプライン文字列を生成する
 * @param {object} P - Alpine.store('menu') のスナップショット
 * @returns {string} GStreamer パイプライン文字列
 */
export function buildVidePipeline(P) {
  let video_device = JSON.parse(P.video_device)

  let video_launch = video_device.launch //.replaceAll('\\', '\\\\')

  let video_capture = PipelineUtils.embeddedVideo(P)

  if (video_capture.startsWith('video/x-h264')) {
    return PipelineUtils.buildVidePipeline_H264(P, video_launch, video_capture)
  }
  if (video_capture.startsWith('video/x-h265')) {
    return PipelineUtils.buildVidePipeline_H265(video_launch, video_capture)
  }

  let video_codec = JSON.parse(P.video_codec)

  switch (video_codec.name) {
    case 'openh264enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .elem('openh264enc', 'bitrate=3000000 enable-denoise=true complexity=2')
        .queue('max-size-buffers=3 leaky=downstream')
        .rtph264pay(`config-interval=-1 aggregate-mode=zero-latency pt=${PipelineUtils.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H264,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    case 'UNKNOWN':
    default:
      return null
  }
}

/**
 * ストアスナップショット P から RASPBERRY_PI_5 向けの音声 GStreamer パイプライン文字列を生成する
 * @param {object} P - Alpine.store('menu') のスナップショット
 * @returns {string} GStreamer パイプライン文字列
 */
export function buildAudioPipeline(P) {
  return PipelineUtils.buildAudioPipeline_ALSA(P)
}
