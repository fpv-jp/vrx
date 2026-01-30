import * as U from './pipeline-utils.js'

// sudo mv /usr/lib/x86_64-linux-gnu/gstreamer-1.0/libgstpipewire.so \
//         /usr/lib/x86_64-linux-gnu/gstreamer-1.0/libgstpipewire.so.disabled

// sudo mv /usr/lib/x86_64-linux-gnu/gstreamer-1.0/libgstpulseaudio.so \
//         /usr/lib/x86_64-linux-gnu/gstreamer-1.0/libgstpulseaudio.so.disabled

// ┌────────┬──────────────────────────────────────────────────────────┬───────────────────────┐
// │  GPU   │                       エンコーダー                         │         説明           │
// ├────────┼──────────────────────────────────────────────────────────┼───────────────────────┤
// │ AMD    │ amfav1enc, amfh264enc, amfh265enc                        │ AMF API               │
// ├────────┼──────────────────────────────────────────────────────────┼───────────────────────┤
// │ NVIDIA │ nvav1enc, nvh264enc, nvh265enc                           │ NVCODEC API CUDA Mode │
// ├────────┼──────────────────────────────────────────────────────────┼───────────────────────┤
// │ Intel  │ vaav1enc, vah264enc, vah264lpenc, vah265enc, vah265lpenc │ VA-API                │
// └────────┴──────────────────────────────────────────────────────────┴───────────────────────┘

// buildVidePipeline -------------------------------------------
export function buildVidePipeline(P) {
  let video_device = JSON.parse(P.video_device)

  let video_launch = video_device.launch
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
    // AMD AMF H.264 //////////////////////////////////
    case 'amfh264enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem('amfh264enc')
        .h264parse()
        .rtph264pay(`config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`)
        .toString()

    // AMD AMF H.265 //////////////////////////////////
    case 'amfh265enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem('amfh265enc')
        .h265parse()
        .rtph265pay(`config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H265,payload=${U.video_payload_type}`)
        .toString()

    // AMD AMF AV1 //////////////////////////////////
    case 'amfav1enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem('amfav1enc')
        .av1parse()
        .rtpav1pay(`pt=${U.video_payload_type}`)
        .queue()
        .rtpCaps(`application/x-rtp,media=video,encoding-name=AV1,payload=${U.video_payload_type}`)
        .toString()

    // NVIDIA NVCODEC H.264 //////////////////////////////////
    case 'nvh264enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem('nvh264enc')
        .h264parse()
        .rtph264pay(`config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`)
        .toString()

    // NVIDIA NVCODEC H.265 //////////////////////////////////
    case 'nvh265enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem('nvh265enc')
        .h265parse()
        .rtph265pay(`config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H265,payload=${U.video_payload_type}`)
        .toString()

    // NVIDIA NVCODEC AV1 //////////////////////////////////
    case 'nvav1enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem('nvav1enc')
        .av1parse()
        .rtpav1pay(`pt=${U.video_payload_type}`)
        .queue()
        .rtpCaps(`application/x-rtp,media=video,encoding-name=AV1,payload=${U.video_payload_type}`)
        .toString()

    // Intel VA-API H.264 //////////////////////////////////
    case 'vah264enc':
    case 'vah264lpenc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem(video_codec.name)
        .h264parse()
        .rtph264pay(`config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`)
        .toString()

    // Intel VA-API H.265 //////////////////////////////////
    case 'vah265enc':
    case 'vah265lpenc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem(video_codec.name)
        .h265parse()
        .rtph265pay(`config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H265,payload=${U.video_payload_type}`)
        .toString()

    // Intel VA-API AV1 //////////////////////////////////
    case 'vaav1enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .queue()
        .elem('vaav1enc')
        .av1parse()
        .rtpav1pay(`pt=${U.video_payload_type}`)
        .queue()
        .rtpCaps(`application/x-rtp,media=video,encoding-name=AV1,payload=${U.video_payload_type}`)
        .toString()

    // SW fallback: openh264enc //////////////////////////////////
    case 'openh264enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .elem('openh264enc', 'bitrate=3000000 enable-denoise=true complexity=2')
        .queue('max-size-buffers=3 leaky=downstream')
        .rtph264pay(`config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type}`)
        .rtpCaps(`application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`)
        .toString()

    // SW fallback: vp8enc //////////////////////////////////
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

    // SW fallback: vp9enc //////////////////////////////////
    case 'vp9enc':
      return U.Pipeline.start(video_launch)
        .caps(video_capture)
        .videoconvert()
        .caps('video/x-raw,format=I420')
        .queue()
        .elem('vp9enc', 'deadline=1 cpu-used=4')
        .vp9parse()
        .rtpvp9pay(`pt=${U.video_payload_type}`)
        .queue()
        .rtpCaps(`application/x-rtp,media=video,encoding-name=VP9,payload=${U.video_payload_type}`)
        .toString()

    // SW fallback: svtav1enc //////////////////////////////////
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

    case 'UNKNOWN':
    default:
  }
}

// buildAudioPipeline -------------------------------------------
export function buildAudioPipeline(P) {
  return U.buildAudioPipeline_ALSA(P)
}
