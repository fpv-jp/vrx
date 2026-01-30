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
    // v4l2h264enc //////////////////////////////////
    case 'v4l2h264enc':
      return `${video_launch.replace('...', video_capture)} ! 
queue max-size-buffers=1 leaky=downstream ! 
v4l2h264enc capture-io-mode=dmabuf output-io-mode=dmabuf ! 
queue max-size-buffers=1 leaky=downstream ! 
capsfilter caps=video/x-h264,level=\(string\)4.1 ! 
rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} ! 
application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e \
    // libcamerasrc ! \
    // video/x-raw,width=1920,height=1080,framerate=30/1,format=YUY2,interlace-mode=progressive ! \
    // v4l2h264enc extra-controls="encode,h264_profile=4,h264_level=12,video_bitrate=20000000" ! \
    // capsfilter caps=video/x-h264,level=\(string\)4.1 ! \
    // queue max-size-buffers=3 leaky=downstream ! \
    // rtph264pay config-interval=-1 aggregate-mode=zero-latency ! \
    // udpsink host=192.168.151.20 port=5000 sync=false async=false

    case 'UNKNOWN':
    default:
      return null
  }
}

// buildAudioPipeline -------------------------------------------
export function buildAudioPipeline(P) {
  return U.buildAudioPipeline_ALSA(P)
}
