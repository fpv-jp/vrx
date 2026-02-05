import * as PipelineUtils from './pipeline-utils.js'

/**
 * ストアスナップショット P から APPLE_MAC 向けの映像 GStreamer パイプライン文字列を生成する
 * @param {object} P - Alpine.store('menu') のスナップショット
 * @returns {string} GStreamer パイプライン文字列
 */
export function buildVidePipeline(P) {
  let video_device = JSON.parse(P.video_device)

  let video_launch = video_device.launch.replaceAll("'", '')
  video_launch = video_launch.replace('avfvideosrc', 'avfvideosrc do-stats=true do-timestamp=true')

  let video_capture = PipelineUtils.embeddedVideo(P)

  if (video_capture.startsWith('video/x-h264')) {
    return PipelineUtils.buildVidePipeline_H264(P, video_launch, video_capture)
  }
  if (video_capture.startsWith('video/x-h265')) {
    return PipelineUtils.buildVidePipeline_H265(video_launch, video_capture)
  }

  let video_codec = JSON.parse(P.video_codec)

  switch (video_codec.name) {

    // vtenc_h264_hw
    case 'vtenc_h264_hw':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .queue()
        .elem('vtenc_h264_hw', 'realtime=true')
        .h264parse()
        .rtph264pay(`config-interval=-1 aggregate-mode=zero-latency pt=${PipelineUtils.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H264,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // vtenc_h265_hw
    case 'vtenc_h265_hw':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .queue()
        .elem('vtenc_h265_hw', 'realtime=true allow-frame-reordering=false')
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
        .queue()
        .elem('vp9enc', 'deadline=1 cpu-used=8 threads=4 lag-in-frames=0')
        .vp9parse()
        .rtpvp9pay(`pt=${PipelineUtils.video_payload_type}`)
        .queue()
        .rtpCaps(`application/x-rtp,media=video,encoding-name=VP9,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // svtav1enc
    case 'svtav1enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .caps('video/x-raw,format=I420')
        .queue()
        .elem('svtav1enc')
        .av1parse()
        .rtpav1pay(`pt=${PipelineUtils.video_payload_type}`)
        .queue()
        .rtpCaps(`application/x-rtp,media=video,encoding-name=AV1,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // UNKNOWN
    case 'UNKNOWN':
    default:
      return null
  }
}

/**
 * ストアスナップショット P から APPLE_MAC 向けの音声 GStreamer パイプライン文字列を生成する
 * @param {object} P - Alpine.store('menu') のスナップショット
 * @returns {string} GStreamer パイプライン文字列
 */
export function buildAudioPipeline(P) {
  let audio_device = JSON.parse(P.audio_device)
  let audio_codec = JSON.parse(P.audio_codec)

  let audio_launch = audio_device.launch.replaceAll("'", '')
  audio_launch = audio_launch.replace('osxaudiosrc', 'osxaudiosrc do-timestamp=true')

  let audio_sampling = PipelineUtils.embeddedAudio(P)

  switch (audio_codec.name) {
    // opusenc
    case 'opusenc':
      return PipelineUtils.Pipeline.start(audio_launch)
        .caps(audio_sampling)
        .audioconvert()
        .audioresample()
        .queue()
        .elem('opusenc', 'perfect-timestamp=true')
        .rtpopuspay(`pt=${PipelineUtils.audio_payload_type}`)
        .rtpCaps(`application/x-rtp,media=audio,encoding-name=OPUS,payload=${PipelineUtils.audio_payload_type}`)
        .toString()

    // mulawenc
    case 'mulawenc':
      return PipelineUtils.Pipeline.start(audio_launch)
        .caps(audio_sampling)
        .audioconvert()
        .audioresample()
        .queue()
        .elem('mulawenc')
        .rtppcmupay('pt=0')
        .rtpCaps('application/x-rtp,media=audio,encoding-name=PCMU,payload=0')
        .toString()

    // UNKNOWN
    case 'UNKNOWN':
    default:
      return null
  }
}
