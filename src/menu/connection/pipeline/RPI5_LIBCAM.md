# openh264enc
```
Pad Templates:
  SINK template: 'sink'
    Availability: Always
    Capabilities:
      video/x-raw
                 format: I420
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]

  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-h264
          stream-format: byte-stream
              alignment: au
                profile: { (string)constrained-baseline, (string)baseline, (string)main, (string)constrained-high, (string)high }

Element Properties:

  adaptive-quantization: Adaptive quantization
                        flags: readable, writable
                        Boolean. Default: true

  background-detection: Background detection
                        flags: readable, writable
                        Boolean. Default: true

  bitrate             : Bitrate (in bits per second)
                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 128000

  complexity          : Complexity
                        flags: readable, writable
                        Enum "GstOpenh264encComplexity" Default: 1, "medium"
                           (0): low              - Low complexity / high speed encoding
                           (1): medium           - Medium complexity / medium speed encoding
                           (2): high             - High complexity / low speed encoding

  deblocking          : Deblocking mode
                        flags: readable, writable
                        Enum "GstOpenh264encDeblockingModes" Default: 0, "on"
                           (0): on               - Deblocking on
                           (1): off              - Deblocking off
                           (2): not-slice-boundaries - Deblocking on, except for slice boundaries

  enable-denoise      : Denoise control
                        flags: readable, writable
                        Boolean. Default: false

  enable-frame-skip   : Skip frames to reach target bitrate
                        flags: readable, writable
                        Boolean. Default: false

  gop-size            : Number of frames between intra frames
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 4294967295 Default: 90

  max-bitrate         : Maximum Bitrate (in bits per second)
                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 0

  max-slice-size      : The maximum size of one slice (in bytes).
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 4294967295 Default: 1500000

  min-force-key-unit-interval: Minimum interval between force-keyunit requests in nanoseconds
                        flags: readable, writable
                        Unsigned Integer64. Range: 0 - 18446744073709551615 Default: 0

  multi-thread        : The number of threads.
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 4294967295 Default: 0

  name                : The name of the object
                        flags: readable, writable
                        String. Default: "openh264enc0"

  num-slices          : The number of slices (needs slice-mode=n-slices)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 4294967295 Default: 1

  parent              : The parent of the object
                        flags: readable, writable
                        Object of type "GstObject"

  qos                 : Handle Quality-of-Service events from downstream
                        flags: readable, writable
                        Boolean. Default: false

  qp-max              : Maximum quantizer
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 51 Default: 51

  qp-min              : Minimum quantizer
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 51 Default: 0

  rate-control        : Rate control mode
                        flags: readable, writable
                        Enum "RC_MODES" Default: 0, "quality"
                           (0): quality          - Quality mode
                           (1): bitrate          - Bitrate mode
                           (2): buffer           - No bitrate control, just using buffer status
                           (-1): off              - Rate control off mode

  scene-change-detection: Scene change detection
                        flags: readable, writable
                        Boolean. Default: true

  slice-mode          : Slice mode
                        flags: readable, writable
                        Enum "GstOpenh264EncSliceModes" Default: 1, "n-slices"
                           (1): n-slices         - Fixed number of slices
                           (5): auto             - Number of slices equal to number of threads

  usage-type          : Type of video content
                        flags: readable, writable
                        Enum "EUsageType" Default: 0, "camera"
                           (0): camera           - video from camera
                           (1): screen           - screen content
```
