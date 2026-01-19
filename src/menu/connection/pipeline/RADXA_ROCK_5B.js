import * as U from './pipeline-utils.js'

// buildVidePipeline -------------------------------------------
export function buildVidePipeline(P) {
  let video_device = JSON.parse(P.video_device)
  let video_codec = JSON.parse(P.video_codec)

  let video_launch = video_device.launch.replaceAll("'", '')
  video_launch = video_launch.replace('v4l2src', 'v4l2src io-mode=dmabuf do-timestamp=true')

  let video_capture = U.embeddedVideo(P)

  if (video_capture.startsWith('video/x-h264')) {
    return U.buildVidePipeline_H264(video_launch, video_capture)
  }
  if (video_capture.startsWith('video/x-h265')) {
    return U.buildVidePipeline_H265(video_launch, video_capture)
  }

  switch (video_codec.name) {
    // mpph264enc //////////////////////////////////
    case 'mpph264enc':
      return `${video_launch.replace('...', video_capture)} ! 
queue max-size-buffers=1 leaky=downstream ! 
videoconvert !
video/x-raw,format=NV12 !
queue max-size-buffers=1 leaky=downstream !
mpph264enc level=40 profile=100 !
h264parse ! 
rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} ! 
application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e
    // v4l2src device=/dev/video1 !
    // video/x-raw,width=640,height=480,framerate=30/1,format=YUY2 !
    // videoconvert !
    // video/x-raw,format=NV12 !
    // queue max-size-buffers=1 leaky=downstream !
    // mpph264enc level=40 profile=100 !
    // rtph264pay config-interval=-1 aggregate-mode=zero-latency !
    // udpsink host=192.168.151.1 port=5000 sync=false async=false

    // mpph265enc //////////////////////////////////
    case 'mpph265enc':
      return `${video_launch.replace('...', video_capture)} ! 
queue max-size-buffers=1 leaky=downstream ! 
videoconvert !
video/x-raw,format=NV12 !
queue max-size-buffers=1 leaky=downstream !
mpph265enc !
h265parse ! 
rtph265pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} ! 
application/x-rtp,media=video,encoding-name=H265,payload=${U.video_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e
    // v4l2src device=/dev/video1 !
    // video/x-raw,width=640,height=480,framerate=30/1,format=YUY2 !
    // videoconvert !
    // video/x-raw,format=NV12 !
    // queue max-size-buffers=1 leaky=downstream !
    // mpph265enc !
    // rtph265pay config-interval=1 aggregate-mode=zero-latency !
    // udpsink host=192.168.151.1 port=5000 sync=false async=false

    // mppvp8enc //////////////////////////////////
    case 'mppvp8enc':
      return `${video_launch.replace('...', video_capture)} ! 
queue max-size-buffers=1 leaky=downstream ! 
videoconvert !
video/x-raw,format=NV12 !
queue max-size-buffers=1 leaky=downstream !
mppvp8enc !
rtpvp8pay pt=${U.video_payload_type} ! 
application/x-rtp,media=video,encoding-name=VP8,payload=${U.video_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e
    // v4l2src device=/dev/video1 !
    // video/x-raw,width=640,height=480,framerate=30/1,format=YUY2 !
    // videoconvert !
    // video/x-raw,format=NV12 !
    // queue max-size-buffers=1 leaky=downstream !
    // mppvp8enc !
    // rtpvp8pay !
    // udpsink host=192.168.151.1 port=5000 sync=false async=false

    case 'UNKNOWN':
    default:
  }
}

// buildAudioPipeline -------------------------------------------
export function buildAudioPipeline(P) {
  return U.buildAudioPipeline_ALSA(P)
}
