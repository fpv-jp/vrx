# vtenc_h264_hw
```
Pad Templates:
  SINK template: 'sink'
    Availability: Always
    Capabilities:
      video/x-raw
                 format: { (string)AYUV64, (string)UYVY, (string)NV12, (string)I420, (string)ARGB64_BE, (string)RGBA64_LE }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]

  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-h264
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
         interlace-mode: { (string)progressive, (string)interleaved }
          stream-format: avc
              alignment: au

Element Properties:

  allow-frame-reordering: Whether to allow frame reordering or not
                        Boolean. Default: true

  bitrate             : Target video bitrate in kbps (0 = auto)
                        Unsigned Integer. Range: 0 - 4294967295 Default: 0

  data-rate-limits    : Desired bitrate in kbps averaged over a duration in seconds: bitrate,duration (0,0 = disabled)
                        String. Default: "0,0.00000"

  max-keyframe-interval: Maximum number of frames between keyframes (0 = auto)
                        Integer. Range: 0 - 2147483647 Default: 0

  max-keyframe-interval-duration: Maximum number of nanoseconds between keyframes (0 = no limit)
                        Unsigned Integer64. Range: 0 - 18446744073709551615 Default: 0

  min-force-key-unit-interval: Minimum interval between force-keyunit requests in nanoseconds
                        Unsigned Integer64. Range: 0 - 18446744073709551615 Default: 0

  name                : The name of the object
                        String. Default: "vtenc_h264_hw0"

  parent              : The parent of the object
                        Object of type "GstObject"

  qos                 : Handle Quality-of-Service events from downstream
                        Boolean. Default: false

  quality             : The desired compression quality
                        Double. Range:               0 -               1 Default:             0.5

  rate-control        : Desired rate control for the encoder
                        Enum "GstVtencRateControl" Default: 0, "abr"
                           (0): abr              - Average Bitrate
                           (1): cbr              - Constant Bitrate

  realtime            : Configure the encoder for realtime output
                        Boolean. Default: false
```

# vtenc_h265_hw
```
Element Flags:

Pad Templates:
  SINK template: 'sink'
    Availability: Always
    Capabilities:
      video/x-raw
                 format: { (string)AYUV64, (string)UYVY, (string)NV12, (string)I420, (string)ARGB64_BE, (string)RGBA64_LE }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]

  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-h265
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
         interlace-mode: { (string)progressive, (string)interleaved }
          stream-format: hvc1
              alignment: au

Element Properties:

  allow-frame-reordering: Whether to allow frame reordering or not
                        Boolean. Default: true

  bitrate             : Target video bitrate in kbps (0 = auto)
                        Unsigned Integer. Range: 0 - 4294967295 Default: 0

  data-rate-limits    : Desired bitrate in kbps averaged over a duration in seconds: bitrate,duration (0,0 = disabled)
                        String. Default: "0,0.00000"

  max-keyframe-interval: Maximum number of frames between keyframes (0 = auto)
                        Integer. Range: 0 - 2147483647 Default: 0

  max-keyframe-interval-duration: Maximum number of nanoseconds between keyframes (0 = no limit)
                        Unsigned Integer64. Range: 0 - 18446744073709551615 Default: 0

  min-force-key-unit-interval: Minimum interval between force-keyunit requests in nanoseconds
                        Unsigned Integer64. Range: 0 - 18446744073709551615 Default: 0

  name                : The name of the object
                        String. Default: "vtenc_h265_hw0"

  parent              : The parent of the object
                        Object of type "GstObject"

  qos                 : Handle Quality-of-Service events from downstream
                        Boolean. Default: false

  quality             : The desired compression quality
                        Double. Range:               0 -               1 Default:             0.5

  rate-control        : Desired rate control for the encoder
                        Enum "GstVtencRateControl" Default: 0, "abr"
                           (0): abr              - Average Bitrate
                           (1): cbr              - Constant Bitrate

  realtime            : Configure the encoder for realtime output
                        Boolean. Default: false
```