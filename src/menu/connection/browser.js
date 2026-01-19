import * as C from '../component'

// buildPayload -------------------------------------------
export function buildPayload() {
  const {
    video_device,
    video_codec,
    video_capture,
    //
    audio_device,
    audio_codec,
    audio_sampling,
  } = C.MenuParams

  const video = JSON.parse(video_capture)
  video.deviceId = { ideal: video_device }

  return {
    constraints: {
      video,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        deviceId: { ideal: audio_device },
      },
    },
    video_codec,
    audio_codec,
  }
}
