import * as U from './pipeline-utils.js'
import * as Utils from '../../../utils.js'

// buildVidePipeline -------------------------------------------
export async function buildVidePipeline(P) {
  let video_device = JSON.parse(P.video_device)
  let video_codec = JSON.parse(P.video_codec)

  let video_launch = video_device.launch.replaceAll("'", '').replace('v4l2src', 'v4l2src io-mode=dmabuf do-timestamp=true')

  if (video_codec.name === 'v4l2h264enc') {
    P.video_format = 'NV12'
  }

  let video_capture = U.embeddedVideo(P)

  if (video_capture.startsWith('video/x-h264')) {
    return await U.buildVidePipeline_H264(P, video_launch, video_capture)
  }
  if (video_capture.startsWith('video/x-h265')) {
    return U.buildVidePipeline_H265(video_launch, video_capture)
  }

  switch (video_codec.name) {
    // v4l2h264enc //////////////////////////////////
    case 'v4l2h264enc':
// $ v4l2-ctl -d /dev/video0 --list-ctrls | grep h264_profile
// $ v4l2-ctl -d /dev/video0 --set-ctrl h264_profile=4
// $ v4l2-ctl -d /dev/video0 --get-ctrl h264_profile
// $ v4l2-ctl -d /dev/video0 --list-ctrls | grep h264_profile

      let supportedProfile = await Utils.checkDecodingInfo(P.video_width, P.video_height, P.video_framerate)
      return `${video_launch.replace('...', video_capture)} !
queue max-size-buffers=1 leaky=downstream !
v4l2h264enc capture-io-mode=dmabuf output-io-mode=dmabuf !
queue max-size-buffers=1 leaky=downstream !
capsfilter caps=video/x-h264,profile=${supportedProfile},level=\\(string\\)4.1 !
rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} !
application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e \
    // v4l2src device=/dev/video0 io-mode=dmabuf do-timestamp=true ! \
    // video/x-raw,width=1920,height=1080,framerate=30/1,format=NV12 ! \
    // queue max-size-buffers=1 leaky=downstream ! \
    // v4l2h264enc capture-io-mode=dmabuf output-io-mode=dmabuf ! \
    // capsfilter caps=video/x-h264,level=\(string\)4.1 ! \
    // queue max-size-buffers=3 leaky=downstream ! \
    // rtph264pay config-interval=-1 aggregate-mode=zero-latency ! \
    // udpsink host=192.168.151.5 port=5000 sync=false async=false

    case 'UNKNOWN':
    default:
      return null
  }
}

// buildAudioPipeline -------------------------------------------
export function buildAudioPipeline(P) {
  return U.buildAudioPipeline_ALSA(P)
}
