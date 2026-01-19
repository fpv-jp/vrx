import * as U from './pipeline-utils.js'
import * as Utils from '../../../utils.js'

export const video_priority = 'high'
export const audio_priority = 'high'
export const video_payload_type = 96
export const audio_payload_type = 97

function framerate(v) {
  if (typeof v === 'string' && v.includes('/')) {
    return v
  } else if (!isNaN(Number(v))) {
    return `${Math.round(Number(v))}/1`
  } else {
    return `${v}/1`
  }
}

// embeddedVideo -------------------------------------------
export function embeddedVideo(P) {
  const replacers = [
    { key: 'format', value: P.video_format },
    { key: 'drm-format', value: P.video_drm_format },
    { key: 'width', value: P.video_width },
    { key: 'height', value: P.video_height },
    { key: 'framerate', value: framerate(P.video_framerate) },
  ]

  let base = P.video_capture

  for (const { key, value } of replacers) {
    if (value === undefined) continue
    const regex = new RegExp(`${key}=([\\{\\[].*?[\\}\\]])`, 'i')
    base = base.replace(regex, `${key}=${value}`)
  }

  return base.replace(/\s+/g, ' ').trim()
}

// embeddedAudio -------------------------------------------
export function embeddedAudio(P) {
  const replacers = [
    { key: 'format', value: P.audio_format },
    { key: 'rate', value: P.audio_rate },
    { key: 'channels', value: P.audio_channels },
  ]

  let base = P.audio_sampling

  for (const { key, value } of replacers) {
    if (value === undefined) continue
    const regex = new RegExp(`${key}=([\\{\\[].*?[\\}\\]])`, 'i')
    base = base.replace(regex, `${key}=${value}`)
  }

  return base.replace(/\s+/g, ' ').trim()
}

// buildVidePipeline_H264 -------------------------------------------
export async function buildVidePipeline_H264(P, video_launch, video_capture) {
  // Ensure constrained-baseline profile for broader browser compatibility
  let capture = video_capture
  if (!capture.includes('profile=')) {
    let supportedProfile = await Utils.checkDecodingInfo(P.video_width, P.video_height, P.video_framerate)
    capture = capture.replace('video/x-h264', `video/x-h264,profile=${supportedProfile}`)
  }

  return `${video_launch.replace('...', capture)} !
queue max-size-buffers=1 leaky=downstream !
h264parse !
rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} !
application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`

  // =========== h264 encode support camera

  // GST_DEBUG=2 gst-launch-1.0 -v -e \
  // v4l2src device=/dev/video0 io-mode=dmabuf do-timestamp=true ! \
  // video/x-h264,width=1920,height=1080,framerate=30/1,stream-format=byte-stream ! \
  // queue max-size-buffers=1 leaky=downstream ! \
  // h264parse ! \
  // rtph264pay config-interval=-1 aggregate-mode=zero-latency ! \
  // udpsink host=192.168.151.5 port=5000 sync=false async=false
}

// buildVidePipeline_H265 -------------------------------------------
export function buildVidePipeline_H265(video_launch, video_capture) {
  return `${video_launch.replace('...', video_capture)} ! 
queue max-size-buffers=1 leaky=downstream ! 
h265parse !
rtph265pay config-interval=-1 aggregate-mode=zero-latency pt=${video_payload_type} ! 
application/x-rtp,media=video,encoding-name=H265,payload=${video_payload_type}`

  // =========== h265 encode support camera

  // GST_DEBUG=2 gst-launch-1.0 -v -e \
  // v4l2src device=/dev/video0 io-mode=dmabuf do-timestamp=true ! \
  // video/x-h265,width=1920,height=1080,framerate=30/1,stream-format=byte-stream ! \
  // queue max-size-buffers=1 leaky=downstream ! \
  // h265parse ! \
  // rtph265pay config-interval=-1 aggregate-mode=zero-latency ! \
  // udpsink host=192.168.151.5 port=5000 sync=false async=false
}

// buildAudioPipeline_ALSA -------------------------------------------
export function buildAudioPipeline_ALSA(P) {
  let audio_device = JSON.parse(P.audio_device)
  let audio_codec = JSON.parse(P.audio_codec)

  let audio_launch = audio_device.launch.replaceAll('"', '').replaceAll("'", '').replaceAll('\\', '')
  audio_launch = audio_launch.replace('alsasrc', 'alsasrc do-timestamp=true')

  let audio_sampling = U.embeddedAudio(P)
  audio_sampling = audio_sampling.replaceAll('channel-mask=', 'channel-mask=\\(bitmask\\)')

  switch (audio_codec.name) {
    // opusenc //////////////////////////////////
    case 'opusenc':
      return `${audio_launch.replace('...', audio_sampling)} ! 
queue max-size-buffers=1 leaky=downstream ! 
audioconvert ! 
audioresample ! 
opusenc perfect-timestamp=true ! 
rtpopuspay pt=${audio_payload_type} ! 
application/x-rtp,media=audio,encoding-name=OPUS,payload=${audio_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e \
    // alsasrc device=hw:1,0 do-timestamp=true ! \
    // audio/x-raw,rate=48000,channels=1 ! \
    // queue max-size-buffers=1 leaky=downstream ! \
    // audioconvert ! \
    // audioresample ! \
    // opusenc perfect-timestamp=true ! \
    // rtpopuspay ! \
    // udpsink host=192.168.151.5 port=5001 sync=false async=false

    // mulawenc //////////////////////////////////
    case 'mulawenc':
      return `${audio_launch.replace('...', audio_sampling)} ! 
queue max-size-buffers=1 leaky=downstream ! 
audioconvert ! 
audioresample ! 
mulawenc ! 
rtppcmupay pt=0 ! 
application/x-rtp,media=audio,encoding-name=PCMU,payload=0`

    // GST_DEBUG=2 gst-launch-1.0 -v -e \
    // alsasrc device=hw:3 do-timestamp=true ! \
    // audio/x-raw,rate=48000,channels=1 ! \
    // queue max-size-buffers=1 leaky=downstream ! \
    // audioconvert ! \
    // audioresample ! \
    // mulawenc ! \
    // rtppcmupay ! \
    // udpsink host=192.168.151.5 port=5001 sync=false async=false

    case 'UNKNOWN':
    default:
      return null
  }
}
