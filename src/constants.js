const Constants = {
  ChannelLabel: Object.freeze({
    CMD: 'CMD',
    // use browser
    IMU: 'IMU',
    AHRS: 'AHRS',
    INS: 'INS',
    GNSS: 'GNSS',
    RTK: 'RTK',
    BAT: 'BAT',
    // use Betaflight (gstreamer)
    MSP_RAW_IMU: 'MSP_RAW_IMU',
    MSP_RAW_GPS: 'MSP_RAW_GPS',
    MSP_COMP_GPS: 'MSP_COMP_GPS',
    MSP_ATTITUDE: 'MSP_ATTITUDE',
    MSP_ALTITUDE: 'MSP_ALTITUDE',
    MSP_ANALOG: 'MSP_ANALOG',
    MSP_SONAR: 'MSP_SONAR',
    MSP_BATTERY_STATE: 'MSP_BATTERY_STATE',
    WPA_SUPPLICANT: 'WPA_SUPPLICANT',
    VTX_NOTIFY_MESSAGE: 'VTX_NOTIFY_MESSAGE',
  }),
  Command: Object.freeze({
    HANG_UP: 0,
    PING: 1,
    PONG: 2,
    SEND_KEYFRAME_REQUEST: 3,
    SPS_PPS: 4,
    ERROR: 9,
  }),
  Source: Object.freeze({
    BROWSER: 'browser',
    GSTREAMER: 'gstreamer',
  }),
  ICE_SERVERS: [{ urls: 'stun:stun.l.google.com:19302' }],
  // Message types that the SENDER will listen for
  SENDER: Object.freeze({
    SESSION_ID_ISSUANCE: 100,
    MEDIA_DEVICE_LIST_REQUEST: 101,
    MEDIA_STREAM_START: 102,
    SDP_ANSWER: 103,
    ICE: 104,
    RECEIVER_CLOSE: 108,
    SYSTEM_ERROR: 109,
    PLATFORM_INFO: 110,
  }),
  // Message types that the RECEIVER will listen for
  RECEIVER: Object.freeze({
    SESSION_ID_ISSUANCE: 200,
    CHANGE_SENDER_ENTRIES: 201,
    MEDIA_DEVICE_LIST_RESPONSE: 202,
    SDP_OFFER: 203,
    ICE: 204,
    SENDER_CLOSE: 208,
    SYSTEM_ERROR: 209,
  }),
}

export default Constants
