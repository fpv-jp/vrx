import { describe, it, expect } from 'vitest'
import { sortByOrder } from '../../src/menu/utils/codec-utils.js'
import { buildVidePipeline, buildAudioPipeline } from '../../src/menu/pipeline/APPLE_MAC.js'
import fixture from './APPLE_MAC.json'

// ─── fixture references ───────────────────────────────────────────────────────
const FaceTimeHD = fixture.devices[0]
const NMMicAdapter = fixture.devices[2]  // NoMachine Microphone Adapter (first audio device)

const vtenc_h264_hw = fixture.codecs.video.find((c) => c.name === 'vtenc_h264_hw')
const vtenc_h265_hw = fixture.codecs.video.find((c) => c.name === 'vtenc_h265_hw')
const vp8enc = fixture.codecs.video.find((c) => c.name === 'vp8enc')
const vp9enc = fixture.codecs.video.find((c) => c.name === 'vp9enc')
const svtav1enc = fixture.codecs.video.find((c) => c.name === 'svtav1enc')
const opusenc = fixture.codecs.audio.find((c) => c.name === 'opusenc')
const mulawenc = fixture.codecs.audio.find((c) => c.name === 'mulawenc')

// Default video capture: getCaptureList sorts video/x-raw, before video/x-raw(, so the first
// non-GL cap (caps[2]) becomes the default.  1280×720 with format list and framerate list.
const FACETIME_CAP_1280 = FaceTimeHD.caps[2]

// Default audio sampling: first cap of the first audio device (NoMachine Mic Adapter)
const NM_MIC_SAMPLING = NMMicAdapter.caps[0]

// P matches what Alpine store contains after setMediaDeviceList + default UI selections.
// video_format = first in sorted { UYVY, YUY2, NV12, ARGB, BGRA } = 'UYVY' (stable sort, all NaN)
// video_framerate = parseInt('30/1') = 30  (top of descending list: 30/1, 29/1 … 1/1)
// audio_format / rate / channels: fixed values from NM_MIC_SAMPLING (not a range)
function baseP(overrides = {}) {
  return {
    video_device: JSON.stringify(FaceTimeHD),
    video_codec: JSON.stringify(vtenc_h264_hw),
    video_capture: FACETIME_CAP_1280,
    video_format: 'UYVY',
    video_drm_format: undefined,
    video_width: 1280,
    video_height: 720,
    video_framerate: 30,
    audio_device: JSON.stringify(NMMicAdapter),
    audio_codec: JSON.stringify(opusenc),
    audio_sampling: NM_MIC_SAMPLING,
    audio_format: 'F32LE',
    audio_rate: 44100,
    audio_channels: 2,
    ...overrides,
  }
}

function pipe(s) {
  return s.replaceAll('\n', '')
}

// ─── default codec ordering ───────────────────────────────────────────────────
describe('APPLE_MAC default codec selection', () => {
  it('sortByOrder picks vtenc_h264_hw first (H264 > H265 > VP8 > VP9 > AV1)', () => {
    const options = fixture.codecs.video.map((c) => ({ text: c.name, value: c.name }))
    const sorted = sortByOrder(options, ['264', '265', 'vp8', 'vp9', 'av1'])
    expect(sorted[0].text).toBe('vtenc_h264_hw')
    expect(sorted[1].text).toBe('vtenc_h265_hw')
    expect(sorted[2].text).toBe('vp8enc')
    expect(sorted[3].text).toBe('vp9enc')
    expect(sorted[4].text).toBe('svtav1enc')
  })

  it('sortByOrder picks opusenc first (opus > mulaw)', () => {
    const options = fixture.codecs.audio.map((c) => ({ text: c.name, value: c.name }))
    const sorted = sortByOrder(options, ['opus', 'mulaw'])
    expect(sorted[0].text).toBe('opusenc')
    expect(sorted[1].text).toBe('mulawenc')
  })

  it('getCaptureList puts video/x-raw, before video/x-raw( (so 1280×720 x-raw is default)', () => {
    const order = ['video/x-h264', 'video/x-h265', 'video/x-raw,', 'video/x-raw(']
    const sorted = [...FaceTimeHD.caps]
      .map((cap) => ({ text: cap, value: cap }))
      .sort((a, b) => {
        const ai = order.findIndex((k) => a.text.includes(k))
        const bi = order.findIndex((k) => b.text.includes(k))
        return ai - bi
      })
    expect(sorted[0].value).toBe(FACETIME_CAP_1280)
    expect(sorted[0].value).toContain('video/x-raw, width=1280')
  })
})

// ─── video pipeline ───────────────────────────────────────────────────────────
describe('APPLE_MAC video pipeline', () => {
  it('vtenc_h264_hw (default)', async () => {
    expect(pipe(await buildVidePipeline(baseP()))).toBe(
      'avfvideosrc do-stats=true do-timestamp=true device-index=0 ! ' +
        'video/x-raw, width=1280, height=720, format=UYVY, framerate=30/1 ! ' +
        'queue max-size-buffers=1 leaky=downstream ! ' +
        'vtenc_h264_hw realtime=true ! ' +
        'h264parse ! ' +
        'rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=96 ! ' +
        'application/x-rtp,media=video,encoding-name=H264,payload=96',
    )
  })

  it('vtenc_h265_hw', async () => {
    expect(pipe(await buildVidePipeline(baseP({ video_codec: JSON.stringify(vtenc_h265_hw) })))).toBe(
      'avfvideosrc do-stats=true do-timestamp=true device-index=0 ! ' +
        'video/x-raw, width=1280, height=720, format=UYVY, framerate=30/1 ! ' +
        'queue max-size-buffers=1 leaky=downstream ! ' +
        'vtenc_h265_hw realtime=true allow-frame-reordering=false ! ' +
        'h265parse ! ' +
        'rtph265pay config-interval=-1 aggregate-mode=zero-latency pt=96 ! ' +
        'application/x-rtp,media=video,encoding-name=H265,payload=96',
    )
  })

  it('vp8enc (requires videoconvert + I420)', async () => {
    expect(pipe(await buildVidePipeline(baseP({ video_codec: JSON.stringify(vp8enc) })))).toBe(
      'avfvideosrc do-stats=true do-timestamp=true device-index=0 ! ' +
        'video/x-raw, width=1280, height=720, format=UYVY, framerate=30/1 ! ' +
        'videoconvert ! ' +
        'video/x-raw,format=I420 ! ' +
        'queue max-size-buffers=1 leaky=downstream ! ' +
        'vp8enc deadline=1 ! ' +
        'rtpvp8pay pt=96 ! ' +
        'application/x-rtp,media=video,encoding-name=VP8,payload=96',
    )
  })

  it('vp9enc', async () => {
    expect(pipe(await buildVidePipeline(baseP({ video_codec: JSON.stringify(vp9enc) })))).toBe(
      'avfvideosrc do-stats=true do-timestamp=true device-index=0 ! ' +
        'video/x-raw, width=1280, height=720, format=UYVY, framerate=30/1 ! ' +
        'queue max-size-buffers=1 leaky=downstream ! ' +
        'vp9enc deadline=1 cpu-used=8 threads=4 lag-in-frames=0 ! ' +
        'vp9parse ! ' +
        'rtpvp9pay pt=96 ! ' +
        'queue max-size-buffers=1 leaky=downstream ! ' +
        'application/x-rtp,media=video,encoding-name=VP9,payload=96',
    )
  })

  it('svtav1enc (requires videoconvert + I420)', async () => {
    expect(pipe(await buildVidePipeline(baseP({ video_codec: JSON.stringify(svtav1enc) })))).toBe(
      'avfvideosrc do-stats=true do-timestamp=true device-index=0 ! ' +
        'video/x-raw, width=1280, height=720, format=UYVY, framerate=30/1 ! ' +
        'videoconvert ! ' +
        'video/x-raw,format=I420 ! ' +
        'queue max-size-buffers=1 leaky=downstream ! ' +
        'svtav1enc ! ' +
        'av1parse ! ' +
        'rtpav1pay pt=96 ! ' +
        'queue max-size-buffers=1 leaky=downstream ! ' +
        'application/x-rtp,media=video,encoding-name=AV1,payload=96',
    )
  })
})

// ─── audio pipeline ───────────────────────────────────────────────────────────
describe('APPLE_MAC audio pipeline', () => {
  it('opusenc (default) — audioconvert → audioresample → queue order', () => {
    expect(pipe(buildAudioPipeline(baseP()))).toBe(
      'osxaudiosrc do-timestamp=true unique-id=NMAudioMicDevice_UID ! ' +
        'audio/x-raw, format=F32LE, layout=interleaved, rate=44100, channels=2, channel-mask=0x0000000000000003 ! ' +
        'audioconvert ! ' +
        'audioresample ! ' +
        'queue max-size-buffers=1 leaky=downstream ! ' +
        'opusenc perfect-timestamp=true ! ' +
        'rtpopuspay pt=97 ! ' +
        'application/x-rtp,media=audio,encoding-name=OPUS,payload=97',
    )
  })

  it('mulawenc — payload type 0 (PCMU fixed)', () => {
    expect(pipe(buildAudioPipeline(baseP({ audio_codec: JSON.stringify(mulawenc) })))).toBe(
      'osxaudiosrc do-timestamp=true unique-id=NMAudioMicDevice_UID ! ' +
        'audio/x-raw, format=F32LE, layout=interleaved, rate=44100, channels=2, channel-mask=0x0000000000000003 ! ' +
        'audioconvert ! ' +
        'audioresample ! ' +
        'queue max-size-buffers=1 leaky=downstream ! ' +
        'mulawenc ! ' +
        'rtppcmupay pt=0 ! ' +
        'application/x-rtp,media=audio,encoding-name=PCMU,payload=0',
    )
  })
})
