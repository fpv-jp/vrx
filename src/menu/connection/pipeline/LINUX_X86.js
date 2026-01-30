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
  let video_codec = JSON.parse(P.video_codec)

  let video_launch = video_device.launch
  video_launch = video_launch.replace('v4l2src', 'v4l2src io-mode=dmabuf do-timestamp=true')

  let video_capture = U.embeddedVideo(P)

  if (video_capture.startsWith('video/x-h264')) {
    return U.buildVidePipeline_H264(P, video_launch, video_capture)
  }
  if (video_capture.startsWith('video/x-h265')) {
    return U.buildVidePipeline_H265(video_launch, video_capture)
  }

  switch (video_codec.name) {
    // AMD AMF H.264 //////////////////////////////////
    case 'amfh264enc':
      return `${video_launch.replace('...', video_capture)} !
videoconvert !
queue max-size-buffers=1 leaky=downstream !
amfh264enc !
h264parse !
rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} !
application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`

    // AMD AMF H.265 //////////////////////////////////
    case 'amfh265enc':
      return `${video_launch.replace('...', video_capture)} !
videoconvert !
queue max-size-buffers=1 leaky=downstream !
amfh265enc !
h265parse !
rtph265pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} !
application/x-rtp,media=video,encoding-name=H265,payload=${U.video_payload_type}`

    // AMD AMF AV1 //////////////////////////////////
    case 'amfav1enc':
      return `${video_launch.replace('...', video_capture)} !
videoconvert !
queue max-size-buffers=1 leaky=downstream !
amfav1enc !
av1parse !
rtpav1pay pt=${U.video_payload_type} !
queue max-size-buffers=1 leaky=downstream !
application/x-rtp,media=video,encoding-name=AV1,payload=${U.video_payload_type}`

    // NVIDIA NVCODEC H.264 //////////////////////////////////
    case 'nvh264enc':
      return `${video_launch.replace('...', video_capture)} !
videoconvert !
queue max-size-buffers=1 leaky=downstream !
nvh264enc !
h264parse !
rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} !
application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`

    // NVIDIA NVCODEC H.265 //////////////////////////////////
    case 'nvh265enc':
      return `${video_launch.replace('...', video_capture)} !
videoconvert !
queue max-size-buffers=1 leaky=downstream !
nvh265enc !
h265parse !
rtph265pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} !
application/x-rtp,media=video,encoding-name=H265,payload=${U.video_payload_type}`

    // NVIDIA NVCODEC AV1 //////////////////////////////////
    case 'nvav1enc':
      return `${video_launch.replace('...', video_capture)} !
videoconvert !
queue max-size-buffers=1 leaky=downstream !
nvav1enc !
av1parse !
rtpav1pay pt=${U.video_payload_type} !
queue max-size-buffers=1 leaky=downstream !
application/x-rtp,media=video,encoding-name=AV1,payload=${U.video_payload_type}`

    // Intel VA-API H.264 //////////////////////////////////
    case 'vah264enc':
    case 'vah264lpenc':
      return `${video_launch.replace('...', video_capture)} !
videoconvert !
queue max-size-buffers=1 leaky=downstream !
${video_codec.name} !
h264parse !
rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} !
application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`

    // Intel VA-API H.265 //////////////////////////////////
    case 'vah265enc':
    case 'vah265lpenc':
      return `${video_launch.replace('...', video_capture)} !
videoconvert !
queue max-size-buffers=1 leaky=downstream !
${video_codec.name} !
h265parse !
rtph265pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} !
application/x-rtp,media=video,encoding-name=H265,payload=${U.video_payload_type}`

    // Intel VA-API AV1 //////////////////////////////////
    case 'vaav1enc':
      return `${video_launch.replace('...', video_capture)} !
videoconvert !
queue max-size-buffers=1 leaky=downstream !
vaav1enc !
av1parse !
rtpav1pay pt=${U.video_payload_type} !
queue max-size-buffers=1 leaky=downstream !
application/x-rtp,media=video,encoding-name=AV1,payload=${U.video_payload_type}`

    // SW fallback: openh264enc //////////////////////////////////
    case 'openh264enc':
      return `${video_launch.replace('...', video_capture)} !
videoconvert !
openh264enc bitrate=3000000 enable-denoise=true complexity=2 !
queue max-size-buffers=3 leaky=downstream !
rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} !
application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`

    // SW fallback: vp8enc //////////////////////////////////
    case 'vp8enc':
      return `${video_launch.replace('...', video_capture)} !
videoconvert !
video/x-raw,format=I420 !
queue max-size-buffers=1 leaky=downstream !
vp8enc deadline=1 !
rtpvp8pay pt=${U.video_payload_type} !
application/x-rtp,media=video,encoding-name=VP8,payload=${U.video_payload_type}`

    // SW fallback: vp9enc //////////////////////////////////
    case 'vp9enc':
      return `${video_launch.replace('...', video_capture)} !
videoconvert !
video/x-raw,format=I420 !
queue max-size-buffers=1 leaky=downstream !
vp9enc deadline=1 cpu-used=4 !
vp9parse !
rtpvp9pay pt=${U.video_payload_type} !
queue max-size-buffers=1 leaky=downstream !
application/x-rtp,media=video,encoding-name=VP9,payload=${U.video_payload_type}`

    // SW fallback: svtav1enc //////////////////////////////////
    case 'svtav1enc':
      return `${video_launch.replace('...', video_capture)} !
videoconvert !
video/x-raw,format=I420 !
queue max-size-buffers=1 leaky=downstream !
svtav1enc !
av1parse !
rtpav1pay pt=${U.video_payload_type} !
queue max-size-buffers=1 leaky=downstream !
application/x-rtp,media=video,encoding-name=AV1,payload=${U.video_payload_type}`

    case 'UNKNOWN':
    default:
  }
}

// buildAudioPipeline -------------------------------------------
export function buildAudioPipeline(P) {
  return U.buildAudioPipeline_ALSA(P)
}
