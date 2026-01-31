import * as C from './component'
import * as U from './pipeline/pipeline-utils.js'
import * as Utils from '../utils.js'

import * as APPLE_MAC from './pipeline/APPLE_MAC'
import * as LINUX_X86 from './pipeline/LINUX_X86'
import * as RASPBERRY_PI_4 from './pipeline/RASPBERRY_PI_4'
import * as RASPBERRY_PI_5 from './pipeline/RASPBERRY_PI_5'
import * as JETSON_NANO_2GB from './pipeline/JETSON_NANO_2GB'
import * as JETSON_ORIN_NANO_SUPER from './pipeline/JETSON_ORIN_NANO_SUPER'
import * as RADXA_ROCK_5 from './pipeline/RADXA_ROCK_5'

// buildPayload -------------------------------------------
export async function buildPayload() {
  let P = C.MenuParams
  let { platform } = P.message

  let builder = null
  switch (platform) {
    case 'APPLE_MAC':
      builder = APPLE_MAC
      break
    case 'LINUX_X86':
      builder = LINUX_X86
      break
    case 'RASPBERRY_PI_4B':
    case 'RASPBERRY_PI_4CM':
      builder = RASPBERRY_PI_4
      break
    case 'RASPBERRY_PI_5':
      builder = RASPBERRY_PI_5
      break
    case 'JETSON_NANO_2GB':
      builder = JETSON_NANO_2GB
      break
    case 'JETSON_ORIN_NANO_SUPER':
      builder = JETSON_ORIN_NANO_SUPER
      break
    case 'RADXA_ROCK_5B':
    case 'RADXA_ROCK_5T':
      builder = RADXA_ROCK_5
      break
    case 'UNKNOWN':
    default:
  }

  let network_interface = P.network_interface
  
  let flight_controller = P.flight_controller

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
    flight_controller,
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
