import * as U from './pipeline-utils.js'

// buildVidePipeline -------------------------------------------
export function buildVidePipeline(P) {
  let video_device = JSON.parse(P.video_device)
  let video_codec = JSON.parse(P.video_codec)

  let video_launch = video_device.launch.replaceAll("'", '')
  video_launch = video_launch.replace('avfvideosrc', 'avfvideosrc do-stats=true do-timestamp=true')

  let video_capture = U.embeddedVideo(P)

  if (video_capture.startsWith('video/x-h264')) {
    return U.buildVidePipeline_H264(video_launch, video_capture)
  }
  if (video_capture.startsWith('video/x-h265')) {
    return U.buildVidePipeline_H265(video_launch, video_capture)
  }

  switch (video_codec.name) {
    // vtenc_h264_hw //////////////////////////////////
    case 'vtenc_h264_hw':
      return `${video_launch.replace('...', video_capture)} ! 
queue max-size-buffers=1 leaky=downstream ! 
vtenc_h264_hw realtime=true ! 
h264parse ! 
rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} ! 
application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e \
    // avfvideosrc do-stats=true do-timestamp=true device-index=0 ! \
    // video/x-raw,width=640,height=480,framerate=30/1,format=NV12 ! \
    // queue max-size-buffers=1 leaky=downstream ! \
    // vtenc_h264_hw realtime=true ! \
    // h264parse ! \
    // rtph264pay config-interval=-1 aggregate-mode=zero-latency ! \
    // udpsink host=127.0.0.1 port=5000 sync=false async=false

    // vtenc_h265_hw //////////////////////////////////
    case 'vtenc_h265_hw':
      return `${video_launch.replace('...', video_capture)} ! 
queue max-size-buffers=1 leaky=downstream ! 
vtenc_h265_hw realtime=true allow-frame-reordering=false ! 
h265parse ! 
rtph265pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} ! 
application/x-rtp,media=video,encoding-name=H265,payload=${U.video_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e \
    // avfvideosrc do-stats=true do-timestamp=true device-index=0 ! \
    // video/x-raw,width=640,height=480,framerate=30/1,format=NV12 ! \
    // queue max-size-buffers=1 leaky=downstream ! \
    // vtenc_h265_hw realtime=true allow-frame-reordering=false ! \
    // h265parse ! \
    // rtph265pay config-interval=-1 aggregate-mode=zero-latency ! \
    // udpsink host=127.0.0.1 port=5000 sync=false async=false

    // vp8enc //////////////////////////////////
    case 'vp8enc':
      return `${video_launch.replace('...', video_capture)} ! 
videoconvert ! 
video/x-raw,format=I420 ! 
queue max-size-buffers=1 leaky=downstream ! 
vp8enc deadline=1 ! 
rtpvp8pay pt=${U.video_payload_type} ! 
application/x-rtp,media=video,encoding-name=VP8,payload=${U.video_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e
    // avfvideosrc do-stats=true do-timestamp=true device-index=0 !
    // video/x-raw,width=640,height=480,framerate=30/1 !
    // videoconvert !
    // video/x-raw,format=I420 !
    // queue max-size-buffers=1 leaky=downstream !
    // vp8enc deadline=1 !
    // rtpvp8pay !
    // udpsink host=127.0.0.1 port=5000 sync=false async=false

    // vp9enc //////////////////////////////////
    case 'vp9enc':
      return `${video_launch.replace('...', video_capture)} ! 
queue max-size-buffers=1 leaky=downstream ! 
vp9enc deadline=1 cpu-used=8 threads=4 lag-in-frames=0 ! 
vp9parse ! 
rtpvp9pay pt=${U.video_payload_type} ! 
queue max-size-buffers=1 leaky=downstream ! 
application/x-rtp,media=video,encoding-name=VP9,payload=${U.video_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e
    // avfvideosrc do-stats=true do-timestamp=true device-index=0 !
    // video/x-raw,width=640,height=480,framerate=30/1 !
    // videoconvert !
    // video/x-raw,format=I420 !
    // queue max-size-buffers=1 leaky=downstream !
    // vp9enc deadline=1 cpu-used=8 threads=4 lag-in-frames=0 !
    // vp9parse !
    // rtpvp9pay !
    // udpsink host=127.0.0.1 port=5000 sync=false async=false

    // svtav1enc //////////////////////////////////
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

    // GST_DEBUG=2 gst-launch-1.0 -v -e
    // avfvideosrc do-stats=true do-timestamp=true device-index=0 !
    // video/x-raw,width=640,height=480,framerate=30/1 !
    // videoconvert !
    // video/x-raw,format=I420 !
    // queue max-size-buffers=1 leaky=downstream !
    // svtav1enc !
    // av1parse !
    // rtpav1pay !
    // udpsink host=127.0.0.1 port=5000 sync=false async=false

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
      return `${audio_launch.replace('...', audio_sampling)} ! 
audioconvert ! 
audioresample ! 
queue max-size-buffers=1 leaky=downstream ! 
opusenc perfect-timestamp=true ! 
rtpopuspay pt=${U.audio_payload_type} ! 
application/x-rtp,media=audio,encoding-name=OPUS,payload=${U.audio_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e
    // osxaudiosrc device=0 do-timestamp=true !
    // audio/x-raw,rate=48000,channels=2 !
    // queue max-size-buffers=1 leaky=downstream !
    // audioconvert !
    // audioresample !
    // mulawenc !
    // rtppcmupay !
    // udpsink host=127.0.0.1 port=5001 sync=false async=false

    // mulawenc //////////////////////////////////
    case 'mulawenc':
      return `${audio_launch.replace('...', audio_sampling)} ! 
audioconvert ! 
audioresample ! 
queue max-size-buffers=1 leaky=downstream ! 
mulawenc ! 
rtppcmupay pt=0 ! 
application/x-rtp,media=audio,encoding-name=PCMU,payload=0`

    // GST_DEBUG=2 gst-launch-1.0 -v -e
    // osxaudiosrc device=0 do-timestamp=true !
    // audio/x-raw,rate=48000,channels=2 !
    // queue max-size-buffers=1 leaky=downstream !
    // audioconvert !
    // audioresample !
    // opusenc !
    // rtpopuspay !
    // udpsink host=127.0.0.1 port=5001 sync=false async=false

    // UNKNOWN //////////////////////////////////
    case 'UNKNOWN':
    default:
      return null
  }
}
