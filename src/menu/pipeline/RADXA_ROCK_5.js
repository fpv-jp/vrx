import * as U from './pipeline-utils.js'

// buildVidePipeline -------------------------------------------
export function buildVidePipeline(P) {
  let video_device = JSON.parse(P.video_device)

  let video_launch = video_device.launch.replaceAll("'", '')
  video_launch = video_launch.replace('v4l2src', 'v4l2src io-mode=dmabuf do-timestamp=true')

  let video_capture = U.embeddedVideo(P)

  if (video_capture.startsWith('video/x-h264')) {
    return U.buildVidePipeline_H264(P, video_launch, video_capture)
  }
  if (video_capture.startsWith('video/x-h265')) {
    return U.buildVidePipeline_H265(video_launch, video_capture)
  }

  let video_codec = JSON.parse(P.video_codec)

  switch (video_codec.name) {

    // mpph264enc //////////////////////////////////
    case 'mpph264enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .queue()
        .videoconvert()
        .caps('video/x-raw,format=NV12')
        .queue()
        .elem('mpph264enc', 'level=40 profile=100')
        .h264parse()
        .rtph264pay(`config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`)
        .toString()

    // mpph265enc //////////////////////////////////
    case 'mpph265enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .queue()
        .videoconvert()
        .caps('video/x-raw,format=NV12')
        .queue()
        .elem('mpph265enc')
        .h265parse()
        .rtph265pay(`config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H265,payload=${U.video_payload_type}`)
        .toString()

    // mppvp8enc //////////////////////////////////
    case 'mppvp8enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .queue()
        .videoconvert()
        .caps('video/x-raw,format=NV12')
        .queue()
        .elem('mppvp8enc')
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
