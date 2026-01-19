import * as C from '../component'
import * as U from './pipeline/pipeline-utils.js'
import * as Utils from '../../utils.js'

import * as INTEL_MAC from './pipeline/INTEL_MAC'
import * as LINUX_X86 from './pipeline/LINUX_X86'
import * as RPI4_V4L2 from './pipeline/RPI4_V4L2'
import * as JETSON_NANO_2GB from './pipeline/JETSON_NANO_2GB'
import * as JETSON_ORIN_NANO_SUPER from './pipeline/JETSON_ORIN_NANO_SUPER'
import * as RADXA_ROCK_5B from './pipeline/RADXA_ROCK_5B'
import * as RADXA_ROCK_5T from './pipeline/RADXA_ROCK_5T'
import * as RPI4_LIBCAM from './pipeline/RPI4_LIBCAM'
import * as RPI5_LIBCAM from './pipeline/RPI5_LIBCAM'

// buildPayload -------------------------------------------
export async function buildPayload() {
  let P = C.MenuParams
  let { platform } = P.message

  let builder = null
  switch (platform) {
    case 'INTEL_MAC':
      builder = INTEL_MAC
      break
    case 'LINUX_X86':
      builder = LINUX_X86
      break
    case 'RPI4_V4L2':
      builder = RPI4_V4L2
      break
    case 'JETSON_NANO_2GB':
      builder = JETSON_NANO_2GB
      break
    case 'JETSON_ORIN_NANO_SUPER':
      builder = JETSON_ORIN_NANO_SUPER
      break
    case 'RADXA_ROCK_5B':
      builder = RADXA_ROCK_5B
      break
    case 'RADXA_ROCK_5T':
      builder = RADXA_ROCK_5T
      break
    case 'RPI4_LIBCAM':
      builder = RPI4_LIBCAM
      break
    case 'RPI5_LIBCAM':
      builder = RPI5_LIBCAM
      break
    case 'UNKNOWN':
    default:
  }

  let network_interface = P.network_interface
  let video_pipeline = await builder.buildVidePipeline(P)
  video_pipeline = video_pipeline.replaceAll('\n', '')//.replaceAll('(', '\\(').replaceAll(')', '\\)')
  let audio_pipeline = builder.buildAudioPipeline(P).replaceAll('\n', '')//.replaceAll('(', '\\(').replaceAll(')', '\\)')

  // Check browser's H264 profile support
  let video_profile = await Utils.checkDecodingInfo(P.video_width, P.video_height, P.video_framerate)

  // console.log('video_pipeline:', video_pipeline)
  // console.log('audio_pipeline:', audio_pipeline)
  // console.log('video_profile:', video_profile)

  let { video_priority, audio_priority, video_payload_type, audio_payload_type } = U

  return {
    network_interface,
    video_pipeline,
    audio_pipeline,
    video_priority,
    audio_priority,
    video_payload_type,
    audio_payload_type: JSON.parse(P.audio_codec).name === 'mulawenc' ? 0 : audio_payload_type,
    video_profile,
    platform,
  }
}
