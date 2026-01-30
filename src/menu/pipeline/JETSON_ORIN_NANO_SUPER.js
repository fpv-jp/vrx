import * as U from './pipeline-utils.js'

// buildVidePipeline -------------------------------------------
export function buildVidePipeline(P) {
  let video_device = JSON.parse(P.video_device)

  let video_launch = video_device.launch

  let video_capture = U.embeddedVideo(P)

  if (video_capture.startsWith('video/x-h264')) {
    return U.buildVidePipeline_H264(P, video_launch, video_capture)
  }
  if (video_capture.startsWith('video/x-h265')) {
    return U.buildVidePipeline_H265(video_launch, video_capture)
  }

  let video_codec = JSON.parse(P.video_codec)

  switch (video_codec.name) {
    // x264enc //////////////////////////////////
    case 'x264enc':
      return `${video_launch.replace('...', video_capture)} ! 
queue max-size-buffers=1 leaky=downstream ! 

h264parse ! 
rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} ! 
application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e
    // nvarguscamerasrc !
    // video/x-raw\(memory:NVMM\),width=1920,height=1080,framerate=30/1 !
    // queue max-size-buffers=1 leaky=downstream !
    // x264enc preset-level=3 profile=4 bitrate=20000000 !
    // capsfilter caps=video/x-h264,level=\(string\)4 !
    // queue max-size-buffers=3 leaky=downstream !
    // rtph264pay config-interval=-1 aggregate-mode=zero-latency !
    // udpsink host=192.168.151.1 port=5000 sync=false async=false

    // x265enc //////////////////////////////////
    case 'x265enc':
      return `${video_launch.replace('...', video_capture)} ! 
queue max-size-buffers=1 leaky=downstream ! 

h265parse ! 
rtph265pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} ! 
application/x-rtp,media=video,encoding-name=H265,payload=${U.video_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e
    // nvarguscamerasrc !
    // video/x-raw\(memory:NVMM\),width=1920,height=1080,framerate=30/1 !
    // queue max-size-buffers=1 leaky=downstream !
    // x265enc preset-level=3 profile=0 bitrate=30000000 !
    // capsfilter caps=video/x-h265,level=\(string\)4 !
    // queue max-size-buffers=3 leaky=downstream !
    // rtph265pay config-interval=1 aggregate-mode=zero-latency !
    // udpsink host=192.168.151.1 port=5000 sync=false async=false

    // vp9enc //////////////////////////////////
    case 'vp9enc':
      return `${video_launch.replace('...', video_capture)} ! 
queue max-size-buffers=1 leaky=downstream ! 

rtpvp8pay pt=${U.video_payload_type} ! 
application/x-rtp,media=video,encoding-name=VP8,payload=${U.video_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e
    // nvarguscamerasrc !
    // video/x-raw\(memory:NVMM\),width=1920,height=1080,framerate=30/1 !
    // queue max-size-buffers=1 leaky=downstream !
    // vp9enc bitrate=20000000 !
    // rtpvp8pay ! udpsink host=192.168.151.1 port=5000 sync=false async=false

    case 'UNKNOWN':
    default:
  }
}

// buildAudioPipeline -------------------------------------------
export function buildAudioPipeline(P) {
  return U.buildAudioPipeline_ALSA(P)
}
