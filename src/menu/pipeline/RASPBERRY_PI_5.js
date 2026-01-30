import * as U from './pipeline-utils.js'

// buildVidePipeline -------------------------------------------
export function buildVidePipeline(P) {
  let video_device = JSON.parse(P.video_device)

  let video_launch = video_device.launch //.replaceAll('\\', '\\\\')

  let video_capture = U.embeddedVideo(P)

  if (video_capture.startsWith('video/x-h264')) {
    return U.buildVidePipeline_H264(P, video_launch, video_capture)
  }
  if (video_capture.startsWith('video/x-h265')) {
    return U.buildVidePipeline_H265(video_launch, video_capture)
  }

  let video_codec = JSON.parse(P.video_codec)

  switch (video_codec.name) {
    // openh264enc //////////////////////////////////
    case 'openh264enc':
      return `${video_launch.replace('...', video_capture)} ! 
videoconvert ! 
openh264enc bitrate=3000000 enable-denoise=true complexity=2 ! 
queue max-size-buffers=3 leaky=downstream ! 
rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} ! 
application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e \
    // libcamerasrc camera-name=/base/axi/pcie\@1000120000/rp1/i2c\@88000/imx708\@1a ! \
    // video/x-raw,width=1920,height=1080,format=I420 ! \
    // videoconvert ! \
    // openh264enc bitrate=3000000 enable-denoise=true complexity=2 ! \
    // queue max-size-buffers=3 leaky=downstream ! \
    // rtph264pay config-interval=-1 aggregate-mode=zero-latency ! \
    // udpsink host=192.168.151.103 port=5000 sync=false async=false

    case 'UNKNOWN':
    default:
      return null
  }
}

// buildAudioPipeline -------------------------------------------
export function buildAudioPipeline(P) {
  return U.buildAudioPipeline_ALSA(P)
}
