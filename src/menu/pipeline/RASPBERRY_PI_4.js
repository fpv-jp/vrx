import * as PipelineUtils from './pipeline-utils.js'

/**
 * ストアスナップショット P から RASPBERRY_PI_4 向けの映像 GStreamer パイプライン文字列を生成する
 * @param {object} P - Alpine.store('menu') のスナップショット
 * @returns {string} GStreamer パイプライン文字列
 */
export function buildVidePipeline(P) {
  let video_device = JSON.parse(P.video_device)

  let video_launch = video_device.launch.replaceAll("'", '')
  video_launch = video_launch.replace('v4l2src', 'v4l2src io-mode=dmabuf do-timestamp=true')

  let video_capture = PipelineUtils.embeddedVideo(P)

  if (video_capture.startsWith('video/x-h264')) {
    return PipelineUtils.buildVidePipeline_H264(P, video_launch, video_capture)
  }
  if (video_capture.startsWith('video/x-h265')) {
    return PipelineUtils.buildVidePipeline_H265(video_launch, video_capture)
  }

  let video_codec = JSON.parse(P.video_codec)

  switch (video_codec.name) {
    case 'v4l2h264enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .queue()
        .elem('v4l2h264enc', 'capture-io-mode=dmabuf output-io-mode=dmabuf')
        .queue()
        .elem('capsfilter', 'caps=video/x-h264,level=\\(string\\)4.1')
        .rtph264pay(`config-interval=-1 aggregate-mode=zero-latency pt=${PipelineUtils.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H264,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    case 'UNKNOWN':
    default:
      return null
  }
}

/**
 * ストアスナップショット P から RASPBERRY_PI_4 向けの音声 GStreamer パイプライン文字列を生成する
 * @param {object} P - Alpine.store('menu') のスナップショット
 * @returns {string} GStreamer パイプライン文字列
 */
export function buildAudioPipeline(P) {
  return PipelineUtils.buildAudioPipeline_ALSA(P)
}
