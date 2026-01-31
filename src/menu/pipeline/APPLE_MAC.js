import * as U from './pipeline-utils.js'

// buildVidePipeline -------------------------------------------
export function buildVidePipeline(P) {
  let video_device = JSON.parse(P.video_device)

  let video_launch = video_device.launch.replaceAll("'", '')
  video_launch = video_launch.replace('avfvideosrc', 'avfvideosrc do-stats=true do-timestamp=true')

  let video_capture = U.embeddedVideo(P)

  if (video_capture.startsWith('video/x-h264')) {
    return U.buildVidePipeline_H264(P, video_launch, video_capture)
  }
  if (video_capture.startsWith('video/x-h265')) {
    return U.buildVidePipeline_H265(video_launch, video_capture)
  }

  let video_codec = JSON.parse(P.video_codec)

  switch (video_codec.name) {

    // vtenc_h264_hw //////////////////////////////////
    case 'vtenc_h264_hw':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .queue()
        .elem('vtenc_h264_hw', 'realtime=true')
        .h264parse()
        .rtph264pay(`config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`)
        .toString()

    // vtenc_h265_hw //////////////////////////////////
    case 'vtenc_h265_hw':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .queue()
        .elem('vtenc_h265_hw', 'realtime=true allow-frame-reordering=false')
        .h265parse()
        .rtph265pay(`config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H265,payload=${U.video_payload_type}`)
        .toString()

    // vp8enc //////////////////////////////////
    case 'vp8enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .caps('video/x-raw,format=I420')
        .queue()
        .elem('vp8enc', 'deadline=1')
        .rtpvp8pay(`pt=${U.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=VP8,payload=${U.video_payload_type}`)
        .toString()

    // vp9enc //////////////////////////////////
    case 'vp9enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .queue()
        .elem('vp9enc', 'deadline=1 cpu-used=8 threads=4 lag-in-frames=0')
        .vp9parse()
        .rtpvp9pay(`pt=${U.video_payload_type}`)
        .queue()
        .rtpCaps(`application/x-rtp,media=video,encoding-name=VP9,payload=${U.video_payload_type}`)
        .toString()

    // svtav1enc //////////////////////////////////
    case 'svtav1enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .caps('video/x-raw,format=I420')
        .queue()
        .elem('svtav1enc')
        .av1parse()
        .rtpav1pay(`pt=${U.video_payload_type}`)
        .queue()
        .rtpCaps(`application/x-rtp,media=video,encoding-name=AV1,payload=${U.video_payload_type}`)
        .toString()

    // UNKNOWN //////////////////////////////////
    case 'UNKNOWN':
    default:
      return null
  }
}

// buildAudioPipeline -------------------------------------------
export function buildAudioPipeline(P) {
  let audio_device = JSON.parse(P.audio_device)
  let audio_codec = JSON.parse(P.audio_codec)

  let audio_launch = audio_device.launch.replaceAll("'", '')
  audio_launch = audio_launch.replace('osxaudiosrc', 'osxaudiosrc do-timestamp=true')

  let audio_sampling = U.embeddedAudio(P)

  switch (audio_codec.name) {
    // opusenc //////////////////////////////////
    case 'opusenc':
      return U.Pipeline.start(audio_launch)
        .caps(audio_sampling)
        .audioconvert()
        .audioresample()
        .queue()
        .elem('opusenc', 'perfect-timestamp=true')
        .rtpopuspay(`pt=${U.audio_payload_type}`)
        .rtpCaps(`application/x-rtp,media=audio,encoding-name=OPUS,payload=${U.audio_payload_type}`)
        .toString()

    // mulawenc //////////////////////////////////
    case 'mulawenc':
      return U.Pipeline.start(audio_launch)
        .caps(audio_sampling)
        .audioconvert()
        .audioresample()
        .queue()
        .elem('mulawenc')
        .rtppcmupay('pt=0')
        .rtpCaps('application/x-rtp,media=audio,encoding-name=PCMU,payload=0')
        .toString()

    // UNKNOWN //////////////////////////////////
    case 'UNKNOWN':
    default:
      return null
  }
}
