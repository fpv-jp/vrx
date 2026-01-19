# nvarguscamerasrc
```
Factory Details:
  Rank                     primary (256)
  Long-name                NvArgusCameraSrc
  Klass                    Video/Capture
  Description              nVidia ARGUS Camera Source
  Author                   Viranjan Pagar <vpagar@nvidia.com>, Amit Pandya <apandya@nvidia.com>

Plugin Details:
  Name                     nvarguscamerasrc
  Description              nVidia ARGUS Source Component
  Filename                 /usr/lib/aarch64-linux-gnu/gstreamer-1.0/libgstnvarguscamerasrc.so
  Version                  1.0.0
  License                  Proprietary
  Source module            nvarguscamerasrc
  Binary package           NvARGUSCameraSrc
  Origin URL               http://nvidia.com/

GObject
 +----GInitiallyUnowned
       +----GstObject
             +----GstElement
                   +----GstBaseSrc
                         +----GstNvArgusCameraSrc

Pad Templates:
  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-raw(memory:NVMM)
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
                 format: { (string)NV12 }
              framerate: [ 0/1, 2147483647/1 ]

Element has no clocking capabilities.
Element has no URI handling capabilities.

Pads:
  SRC: 'src'
    Pad Template: 'src'

Element Properties:
  acquire-wait        : Set the waiting time for the acquireFrame before timeout. Default 5000000000 (in nanosec)
                        flags: readable, writable
                        Unsigned Integer64. Range: 5000000000 - 18446744073709551615 Default: 5000000000
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
  awblock             : set or unset the auto white balance lock
                        flags: readable, writable
                        Boolean. Default: false
  blocksize           : Size in bytes to read per buffer (-1 = default)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4096
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
  event-wait          : Set the waiting time for the event before timeout. Default 3000000000 (in nanosec)
                        flags: readable, writable
                        Unsigned Integer64. Range: 3000000000 - 18446744073709551615 Default: 3000000000
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
                        flags: readable, writable, 0x2000
                        String. Default: "nvarguscamerasrc0"
  num-buffers         : Number of buffers to output before sending EOS (-1 = unlimited)
                        flags: readable, writable
                        Integer. Range: -1 - 2147483647 Default: -1
  parent              : The parent of the object
                        flags: readable, writable, 0x2000
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
  show-latency        : Show capture latency between start of frame and GstBuffer push
                        flags: readable, writable
                        Boolean. Default: false
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

# nvv4l2camerasrc
```
Factory Details:
  Rank                     primary (256)
  Long-name                NvV4l2CameraSrc
  Klass                    Video/Capture
  Description              Nvidia V4l2 Camera Source
  Author                   Ashwin Deshpande <ashwind@nvidia.com>

Plugin Details:
  Name                     nvv4l2camerasrc
  Description              Nvidia v4l2 Source Component
  Filename                 /usr/lib/aarch64-linux-gnu/gstreamer-1.0/libgstnvv4l2camerasrc.so
  Version                  1.14.5
  License                  Proprietary
  Source module            nvv4l2camerasrc
  Binary package           NvV4l2CameraSrc
  Origin URL               http://nvidia.com/

GObject
 +----GInitiallyUnowned
       +----GstObject
             +----GstElement
                   +----GstBaseSrc
                         +----GstNvV4l2CameraSrc

Pad Templates:
  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-raw(memory:NVMM)
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
                 format: { (string)UYVY }
         interlace-mode: { (string)progressive, (string)interlaced }
              framerate: [ 0/1, 2147483647/1 ]

Element has no clocking capabilities.
Element has no URI handling capabilities.

Pads:
  SRC: 'src'
    Pad Template: 'src'

Element Properties:
  blocksize           : Size in bytes to read per buffer (-1 = default)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4096
  cap-buffers         : number of capture buffers
                        flags: readable, writable
                        Unsigned Integer. Range: 2 - 16 Default: 6
  device              : Device location, default = /dev/video0
                        flags: readable, writable
                        String. Default: "/dev/video0"
  do-timestamp        : Apply current stream time to buffers
                        flags: readable, writable
                        Boolean. Default: true
  name                : The name of the object
                        flags: readable, writable, 0x2000
                        String. Default: "nvv4l2camerasrc0"
  num-buffers         : Number of buffers to output before sending EOS (-1 = unlimited)
                        flags: readable, writable
                        Integer. Range: -1 - 2147483647 Default: -1
  parent              : The parent of the object
                        flags: readable, writable, 0x2000
                        Object of type "GstObject"
  typefind            : Run typefind before negotiating (deprecated, non-functional)
                        flags: readable, writable, deprecated
                        Boolean. Default: false
```

# nvvidconv
```
Factory Details:
  Rank                     primary (256)
  Long-name                NvVidConv Plugin
  Klass                    Filter/Converter/Video/Scaler
  Description              Converts video from one colorspace to another & Resizes
  Author                   amit pandya <apandya@nvidia.com>

Plugin Details:
  Name                     nvvidconv
  Description              video Colorspace conversion & scaler
  Filename                 /usr/lib/aarch64-linux-gnu/gstreamer-1.0/libgstnvvidconv.so
  Version                  1.2.3
  License                  Proprietary
  Source module            gstreamer-nvvconv-plugin
  Binary package           GStreamer nvvconv Plugin
  Origin URL               http://nvidia.com/

GObject
 +----GInitiallyUnowned
       +----GstObject
             +----GstElement
                   +----GstBaseTransform
                         +----Gstnvvconv

Pad Templates:
  SINK template: 'sink'
    Availability: Always
    Capabilities:
      video/x-raw(memory:NVMM)
                 format: { (string)I420, (string)I420_10LE, (string)P010_10LE, (string)I420_12LE, (string)UYVY, (string)YUY2, (string)YVYU, (string)NV12, (string)NV16, (string)NV24, (string)GRAY8, (string)BGRx, (string)RGBA, (string)Y42B, (string)Y444 }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
      video/x-raw
                 format: { (string)I420, (string)UYVY, (string)YUY2, (string)YVYU, (string)NV12, (string)NV16, (string)NV24, (string)P010_10LE, (string)GRAY8, (string)BGRx, (string)RGBA, (string)Y42B, (string)Y444 }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]

  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-raw(memory:NVMM)
                 format: { (string)I420, (string)I420_10LE, (string)P010_10LE, (string)UYVY, (string)YUY2, (string)YVYU, (string)NV12, (string)NV16, (string)NV24, (string)GRAY8, (string)BGRx, (string)RGBA, (string)Y42B, (string)Y444 }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
      video/x-raw
                 format: { (string)I420, (string)UYVY, (string)YUY2, (string)YVYU, (string)NV12, (string)NV16, (string)NV24, (string)GRAY8, (string)BGRx, (string)RGBA, (string)Y42B, (string)Y444 }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]

Element has no clocking capabilities.
Element has no URI handling capabilities.

Pads:
  SINK: 'sink'
    Pad Template: 'sink'
  SRC: 'src'
    Pad Template: 'src'

Element Properties:
  bl-output           : Blocklinear output, applicable only for memory:NVMM NV12 format output buffer when compute hw is VIC
                        flags: readable, writable
                        Boolean. Default: true
  bottom              : Pixels to crop at bottom
                        flags: readable, writable
                        Integer. Range: 0 - 2147483647 Default: 0
  compute-hw          : Compute Scaling HW
                        flags: readable, writable, controllable
                        Enum "GstNvVidConvComputeHWType" Default: 0, "Default"
                           (0): Default          - Default, VIC for Jetson
                           (1): GPU              - GPU
                           (2): VIC              - VIC
  flip-method         : video flip methods
                        flags: readable, writable, controllable
                        Enum "GstNvVideoFlipMethod" Default: 0, "none"
                           (0): none             - Identity (no rotation)
                           (1): counterclockwise - Rotate counter-clockwise 90 degrees
                           (2): rotate-180       - Rotate 180 degrees
                           (3): clockwise        - Rotate clockwise 90 degrees
                           (4): horizontal-flip  - Flip horizontally
                           (5): upper-right-diagonal - Flip across upper right/lower left diagonal
                           (6): vertical-flip    - Flip vertically
                           (7): upper-left-diagonal - Flip across upper left/lower right diagonal
  gpu-id              : Set GPU Device ID for operation
                        flags: readable, writable, changeable only in NULL or READY state
                        Unsigned Integer. Range: 0 - 4294967295 Default: 0
  interpolation-method: Set interpolation methods
                        flags: readable, writable, controllable
                        Enum "GstInterpolationMethod" Default: 0, "Nearest"
                           (0): Nearest          - Nearest
                           (1): Bilinear         - Bilinear
                           (2): 5-Tap            - 5-Tap
                           (3): 10-Tap           - 10-Tap
                           (4): Smart            - Smart
                           (5): Nicest           - Nicest
  left                : Pixels to crop at left
                        flags: readable, writable
                        Integer. Range: 0 - 2147483647 Default: 0
  name                : The name of the object
                        flags: readable, writable, 0x2000
                        String. Default: "nvvconv0"
  nvbuf-memory-type   : Type of NvBufSurface Memory to be allocated for output buffers when compute hw is GPU and memory is NVMM
                        flags: readable, writable, changeable only in NULL or READY state
                        Enum "GstNvVidConvBufMemoryType" Default: 0, "nvbuf-mem-default"
                           (0): nvbuf-mem-default - Default memory allocated, specific to particular platform
                           (1): nvbuf-mem-cuda-pinned - Allocate Pinned/Host cuda memory
                           (2): nvbuf-mem-cuda-device - Allocate Device cuda memory
                           (4): nvbuf-mem-surface-array - Allocate Surface Array memory, applicable for Jetson
  output-buffers      : number of output buffers
                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                        Unsigned Integer. Range: 1 - 4294967295 Default: 4
  parent              : The parent of the object
                        flags: readable, writable, 0x2000
                        Object of type "GstObject"
  qos                 : Handle Quality-of-Service events
                        flags: readable, writable
                        Boolean. Default: false
  right               : Pixels to crop at right
                        flags: readable, writable
                        Integer. Range: 0 - 2147483647 Default: 0
  silent              : Produce verbose output ?
                        flags: readable, writable
                        Boolean. Default: false
  top                 : Pixels to crop at top
                        flags: readable, writable
                        Integer. Range: 0 - 2147483647 Default: 0
```
