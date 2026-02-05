import * as PipelineUtils from './pipeline-utils.js'

// ┌────────┬──────────────────────────────────────────────────────────┬───────────────────────┐
// │  GPU   │                       エンコーダー                         │         説明           │
// ├────────┼──────────────────────────────────────────────────────────┼───────────────────────┤
// │ AMD    │ amfav1enc, amfh264enc, amfh265enc                        │ AMF API               │
// ├────────┼──────────────────────────────────────────────────────────┼───────────────────────┤
// │ NVIDIA │ nvav1enc, nvh264enc, nvh265enc                           │ NVCODEC API CUDA Mode │
// ├────────┼──────────────────────────────────────────────────────────┼───────────────────────┤
// │ Intel  │ vaav1enc, vah264enc, vah264lpenc, vah265enc, vah265lpenc │ VA-API                │
// └────────┴──────────────────────────────────────────────────────────┴───────────────────────┘

/**
 * ストアスナップショット P から LINUX_X86 向けの映像 GStreamer パイプライン文字列を生成する
 * @param {object} P - Alpine.store('menu') のスナップショット
 * @returns {string} GStreamer パイプライン文字列
 */
export function buildVidePipeline(P) {
  let video_device = JSON.parse(P.video_device)

  let video_launch = video_device.launch
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
    // AMD AMF H.264
    case 'amfh264enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem('amfh264enc')
        .h264parse()
        .rtph264pay(`config-interval=-1 aggregate-mode=zero-latency pt=${PipelineUtils.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H264,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // AMD AMF H.265
    case 'amfh265enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem('amfh265enc')
        .h265parse()
        .rtph265pay(`config-interval=-1 aggregate-mode=zero-latency pt=${PipelineUtils.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H265,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // AMD AMF AV1
    case 'amfav1enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem('amfav1enc')
        .av1parse()
        .rtpav1pay(`pt=${PipelineUtils.video_payload_type}`)
        .queue()
        .rtpCaps(`application/x-rtp,media=video,encoding-name=AV1,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // NVIDIA NVCODEC H.264
    case 'nvh264enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem('nvh264enc')
        .h264parse()
        .rtph264pay(`config-interval=-1 aggregate-mode=zero-latency pt=${PipelineUtils.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H264,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // NVIDIA NVCODEC H.265
    case 'nvh265enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem('nvh265enc')
        .h265parse()
        .rtph265pay(`config-interval=-1 aggregate-mode=zero-latency pt=${PipelineUtils.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H265,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // NVIDIA NVCODEC AV1
    case 'nvav1enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem('nvav1enc')
        .av1parse()
        .rtpav1pay(`pt=${PipelineUtils.video_payload_type}`)
        .queue()
        .rtpCaps(`application/x-rtp,media=video,encoding-name=AV1,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // Intel VA-API H.264
    case 'vah264enc':
    case 'vah264lpenc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem(video_codec.name)
        .h264parse()
        .rtph264pay(`config-interval=-1 aggregate-mode=zero-latency pt=${PipelineUtils.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H264,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // Intel VA-API H.265
    case 'vah265enc':
    case 'vah265lpenc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem(video_codec.name)
        .h265parse()
        .rtph265pay(`config-interval=-1 aggregate-mode=zero-latency pt=${PipelineUtils.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H265,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // Intel VA-API AV1
    case 'vaav1enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem('vaav1enc')
        .av1parse()
        .rtpav1pay(`pt=${PipelineUtils.video_payload_type}`)
        .queue()
        .rtpCaps(`application/x-rtp,media=video,encoding-name=AV1,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // SW fallback: openh264enc
    case 'openh264enc':
      return PipelineUtils.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .elem('openh264enc', 'bitrate=3000000 enable-denoise=true complexity=2')
        .queue('max-size-buffers=3 leaky=downstream')
        .rtph264pay(`config-interval=-1 aggregate-mode=zero-latency pt=${PipelineUtils.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H264,payload=${PipelineUtils.video_payload_type}`)
        .toString()

    // SW fallback: vp8enc
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

    // SW fallback: vp9enc
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

    // SW fallback: svtav1enc
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

    case 'UNKNOWN':
    default:
  }
}

/**
 * ストアスナップショット P から LINUX_X86 向けの音声 GStreamer パイプライン文字列を生成する
 * @param {object} P - Alpine.store('menu') のスナップショット
 * @returns {string} GStreamer パイプライン文字列
 */
export function buildAudioPipeline(P) {
  return PipelineUtils.buildAudioPipeline_ALSA(P)
}
