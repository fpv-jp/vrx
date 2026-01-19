import * as U from './pipeline-utils.js'

// sudo mv /usr/lib/x86_64-linux-gnu/gstreamer-1.0/libgstpipewire.so \
//         /usr/lib/x86_64-linux-gnu/gstreamer-1.0/libgstpipewire.so.disabled

// sudo mv /usr/lib/x86_64-linux-gnu/gstreamer-1.0/libgstpulseaudio.so \
//         /usr/lib/x86_64-linux-gnu/gstreamer-1.0/libgstpulseaudio.so.disabled

// buildVidePipeline -------------------------------------------
export function buildVidePipeline(P) {
  let video_device = JSON.parse(P.video_device)
  let video_codec = JSON.parse(P.video_codec)

  let video_launch = video_device.launch
  video_launch = video_launch.replace('v4l2src', 'v4l2src io-mode=dmabuf do-timestamp=true')

  if (video_codec.name === 'vaapih264enc' || video_codec.name === 'vaapih265enc') {
    P.video_capture = 'video/x-raw\\(memory:VASurface\\),format=NV12,width={640},height={480},framerate={30/1}'
    P.video_format = 'NV12'
  }

  let video_capture = U.embeddedVideo(P)

  if (video_capture.startsWith('video/x-h264')) {
    return U.buildVidePipeline_H264(video_launch, video_capture)
  }
  if (video_capture.startsWith('video/x-h265')) {
    return U.buildVidePipeline_H265(video_launch, video_capture)
  }

  switch (video_codec.name) {
    // vaapih264enc //////////////////////////////////
    case 'vaapih264enc':
      return `${video_launch.replace('...', '')}
vaapipostproc ! 
${video_capture} ! 
queue max-size-buffers=1 leaky=downstream ! 
vaapih264enc ! 
h264parse ! 
rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} ! 
application/x-rtp,media=video,encoding-name=H264,payload=${U.video_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e \
    // v4l2src device=/dev/video0 do-timestamp=true io-mode=dmabuf ! \
    // vaapipostproc ! \
    // video/x-raw\(memory:VASurface\),format=NV12,width=640,height=480,framerate=30/1 ! \
    // queue max-size-buffers=1 leaky=downstream ! \
    // vaapih264enc ! \
    // h264parse ! \
    // rtph264pay config-interval=-1 aggregate-mode=zero-latency ! \
    // udpsink host=127.0.0.1 port=5000 sync=false async=false

    case 'vaapih265enc':
      // vaapih265enc //////////////////////////////////
      return `${video_launch.replace('...', '')}
vaapipostproc ! 
${video_capture} ! 
queue max-size-buffers=1 leaky=downstream ! 
vaapih265enc ! 
h265parse ! 
rtph265pay config-interval=-1 aggregate-mode=zero-latency pt=${U.video_payload_type} ! 
application/x-rtp,media=video,encoding-name=H265,payload=${U.video_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e \
    // v4l2src device=/dev/video0 do-timestamp=true io-mode=dmabuf ! \
    // vaapipostproc ! \
    // video/x-raw\(memory:VASurface\),format=NV12,width=640,height=480,framerate=30/1 ! \
    // queue max-size-buffers=1 leaky=downstream ! \
    // vaapih265enc ! \
    // h265parse ! \
    // rtph265pay config-interval=-1 aggregate-mode=zero-latency ! \
    // udpsink host=127.0.0.1 port=5000 sync=false async=false

    case 'vp8enc':
      // vp8enc //////////////////////////////////
      return `${video_launch.replace('...', video_capture)} ! 
videoconvert ! 
video/x-raw,format=I420 ! 
queue max-size-buffers=1 leaky=downstream ! 
vp8enc deadline=1 ! 
rtpvp8pay pt=${U.video_payload_type} ! 
application/x-rtp,media=video,encoding-name=VP8,payload=${U.video_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e \
    // v4l2src device=/dev/video0 do-timestamp=true io-mode=dmabuf ! \
    // video/x-raw,width=640,height=480,framerate=30/1 ! \
    // videoconvert ! \
    // video/x-raw,format=I420 ! \
    // queue max-size-buffers=1 leaky=downstream ! \
    // vp8enc deadline=1 ! \
    // rtpvp8pay ! \
    // udpsink host=127.0.0.1 port=5000 sync=false async=false

    case 'vp9enc':
      // vp9enc //////////////////////////////////
      return `${video_launch.replace('...', video_capture)} ! 
videoconvert ! 
video/x-raw,format=I420 ! 
queue max-size-buffers=1 leaky=downstream ! 
vp9enc deadline=1 cpu-used=4 ! 
vp9parse ! 
rtpvp9pay pt=${U.video_payload_type} ! 
queue max-size-buffers=1 leaky=downstream ! 
application/x-rtp,media=video,encoding-name=VP9,payload=${U.video_payload_type}`

    // GST_DEBUG=2 gst-launch-1.0 -v -e
    // v4l2src device=/dev/video0 do-timestamp=true io-mode=dmabuf !
    // video/x-raw,width=640,height=480,framerate=30/1 !
    // videoconvert !
    // video/x-raw,format=I420 !
    // queue max-size-buffers=1 leaky=downstream !
    // vp9enc deadline=1 cpu-used=4 !
    // vp9parse !
    // rtpvp9pay !
    // udpsink host=127.0.0.1 port=5000 sync=false async=false

    case 'svtav1enc':
      // svtav1enc //////////////////////////////////
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
    // v4l2src device=/dev/video0 do-timestamp=true io-mode=dmabuf !
    // video/x-raw,width=640,height=480,framerate=30/1 !
    // videoconvert !
    // video/x-raw,format=I420 !
    // queue max-size-buffers=1 leaky=downstream !
    // svtav1enc !
    // av1parse !
    // rtpav1pay !
    // udpsink host=127.0.0.1 port=5000 sync=false async=false

    case 'UNKNOWN':
    default:
  }
}

// buildAudioPipeline -------------------------------------------
export function buildAudioPipeline(P) {
  return U.buildAudioPipeline_ALSA(P)
}
