import * as U from './pipeline-utils.js'

// buildVidePipeline -------------------------------------------
export function buildVidePipeline(P) {
  let video_device = JSON.parse(P.video_device)

  let video_launch = video_device.launch.replaceAll('v4l2src', 'nvarguscamerasrc do-timestamp=true')

  P.video_capture = 'video/x-raw\\(memory:NVMM\\),width={640},height={480},framerate={30/1}'

  let video_capture = U.embeddedVideo(P)

  if (video_capture.startsWith('video/x-h264')) {
    return U.buildVidePipeline_H264(P, video_launch, video_capture)
  }
  if (video_capture.startsWith('video/x-h265')) {
    return U.buildVidePipeline_H265(video_launch, video_capture)
  }

  let video_codec = JSON.parse(P.video_codec)

  switch (video_codec.name) {

    // nvv4l2h264enc //////////////////////////////////
    case 'nvv4l2h264enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .queue()
        .elem('nvv4l2h264enc', 'preset-level=3 profile=4 bitrate=20000000')
        .elem('capsfilter', 'caps=video/x-h264,level=\\(string\\)4')
        .queue('max-size-buffers=3 leaky=downstream')
        .rtph264pay(`config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`)
        .toString()

    // nvv4l2h265enc //////////////////////////////////
    case 'nvv4l2h265enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .queue()
        .elem('nvv4l2h265enc', 'preset-level=3 profile=0 bitrate=30000000')
        .elem('capsfilter', 'caps=video/x-h265,level=\\(string\\)4')
        .queue('max-size-buffers=3 leaky=downstream')
        .rtph265pay(`config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H265,payload=${U.video_payload_type}`)
        .toString()

    // nvv4l2vp8enc //////////////////////////////////
    case 'nvv4l2vp8enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .queue()
        .elem('nvv4l2vp8enc', 'bitrate=20000000')
        .rtpvp8pay(`pt=${U.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=VP8,payload=${U.video_payload_type}`)
        .toString()

    case 'UNKNOWN':
    default:
  }
}

// buildAudioPipeline -------------------------------------------
export function buildAudioPipeline(P) {
  return U.buildAudioPipeline_ALSA(P)
}
