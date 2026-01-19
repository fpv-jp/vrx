# nvarguscamerasrc
```
Pad Templates:
  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-raw(memory:NVMM)
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
                 format: { (string)NV12, (string)P010_10LE }
              framerate: [ 0/1, 2147483647/1 ]

Pads:
  SRC: 'src'
    Pad Template: 'src'

Element Properties:

  aeantibanding       : property to set the auto exposure antibanding mode
                        flags: readable, writable
                        Enum "GstNvArgusCamAeAntiBandingMode" Default: 1, "AeAntibandingMode_Auto"
                           (0): AeAntibandingMode_Off - GST_NVCAM_AEANTIBANDING_OFF
                           (1): AeAntibandingMode_Auto - GST_NVCAM_AEANTIBANDING_AUTO
                           (2): AeAntibandingMode_50HZ - GST_NVCAM_AEANTIBANDING_50HZ
                           (3): AeAntibandingMode_60HZ - GST_NVCAM_AEANTIBANDING_60HZ

  aelock              : set or unset the auto exposure lock
                        flags: readable, writable
                        Boolean. Default: false

  aeregion            : Property to set region of interest for auto exposure
                        with values of ROI coordinates (left, top, right, bottom)
                        and weight (float number) in that order, to set the property
                        use for example: aeregion="0 0 256 256 1"
                        flags: readable, writable
                        String. Default: null

  automatic-eos       : Automatically EOS when the segment is done
                        flags: readable, writable
                        Boolean. Default: true

  awblock             : set or unset the auto white balance lock
                        flags: readable, writable
                        Boolean. Default: false

  blocksize           : Size in bytes to read per buffer (-1 = default)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4096

  bufapi-version      : set to use new Buffer API
                        flags: readable, writable
                        Boolean. Default: false

  do-timestamp        : Apply current stream time to buffers
                        flags: readable, writable
                        Boolean. Default: true

  ee-mode             : property to select edge enhnacement mode
                        flags: readable, writable
                        Enum "GstNvArgusCamEEMode" Default: 1, "EdgeEnhancement_Fast"
                           (0): EdgeEnhancement_Off - GST_NVCAM_EE_OFF
                           (1): EdgeEnhancement_Fast - GST_NVCAM_EE_FAST
                           (2): EdgeEnhancement_HighQuality - GST_NVCAM_EE_HIGHQUALITY

  ee-strength         : property to adjust edge enhancement strength
                        flags: readable, writable
                        Float. Range:              -1 -               1 Default:              -1

  exposurecompensation: property to adjust exposure compensation
                        flags: readable, writable
                        Float. Range:              -2 -               2 Default:               0

  exposuretimerange   : Property to adjust exposure time range in nanoseconds
                        Use string with values of Exposure Time Range (low, high)
                        in that order, to set the property.
                        eg: exposuretimerange="34000 358733000"
                        flags: readable, writable
                        String. Default: null

  gainrange           : Property to adjust gain range
                        Use string with values of Gain Time Range (low, high)
                        in that order, to set the property.
                        eg: gainrange="1 16"
                        flags: readable, writable
                        String. Default: null

  ispdigitalgainrange : Property to adjust digital gain range
                        Use string with values of ISP Digital Gain Range (low, high)
                        in that order, to set the property.
                        eg: ispdigitalgainrange="1 8"
                        flags: readable, writable
                        String. Default: null

  name                : The name of the object
                        flags: readable, writable
                        String. Default: "nvarguscamerasrc0"

  num-buffers         : Number of buffers to output before sending EOS (-1 = unlimited)
                        flags: readable, writable
                        Integer. Range: -1 - 2147483647 Default: -1

  parent              : The parent of the object
                        flags: readable, writable
                        Object of type "GstObject"

  saturation          : Property to adjust saturation value
                        flags: readable, writable
                        Float. Range:               0 -               2 Default:               1

  sensor-id           : Set the id of camera sensor to use. Default 0.
                        flags: readable, writable
                        Integer. Range: 0 - 255 Default: 0

  sensor-mode         : Set the camera sensor mode to use. Default -1 (Select the best match)
                        flags: readable, writable
                        Integer. Range: -1 - 255 Default: -1

  silent              : Produce verbose output ?
                        flags: readable, writable
                        Boolean. Default: true

  timeout             : timeout to capture in seconds (Either specify timeout or num-buffers, not both)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  tnr-mode            : property to select temporal noise reduction mode
                        flags: readable, writable
                        Enum "GstNvArgusCamTNRMode" Default: 1, "NoiseReduction_Fast"
                           (0): NoiseReduction_Off - GST_NVCAM_NR_OFF
                           (1): NoiseReduction_Fast - GST_NVCAM_NR_FAST
                           (2): NoiseReduction_HighQuality - GST_NVCAM_NR_HIGHQUALITY

  tnr-strength        : property to adjust temporal noise reduction strength
                        flags: readable, writable
                        Float. Range:              -1 -               1 Default:              -1

  total-sensor-modes  : Query the number of sensor modes available. Default 0
                        flags: readable
                        Integer. Range: 0 - 255 Default: 0

  typefind            : Run typefind before negotiating (deprecated, non-functional)
                        flags: readable, writable, deprecated
                        Boolean. Default: false

  wbmode              : White balance affects the color temperature of the photo
                        flags: readable, writable
                        Enum "GstNvArgusCamWBMode" Default: 1, "auto"
                           (0): off              - GST_NVCAM_WB_MODE_OFF
                           (1): auto             - GST_NVCAM_WB_MODE_AUTO
                           (2): incandescent     - GST_NVCAM_WB_MODE_INCANDESCENT
                           (3): fluorescent      - GST_NVCAM_WB_MODE_FLUORESCENT
                           (4): warm-fluorescent - GST_NVCAM_WB_MODE_WARM_FLUORESCENT
                           (5): daylight         - GST_NVCAM_WB_MODE_DAYLIGHT
                           (6): cloudy-daylight  - GST_NVCAM_WB_MODE_CLOUDY_DAYLIGHT
                           (7): twilight         - GST_NVCAM_WB_MODE_TWILIGHT
                           (8): shade            - GST_NVCAM_WB_MODE_SHADE
                           (9): manual           - GST_NVCAM_WB_MODE_MANUAL
```

# nvv4l2h264enc
```
Pad Templates:
  SINK template: 'sink'
    Availability: Always
    Capabilities:
      video/x-raw(memory:NVMM)
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
                 format: { (string)I420, (string)NV12, (string)P010_10LE, (string)NV24 }
              framerate: [ 0/1, 2147483647/1 ]

  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-h264
          stream-format: byte-stream
              alignment: { (string)au, (string)nal }

Pads:
  SINK: 'sink'
    Pad Template: 'sink'
  SRC: 'src'
    Pad Template: 'src'

Element Properties:

  EnableMVBufferMeta  : Enable Motion Vector Meta data for encoding
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  EnableTwopassCBR    : Enable two pass CBR while encoding
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  MeasureEncoderLatency: Enable Measure Encoder latency Per Frame
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  SliceIntraRefreshInterval: Set SliceIntraRefreshInterval
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 0

  bit-packetization   : Whether or not Packet size is based upon Number Of bits
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  bitrate             : Set bitrate for v4l2 encode
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4000000

  bufapi-version      : Set to use new buf API
                        flags: readable, writable
                        Boolean. Default: false

  capture-io-mode     : Capture I/O mode (matches src pad)
                        flags: readable, writable
                        Enum "GstNvV4l2EncCaptureIOMode" Default: 0, "auto"
                           (0): auto             - GST_V4L2_IO_AUTO
                           (2): mmap             - GST_V4L2_IO_MMAP

  control-rate        : Set control rate for v4l2 encode
                        flags: readable, writable, changeable only in NULL or READY state
                        Enum "GstV4l2VideoEncRateControlType" Default: 1, "constant_bitrate"
                           (0): variable_bitrate - GST_V4L2_VIDENC_VARIABLE_BITRATE
                           (1): constant_bitrate - GST_V4L2_VIDENC_CONSTANT_BITRATE

  device              : Device location
                        flags: readable
                        String. Default: "/dev/nvhost-msenc"

  device-fd           : File descriptor of the device
                        flags: readable
                        Integer. Range: -1 - 2147483647 Default: -1

  device-name         : Name of the device
                        flags: Opening in BLOCKING MODE
readable
                        String. Default: ""

  disable-cabac       : Set Entropy Coding Type CAVLC(TRUE) or CABAC(FALSE)
                        flags: readable, writable
                        Boolean. Default: false

  enable-lossless     : Enable lossless encoding for YUV444
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  extra-controls      : Extra v4l2 controls (CIDs) for the device
                        flags: readable, writable
                        Boxed pointer of type "GstStructure"

  idrinterval         : Encoding IDR Frame occurance frequency
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 256

  iframeinterval      : Encoding Intra Frame occurance frequency
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 30

  insert-aud          : Insert H.264 Access Unit Delimiter(AUD)
                        flags: readable, writable
                        Boolean. Default: false

  insert-sps-pps      : Insert H.264 SPS, PPS at every IDR frame
                        flags: readable, writable
                        Boolean. Default: false

  insert-vui          : Insert H.264 VUI(Video Usability Information) in SPS
                        flags: readable, writable
                        Boolean. Default: false

  maxperf-enable      : Enable or Disable Max Performance mode
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  min-force-key-unit-interval: Minimum interval between force-keyunit requests in nanoseconds
                        flags: readable, writable
                        Unsigned Integer64. Range: 0 - 18446744073709551615 Default: 0

  name                : The name of the object
                        flags: readable, writable
                        String. Default: "nvv4l2h264enc0"

  num-B-Frames        : Number of B Frames between two reference frames (not recommended)
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 2 Default: 0

  num-Ref-Frames      : Number of Reference Frames for encoder
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 8 Default: 1

  output-io-mode      : Output side I/O mode (matches sink pad)
                        flags: readable, writable
                        Enum "GstNvV4l2EncOutputIOMode" Default: 0, "auto"
                           (0): auto             - GST_V4L2_IO_AUTO
                           (2): mmap             - GST_V4L2_IO_MMAP
                           (5): dmabuf-import    - GST_V4L2_IO_DMABUF_IMPORT

  parent              : The parent of the object
                        flags: readable, writable
                        Object of type "GstObject"

  peak-bitrate        : Peak bitrate in variable control-rate
                         The value must be >= bitrate
                         (1.2*bitrate) is set by default(Default: 0)
                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 0

  poc-type            : Set Picture Order Count type value
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 2 Default: 0

  preset-level        : HW preset level for encoder
                        flags: readable, writable, changeable only in NULL or READY state
                        Enum "GstV4L2VideoEncHwPreset" Default: 1, "UltraFastPreset"
                           (0): DisablePreset    - Disable HW-Preset
                           (1): UltraFastPreset  - UltraFastPreset for high perf
                           (2): FastPreset       - FastPreset
                           (3): MediumPreset     - MediumPreset
                           (4): SlowPreset       - SlowPreset

  profile             : Set profile for v4l2 encode
                        flags: readable, writable, changeable only in NULL or READY state
                        Enum "GstV4l2VideoEncProfileType" Default: 0, "Baseline"
                           (0): Baseline         - GST_V4L2_H264_VIDENC_BASELINE_PROFILE
                           (2): Main             - GST_V4L2_H264_VIDENC_MAIN_PROFILE
                           (4): High             - GST_V4L2_H264_VIDENC_HIGH_PROFILE
                           (7): High444          - GST_V4L2_H264_VIDENC_HIGH_444_PREDICTIVE

  qos                 : Handle Quality-of-Service events from downstream
                        flags: readable, writable
                        Boolean. Default: false

  qp-range            : Qunatization range for P, I and B frame,
                         Use string with values of Qunatization Range
                         in MinQpP-MaxQpP:MinQpI-MaxQpI:MinQpB-MaxQpB order, to set the property.
                        flags: readable, writable
                        String. Default: null

  quant-b-frames      : Quantization parameter for B-frames (0xffffffff=component default),
                         use with ratecontrol-enable = 0
                         and preset-level = 0
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4294967295

  quant-i-frames      : Quantization parameter for I-frames (0xffffffff=component default),
                         use with ratecontrol-enable = 0
                         and preset-level = 0
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4294967295

  quant-p-frames      : Quantization parameter for P-frames (0xffffffff=component default),
                         use with ratecontrol-enable = 0
                         and preset-level = 0
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4294967295

  ratecontrol-enable  : Enable or Disable rate control mode
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: true

  slice-header-spacing: Slice Header Spacing number of macroblocks/bits in one packet
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer64. Range: 0 - 18446744073709551615 Default: 0

  vbv-size            : virtual buffer size
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4000000


Element Actions:

  "force-IDR" -> void  :  g_signal_emit_by_name (element, "force-IDR");
```

# nvv4l2h265enc
```
Pad Templates:
  SINK template: 'sink'
    Availability: Always
    Capabilities:
      video/x-raw(memory:NVMM)
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
                 format: { (string)I420, (string)NV12, (string)P010_10LE, (string)NV24 }
              framerate: [ 0/1, 2147483647/1 ]

  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-h265
          stream-format: byte-stream
              alignment: au

Pads:
  SINK: 'sink'
    Pad Template: 'sink'
  SRC: 'src'
    Pad Template: 'src'

Element Properties:

  EnableMVBufferMeta  : Enable Motion Vector Meta data for encoding
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  EnableTwopassCBR    : Enable two pass CBR while encoding
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  MeasureEncoderLatency: Enable Measure Encoder latency Per Frame
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  SliceIntraRefreshInterval: Set SliceIntraRefreshInterval
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 0

  bit-packetization   : Whether or not Packet size is based upon Number Of bits
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  bitrate             : Set bitrate for v4l2 encode
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4000000

  bufapi-version      : Set to use new buf API
                        flags: readable, writable
                        Boolean. Default: false

  capture-io-mode     : Capture I/O mode (matches src pad)
                        flags: readable, writable
                        Enum "GstNvV4l2EncCaptureIOMode" Default: 0, "auto"
                           (0): auto             - GST_V4L2_IO_AUTO
                           (2): mmap             - GST_V4L2_IO_MMAP

  control-rate        : Set control rate for v4l2 encode
                        flags: readable, writable, changeable only in NULL or READY state
                        Enum "GstV4l2VideoEncRateControlType" Default: 1, "constant_bitrate"
                           (0): variable_bitrate - GST_V4L2_VIDENC_VARIABLE_BITRATE
                           (1): constant_bitrate - GST_V4L2_VIDENC_CONSTANT_BITRATE

  device              : Device location
                        flags: readable
                        String. Default: "/dev/nvhost-msenc"

  device-fd           : File descriptor of the device
                        flags: readable
                        Integer. Range: -1 - 2147483647 Default: -1

  device-name         : Name of the device
                        flags: Opening in BLOCKING MODE
readable
                        String. Default: ""

  enable-lossless     : Enable lossless encoding for YUV444
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  extra-controls      : Extra v4l2 controls (CIDs) for the device
                        flags: readable, writable
                        Boxed pointer of type "GstStructure"

  idrinterval         : Encoding IDR Frame occurance frequency
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 256

  iframeinterval      : Encoding Intra Frame occurance frequency
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 30

  insert-aud          : Insert H.265 Access Unit Delimiter(AUD)
                        flags: readable, writable
                        Boolean. Default: false

  insert-sps-pps      : Insert H.265 SPS, PPS at every IDR frame
                        flags: readable, writable
                        Boolean. Default: false

  insert-vui          : Insert H.265 VUI(Video Usability Information) in SPS
                        flags: readable, writable
                        Boolean. Default: false

  maxperf-enable      : Enable or Disable Max Performance mode
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  min-force-key-unit-interval: Minimum interval between force-keyunit requests in nanoseconds
                        flags: readable, writable
                        Unsigned Integer64. Range: 0 - 18446744073709551615 Default: 0

  name                : The name of the object
                        flags: readable, writable
                        String. Default: "nvv4l2h265enc0"

  num-B-Frames        : Number of B Frames between two reference frames (not recommended)(Supported only on Xavier)
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 2 Default: 0

  num-Ref-Frames      : Number of Reference Frames for encoder
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 8 Default: 1

  output-io-mode      : Output side I/O mode (matches sink pad)
                        flags: readable, writable
                        Enum "GstNvV4l2EncOutputIOMode" Default: 0, "auto"
                           (0): auto             - GST_V4L2_IO_AUTO
                           (2): mmap             - GST_V4L2_IO_MMAP
                           (5): dmabuf-import    - GST_V4L2_IO_DMABUF_IMPORT

  parent              : The parent of the object
                        flags: readable, writable
                        Object of type "GstObject"

  peak-bitrate        : Peak bitrate in variable control-rate
                         The value must be >= bitrate
                         (1.2*bitrate) is set by default(Default: 0)
                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 0

  preset-level        : HW preset level for encoder
                        flags: readable, writable, changeable only in NULL or READY state
                        Enum "GstV4L2VideoEncHwPreset" Default: 1, "UltraFastPreset"
                           (0): DisablePreset    - Disable HW-Preset
                           (1): UltraFastPreset  - UltraFastPreset for high perf
                           (2): FastPreset       - FastPreset
                           (3): MediumPreset     - MediumPreset
                           (4): SlowPreset       - SlowPreset

  profile             : Set profile for v4l2 encode
                        flags: readable, writable, changeable only in NULL or READY state
                        Enum "GstV4L2VideoEncProfileType" Default: 0, "Main"
                           (0): Main             - GST_V4L2_H265_VIDENC_MAIN_PROFILE
                           (1): Main10           - GST_V4L2_H265_VIDENC_MAIN10_PROFILE

  qos                 : Handle Quality-of-Service events from downstream
                        flags: readable, writable
                        Boolean. Default: false

  qp-range            : Qunatization range for P, I and B frame,
                         Use string with values of Qunatization Range
                         in MinQpP-MaxQpP:MinQpI-MaxQpI:MinQpB-MaxQpB order, to set the property.
                        flags: readable, writable
                        String. Default: null

  quant-b-frames      : Quantization parameter for B-frames (0xffffffff=component default),
                         use with ratecontrol-enable = 0
                         and preset-level = 0
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4294967295

  quant-i-frames      : Quantization parameter for I-frames (0xffffffff=component default),
                         use with ratecontrol-enable = 0
                         and preset-level = 0
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4294967295

  quant-p-frames      : Quantization parameter for P-frames (0xffffffff=component default),
                         use with ratecontrol-enable = 0
                         and preset-level = 0
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4294967295

  ratecontrol-enable  : Enable or Disable rate control mode
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: true

  slice-header-spacing: Slice Header Spacing number of macroblocks/bits in one packet
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer64. Range: 0 - 18446744073709551615 Default: 0

  vbv-size            : virtual buffer size
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4000000


Element Actions:

  "force-IDR" -> void  :  g_signal_emit_by_name (element, "force-IDR");
```

# nvv4l2vp8enc
```
Pad Templates:
  SINK template: 'sink'
    Availability: Always
    Capabilities:
      video/x-raw(memory:NVMM)
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
                 format: { (string)I420, (string)NV12, (string)P010_10LE, (string)NV24 }
              framerate: [ 0/1, 2147483647/1 ]

  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-vp8
                profile: { (string)0, (string)1, (string)2, (string)3 }

Pads:
  SINK: 'sink'
    Pad Template: 'sink'
  SRC: 'src'
    Pad Template: 'src'

Element Properties:

  MeasureEncoderLatency: Enable Measure Encoder latency Per Frame
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  bitrate             : Set bitrate for v4l2 encode
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4000000

  bufapi-version      : Set to use new buf API
                        flags: readable, writable
                        Boolean. Default: false

  capture-io-mode     : Capture I/O mode (matches src pad)
                        flags: readable, writable
                        Enum "GstNvV4l2EncCaptureIOMode" Default: 0, "auto"
                           (0): auto             - GST_V4L2_IO_AUTO
                           (2): mmap             - GST_V4L2_IO_MMAP

  control-rate        : Set control rate for v4l2 encode
                        flags: readable, writable, changeable only in NULL or READY state
                        Enum "GstV4l2VideoEncRateControlType" Default: 1, "constant_bitrate"
                           (0): variable_bitrate - GST_V4L2_VIDENC_VARIABLE_BITRATE
                           (1): constant_bitrate - GST_V4L2_VIDENC_CONSTANT_BITRATE

  device              : Device location
                        flags: readable
                        String. Default: "/dev/nvhost-msenc"

  device-fd           : File descriptor of the device
                        flags: readable
                        Integer. Range: -1 - 2147483647 Default: -1

  device-name         : Name of the device
                        flags: Opening in BLOCKING MODE
readable
                        String. Default: ""

  enable-headers      : Enable VP8 file and frame headers, if enabled, dump elementary stream
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  extra-controls      : Extra v4l2 controls (CIDs) for the device
                        flags: readable, writable
                        Boxed pointer of type "GstStructure"

  idrinterval         : Encoding IDR Frame occurance frequency
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 256

  iframeinterval      : Encoding Intra Frame occurance frequency
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 30

  maxperf-enable      : Enable or Disable Max Performance mode
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  min-force-key-unit-interval: Minimum interval between force-keyunit requests in nanoseconds
                        flags: readable, writable
                        Unsigned Integer64. Range: 0 - 18446744073709551615 Default: 0

  name                : The name of the object
                        flags: readable, writable
                        String. Default: "nvv4l2vp8enc0"

  output-io-mode      : Output side I/O mode (matches sink pad)
                        flags: readable, writable
                        Enum "GstNvV4l2EncOutputIOMode" Default: 0, "auto"
                           (0): auto             - GST_V4L2_IO_AUTO
                           (2): mmap             - GST_V4L2_IO_MMAP
                           (5): dmabuf-import    - GST_V4L2_IO_DMABUF_IMPORT

  parent              : The parent of the object
                        flags: readable, writable
                        Object of type "GstObject"

  peak-bitrate        : Peak bitrate in variable control-rate
                         The value must be >= bitrate
                         (1.2*bitrate) is set by default(Default: 0)
                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 0

  preset-level        : HW preset level for encoder
                        flags: readable, writable, changeable only in NULL or READY state
                        Enum "GstV4L2VideoEncHwPreset" Default: 1, "UltraFastPreset"
                           (0): DisablePreset    - Disable HW-Preset
                           (1): UltraFastPreset  - UltraFastPreset for high perf
                           (2): FastPreset       - FastPreset
                           (3): MediumPreset     - MediumPreset
                           (4): SlowPreset       - SlowPreset

  qos                 : Handle Quality-of-Service events from downstream
                        flags: readable, writable
                        Boolean. Default: false

  qp-range            : Qunatization range for P, I and B frame,
                         Use string with values of Qunatization Range
                         in MinQpP-MaxQpP:MinQpI-MaxQpI:MinQpB-MaxQpB order, to set the property.
                        flags: readable, writable
                        String. Default: null

  quant-b-frames      : Quantization parameter for B-frames (0xffffffff=component default),
                         use with ratecontrol-enable = 0
                         and preset-level = 0
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4294967295

  quant-i-frames      : Quantization parameter for I-frames (0xffffffff=component default),
                         use with ratecontrol-enable = 0
                         and preset-level = 0
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4294967295

  quant-p-frames      : Quantization parameter for P-frames (0xffffffff=component default),
                         use with ratecontrol-enable = 0
                         and preset-level = 0
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4294967295

  ratecontrol-enable  : Enable or Disable rate control mode
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: true

  vbv-size            : virtual buffer size
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4000000


Element Actions:

  "force-IDR" -> void  :  g_signal_emit_by_name (element, "force-IDR");
```

# nvv4l2vp9enc
```
Pad Templates:
  SINK template: 'sink'
    Availability: Always
    Capabilities:
      video/x-raw(memory:NVMM)
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
                 format: { (string)I420, (string)NV12, (string)P010_10LE, (string)NV24 }
              framerate: [ 0/1, 2147483647/1 ]

  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-vp9
                profile: { (string)0, (string)1, (string)2, (string)3 }

Pads:
  SINK: 'sink'
    Pad Template: 'sink'
  SRC: 'src'
    Pad Template: 'src'

Element Properties:

  MeasureEncoderLatency: Enable Measure Encoder latency Per Frame
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  bitrate             : Set bitrate for v4l2 encode
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4000000

  bufapi-version      : Set to use new buf API
                        flags: readable, writable
                        Boolean. Default: false

  capture-io-mode     : Capture I/O mode (matches src pad)
                        flags: readable, writable
                        Enum "GstNvV4l2EncCaptureIOMode" Default: 0, "auto"
                           (0): auto             - GST_V4L2_IO_AUTO
                           (2): mmap             - GST_V4L2_IO_MMAP

  control-rate        : Set control rate for v4l2 encode
                        flags: readable, writable, changeable only in NULL or READY state
                        Enum "GstV4l2VideoEncRateControlType" Default: 1, "constant_bitrate"
                           (0): variable_bitrate - GST_V4L2_VIDENC_VARIABLE_BITRATE
                           (1): constant_bitrate - GST_V4L2_VIDENC_CONSTANT_BITRATE

  device              : Device location
                        flags: readable
                        String. Default: "/dev/nvhost-msenc"

  device-fd           : File descriptor of the device
                        flags: readable
                        Integer. Range: -1 - 2147483647 Default: -1

  device-name         : Name of the device
                        flags: Opening in BLOCKING MODE
readable
                        String. Default: ""

  enable-headers      : Enable VP9 file and frame headers, if enabled, dump elementary stream
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  extra-controls      : Extra v4l2 controls (CIDs) for the device
                        flags: readable, writable
                        Boxed pointer of type "GstStructure"

  idrinterval         : Encoding IDR Frame occurance frequency
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 256

  iframeinterval      : Encoding Intra Frame occurance frequency
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 30

  maxperf-enable      : Enable or Disable Max Performance mode
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: false

  min-force-key-unit-interval: Minimum interval between force-keyunit requests in nanoseconds
                        flags: readable, writable
                        Unsigned Integer64. Range: 0 - 18446744073709551615 Default: 0

  name                : The name of the object
                        flags: readable, writable
                        String. Default: "nvv4l2vp9enc0"

  output-io-mode      : Output side I/O mode (matches sink pad)
                        flags: readable, writable
                        Enum "GstNvV4l2EncOutputIOMode" Default: 0, "auto"
                           (0): auto             - GST_V4L2_IO_AUTO
                           (2): mmap             - GST_V4L2_IO_MMAP
                           (5): dmabuf-import    - GST_V4L2_IO_DMABUF_IMPORT

  parent              : The parent of the object
                        flags: readable, writable
                        Object of type "GstObject"

  peak-bitrate        : Peak bitrate in variable control-rate
                         The value must be >= bitrate
                         (1.2*bitrate) is set by default(Default: 0)
                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 0

  preset-level        : HW preset level for encoder
                        flags: readable, writable, changeable only in NULL or READY state
                        Enum "GstV4L2VideoEncHwPreset" Default: 1, "UltraFastPreset"
                           (0): DisablePreset    - Disable HW-Preset
                           (1): UltraFastPreset  - UltraFastPreset for high perf
                           (2): FastPreset       - FastPreset
                           (3): MediumPreset     - MediumPreset
                           (4): SlowPreset       - SlowPreset

  qos                 : Handle Quality-of-Service events from downstream
                        flags: readable, writable
                        Boolean. Default: false

  qp-range            : Qunatization range for P, I and B frame,
                         Use string with values of Qunatization Range
                         in MinQpP-MaxQpP:MinQpI-MaxQpI:MinQpB-MaxQpB order, to set the property.
                        flags: readable, writable
                        String. Default: null

  quant-b-frames      : Quantization parameter for B-frames (0xffffffff=component default),
                         use with ratecontrol-enable = 0
                         and preset-level = 0
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4294967295

  quant-i-frames      : Quantization parameter for I-frames (0xffffffff=component default),
                         use with ratecontrol-enable = 0
                         and preset-level = 0
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4294967295

  quant-p-frames      : Quantization parameter for P-frames (0xffffffff=component default),
                         use with ratecontrol-enable = 0
                         and preset-level = 0
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4294967295

  ratecontrol-enable  : Enable or Disable rate control mode
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: true

  vbv-size            : virtual buffer size
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4000000


Element Actions:

  "force-IDR" -> void  :  g_signal_emit_by_name (element, "force-IDR");
```