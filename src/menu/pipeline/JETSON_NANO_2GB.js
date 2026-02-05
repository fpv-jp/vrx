import * as PipelineUtils from './pipeline-utils.js'

/**
 * ストアスナップショット P から JETSON_NANO_2GB 向けの映像 GStreamer パイプライン文字列を生成する
 * @param {object} P - Alpine.store('menu') のスナップショット
 * @returns {string} GStreamer パイプライン文字列
 */
export function buildVidePipeline(P) {
  let video_device = JSON.parse(P.video_device)

  let video_launch = video_device.launch.replaceAll('v4l2src', 'nvarguscamerasrc do-timestamp=true')

  P.video_capture = 'video/x-raw\\(memory:NVMM\\),width={640},height={480},framerate={30/1}'

  let video_capture = PipelineUtils.embeddedVideo(P)

  if (video_capture.startsWith('video/x-h264')) {
    return PipelineUtils.buildVidePipeline_H264(P, video_launch, video_capture)
  }
  if (video_capture.startsWith('video/x-h265')) {
    return PipelineUtils.buildVidePipeline_H265(video_launch, video_capture)
  }

  let video_codec = JSON.parse(P.video_codec)

  switch (video_codec.name) {

    // nvv4l2h264enc
    case 'nvv4l2h264enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .queue()
        .elem('nvv4l2h264enc', 'preset-level=3 profile=4 bitrate=20000000')
        .elem('capsfilter', 'caps=video/x-h264,level=\\(string\\)4')
        .queue('max-size-buffers=3 leaky=downstream')
        .rtph264pay(`config-interval=-1 aggregate-mode=zero-latency pt=${PipelineUtils.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H264,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // nvv4l2h265enc
    case 'nvv4l2h265enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .queue()
        .elem('nvv4l2h265enc', 'preset-level=3 profile=0 bitrate=30000000')
        .elem('capsfilter', 'caps=video/x-h265,level=\\(string\\)4')
        .queue('max-size-buffers=3 leaky=downstream')
        .rtph265pay(`config-interval=-1 aggregate-mode=zero-latency pt=${PipelineUtils.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H265,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // nvv4l2vp8enc
    case 'nvv4l2vp8enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .queue()
        .elem('nvv4l2vp8enc', 'bitrate=20000000')
        .rtpvp8pay(`pt=${PipelineUtils.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=VP8,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    case 'UNKNOWN':
    default:
  }
}

/**
 * ストアスナップショット P から JETSON_NANO_2GB 向けの音声 GStreamer パイプライン文字列を生成する
 * @param {object} P - Alpine.store('menu') のスナップショット
 * @returns {string} GStreamer パイプライン文字列
 */
export function buildAudioPipeline(P) {
  return PipelineUtils.buildAudioPipeline_ALSA(P)
}
