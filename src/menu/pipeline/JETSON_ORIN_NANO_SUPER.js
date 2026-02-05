import * as PipelineUtils from './pipeline-utils.js'

/**
 * ストアスナップショット P から JETSON_ORIN_NANO_SUPER 向けの映像 GStreamer パイプライン文字列を生成する
 * @param {object} P - Alpine.store('menu') のスナップショット
 * @returns {string} GStreamer パイプライン文字列
 */
export function buildVidePipeline(P) {
  let video_device = JSON.parse(P.video_device)

  let video_launch = video_device.launch

  let video_capture = PipelineUtils.embeddedVideo(P)

  if (video_capture.startsWith('video/x-h264')) {
    return PipelineUtils.buildVidePipeline_H264(P, video_launch, video_capture)
  }
  if (video_capture.startsWith('video/x-h265')) {
    return PipelineUtils.buildVidePipeline_H265(video_launch, video_capture)
  }

  let video_codec = JSON.parse(P.video_codec)

  switch (video_codec.name) {
    // openh264enc
    case 'openh264enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .elem('openh264enc', 'bitrate=3000000 enable-denoise=true complexity=2')
        .queue('max-size-buffers=3 leaky=downstream')
        .rtph264pay(`config-interval=-1 aggregate-mode=zero-latency pt=${PipelineUtils.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H264,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // x265enc
    case 'x265enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem('x265enc')
        .h265parse()
        .rtph265pay(`config-interval=-1 aggregate-mode=zero-latency pt=${PipelineUtils.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H265,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // vp8enc
    case 'vp8enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .caps('video/x-raw,format=I420')
        .queue()
        .elem('vp8enc', 'deadline=1')
        .rtpvp8pay(`pt=${PipelineUtils.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=VP8,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // vp9enc
    case 'vp9enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .caps('video/x-raw,format=I420')
        .queue()
        .elem('vp9enc', 'deadline=1 cpu-used=4')
        .vp9parse()
        .rtpvp9pay(`pt=${PipelineUtils.video_payload_type}`)
        .queue()
        .rtpCaps(`application/x-rtp,media=video,encoding-name=VP9,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    case 'UNKNOWN':
    default:
  }
}

/**
 * ストアスナップショット P から JETSON_ORIN_NANO_SUPER 向けの音声 GStreamer パイプライン文字列を生成する
 * @param {object} P - Alpine.store('menu') のスナップショット
 * @returns {string} GStreamer パイプライン文字列
 */
export function buildAudioPipeline(P) {
  return PipelineUtils.buildAudioPipeline_ALSA(P)
}
