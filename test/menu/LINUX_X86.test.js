import { describe, it, expect } from 'vitest'
import { sortByOrder } from '../../src/menu/utils/codec-utils.js'
import { buildVidePipeline, buildAudioPipeline } from '../../src/menu/pipeline/LINUX_X86.js'
import fixture from './LINUX_X86.json'

// ─── fixture references ───────────────────────────────────────────────────────
const HDWebcam = fixture.devices[0]
const HDMIMonitor3 = fixture.devices[1]  // first audio device (Monitor of HDMI/DP 3)

const vah264lpenc = fixture.codecs.video.find((c) => c.name === 'vah264lpenc')
const vah265lpenc = fixture.codecs.video.find((c) => c.name === 'vah265lpenc')
const opusenc = fixture.codecs.audio.find((c) => c.name === 'opusenc')
const mulawenc = fixture.codecs.audio.find((c) => c.name === 'mulawenc')

// Default video capture: getCaptureList sorts video/x-raw, before video/x-raw(, so the plain
// x-raw cap at 1280×720 10fps comes first.
// Original caps order: DMABuf 1280, DMABuf 640/{480,360}, DMABuf 320, x-raw 1280, x-raw 640/{480,360}, x-raw 320
// After sort: x-raw caps first → HDWebcam.caps[3] = "video/x-raw, format=YUY2, width=1280, …"
const WEBCAM_CAP_RAW_1280 = HDWebcam.caps[3]   // "video/x-raw, format=YUY2, width=1280, height=720, …"
const WEBCAM_CAP_DMA_1280 = HDWebcam.caps[0]   // "video/x-raw(memory:DMABuf), format=DMA_DRM, …"

// Default audio sampling: first cap of HDMI3 monitor (format list + rate range + channel range)
const HDMI3_SAMPLING = HDMIMonitor3.caps[0]

// audio_rate = 48000 (set by showSubMenu when rate is a slider range like [ 1, 768000 ])
// audio_channels = 1  (set by showSubMenu when channels is a slider range like [ 1, 32 ])
// audio_format = 'S16LE' (first item in { S16LE, S16BE, … } sorted stably → S16LE wins)
function baseP(overrides = {}) {
  return {
    video_device: JSON.stringify(HDWebcam),
    video_codec: JSON.stringify(vah264lpenc),
    video_capture: WEBCAM_CAP_RAW_1280,
    video_format: 'YUY2',       // fixed value in cap, not a list/range
    video_drm_format: undefined,
    video_width: 1280,
    video_height: 720,
    video_framerate: 10,        // parseInt('10/1') = 10  (fixed value, not a list)
    audio_device: JSON.stringify(HDMIMonitor3),
    audio_codec: JSON.stringify(opusenc),
    audio_sampling: HDMI3_SAMPLING,
    audio_format: 'S16LE',      // first in { S16LE, S16BE, … } stable sort
    audio_rate: 48000,          // set by showSubMenu for slider [ 1, 768000 ]
    audio_channels: 1,          // set by showSubMenu for slider [ 1, 32 ]
    ...overrides,
  }
}

function pipe(s) {
  return s.replaceAll('\n', '')
}

const PULSESRC_HDMI3 =
  'pulsesrc device=alsa_output.pci-0000_00_1f.3-platform-skl_hda_dsp_generic.HiFi__HDMI3__sink.monitor'

// ─── default codec ordering ───────────────────────────────────────────────────
describe('LINUX_X86 default codec selection', () => {
  it('sortByOrder picks vah264lpenc first (H264 > H265)', () => {
    const options = fixture.codecs.video.map((c) => ({ text: c.name, value: c.name }))
    const sorted = sortByOrder(options, ['264', '265', 'vp8', 'vp9', 'av1'])
    expect(sorted[0].text).toBe('vah264lpenc')
    expect(sorted[1].text).toBe('vah265lpenc')
  })

  it('sortByOrder picks opusenc first (opus > mulaw)', () => {
    const options = fixture.codecs.audio.map((c) => ({ text: c.name, value: c.name }))
    const sorted = sortByOrder(options, ['opus', 'mulaw'])
    expect(sorted[0].text).toBe('opusenc')
  })

  it('getCaptureList puts video/x-raw, before video/x-raw( (so plain YUY2 1280×720 is default)', () => {
    const order = ['video/x-h264', 'video/x-h265', 'video/x-raw,', 'video/x-raw(']
    const sorted = [...HDWebcam.caps]
      .map((cap) => ({ text: cap, value: cap }))
      .sort((a, b) => {
        const ai = order.findIndex((k) => a.text.includes(k))
        const bi = order.findIndex((k) => b.text.includes(k))
        return ai - bi
      })
    expect(sorted[0].value).toBe(WEBCAM_CAP_RAW_1280)
    expect(sorted[0].value).toContain('video/x-raw, format=YUY2, width=1280')
  })
})

// ─── video pipeline ───────────────────────────────────────────────────────────
describe('LINUX_X86 video pipeline', () => {
  it('vah264lpenc (default) — plain x-raw 1280×720@10fps', () => {
    expect(pipe(buildVidePipeline(baseP()))).toBe(
      'v4l2src io-mode=dmabuf do-timestamp=true ! ' +
        'video/x-raw, format=YUY2, width=1280, height=720, pixel-aspect-ratio=1/1, framerate=10/1 ! ' +
        'videoconvert ! ' +
        'queue max-size-buffers=1 leaky=downstream ! ' +
        'vah264lpenc ! ' +
        'h264parse ! ' +
        'rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=96 ! ' +
        'application/x-rtp,media=video,encoding-name=H264,payload=96',
    )
  })

  it('vah265lpenc — VA-API H.265', () => {
    expect(pipe(buildVidePipeline(baseP({ video_codec: JSON.stringify(vah265lpenc) })))).toBe(
      'v4l2src io-mode=dmabuf do-timestamp=true ! ' +
        'video/x-raw, format=YUY2, width=1280, height=720, pixel-aspect-ratio=1/1, framerate=10/1 ! ' +
        'videoconvert ! ' +
        'queue max-size-buffers=1 leaky=downstream ! ' +
        'vah265lpenc ! ' +
        'h265parse ! ' +
        'rtph265pay config-interval=-1 aggregate-mode=zero-latency pt=96 ! ' +
        'application/x-rtp,media=video,encoding-name=H265,payload=96',
    )
  })

  it('vah264lpenc with DMABuf capture — embeddedVideo leaves fixed values unchanged', () => {
    // DMABuf cap: fixed drm-format=YUYV, fixed width/height/framerate
    const P = baseP({
      video_capture: WEBCAM_CAP_DMA_1280,
      video_format: 'DMA_DRM',   // fixed in cap
      video_drm_format: 'YUYV',  // fixed in cap
      video_framerate: 10,        // fixed value 10/1
    })
    expect(pipe(buildVidePipeline(P))).toBe(
      'v4l2src io-mode=dmabuf do-timestamp=true ! ' +
        'video/x-raw(memory:DMABuf), format=DMA_DRM, drm-format=YUYV, width=1280, height=720, pixel-aspect-ratio=1/1, framerate=10/1 ! ' +
        'videoconvert ! ' +
        'queue max-size-buffers=1 leaky=downstream ! ' +
        'vah264lpenc ! ' +
        'h264parse ! ' +
        'rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=96 ! ' +
        'application/x-rtp,media=video,encoding-name=H264,payload=96',
    )
  })
})

// ─── audio pipeline ───────────────────────────────────────────────────────────
// LINUX_X86 uses buildAudioPipeline_ALSA: queue → audioconvert → audioresample (differs from macOS)
describe('LINUX_X86 audio pipeline', () => {
  it('opusenc (default) — queue → audioconvert → audioresample order', () => {
    expect(pipe(buildAudioPipeline(baseP()))).toBe(
      PULSESRC_HDMI3 +
        ' ! ' +
        'audio/x-raw, format=S16LE, layout=interleaved, rate=48000, channels=1 ! ' +
        'queue max-size-buffers=1 leaky=downstream ! ' +
        'audioconvert ! ' +
        'audioresample ! ' +
        'opusenc perfect-timestamp=true ! ' +
        'rtpopuspay pt=97 ! ' +
        'application/x-rtp,media=audio,encoding-name=OPUS,payload=97',
    )
  })

  it('mulawenc — payload type 0 (PCMU fixed)', () => {
    expect(pipe(buildAudioPipeline(baseP({ audio_codec: JSON.stringify(mulawenc) })))).toBe(
      PULSESRC_HDMI3 +
        ' ! ' +
        'audio/x-raw, format=S16LE, layout=interleaved, rate=48000, channels=1 ! ' +
        'queue max-size-buffers=1 leaky=downstream ! ' +
        'audioconvert ! ' +
        'audioresample ! ' +
        'mulawenc ! ' +
        'rtppcmupay pt=0 ! ' +
        'application/x-rtp,media=audio,encoding-name=PCMU,payload=0',
    )
  })
})
