# mpph264enc
```
Pad Templates:
  SINK template: 'sink'
    Availability: Always
    Capabilities:
      video/x-raw
                 format: { (string)NV12, (string)I420, (string)YUY2, (string)UYVY, (string)BGR16, (string)RGB16, (string)ABGR, (string)ARGB, (string)BGRA, (string)RGBA, (string)xBGR, (string)xRGB, (string)BGR
x, (string)RGBx, (string)NV12, (string)NV21, (string)I420, (string)YV12, (string)NV16, (string)NV61, (string)BGR16, (string)RGB, (string)BGR, (string)RGBA, (string)BGRA, (string)RGBx, (string)BGRx, (string)NV
24, (string)Y444 }
                  width: [ 96, 2147483647 ]
                 height: [ 64, 2147483647 ]

  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-h264
                  width: [ 96, 2147483647 ]
                 height: [ 64, 2147483647 ]
          stream-format: { (string)byte-stream }
              alignment: { (string)au }
                profile: { (string)baseline, (string)main, (string)high }

Element Properties:

  arm-afbc            : Input is ARM AFBC compressed format
                        flags: readable, writable
                        Boolean. Default: false

  bps                 : Target BPS (0 = auto calculate)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  bps-max             : Max BPS (0 = auto calculate)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  bps-min             : Min BPS (0 = auto calculate)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  gop                 : Group of pictures starting with I frame (-1 = FPS, 1 = all I frames)
                        flags: readable, writable
                        Integer. Range: -1 - 2147483647 Default: -1

  header-mode         : Header mode
                        flags: readable, writable
                        Enum "MppEncHeaderMode" Default: 0, "first-frame"
                           (0): first-frame      - Only in the first frame
                           (1): each-idr         - In every IDR frames

  height              : Height (0 = original)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  level               : H264 level (40~41 = 1080p@30fps, 42 = 1080p60fps, 50~52 = 4K@30fps)
                        flags: readable, writable
                        Enum "GstMppH264Level" Default: 40, "4"
                           (10): 1                - 1
                           (99): 1b               - 1b
                           (11): 1.1              - 1.1
                           (12): 1.2              - 1.2
                           (13): 1.3              - 1.3
                           (20): 2                - 2
                           (21): 2.1              - 2.1
                           (22): 2.2              - 2.2
                           (30): 3                - 3
                           (31): 3.1              - 3.1
                           (32): 3.2              - 3.2
                           (40): 4                - 4
                           (41): 4.1              - 4.1
                           (42): 4.2              - 4.2
                           (50): 5                - 5
                           (51): 5.1              - 5.1
                           (52): 5.2              - 5.2
                           (60): 6                - 6
                           (61): 6.1              - 6.1
                           (62): 6.2              - 6.2

  max-reenc           : Max re-encode times for one frame
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 3 Default: 1

  min-force-key-unit-interval: Minimum interval between force-keyunit requests in nanoseconds
                        flags: readable, writable
                        Unsigned Integer64. Range: 0 - 18446744073709551615 Default: 0

  name                : The name of the object
                        flags: readable, writable
                        String. Default: "mpph264enc0"

  parent              : The parent of the object
                        flags: readable, writable
                        Object of type "GstObject"

  profile             : H264 profile
                        flags: readable, writable
                        Enum "GstMppH264Profile" Default: 100, "high"
                           (66): baseline         - Baseline
                           (77): main             - Main
                           (100): high             - High

  qos                 : Handle Quality-of-Service events from downstream
                        flags: readable, writable
                        Boolean. Default: false

  qp-delta-ip         : Delta QP between I and P (-1 = default)
                        flags: readable, writable
                        Integer. Range: -1 - 8 Default: -1

  qp-init             : Initial QP (lower value means higher quality)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 51 Default: 26

  qp-max              : Max QP (0 = default)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 51 Default: 0

  qp-max-i            : Max Intra QP (0 = default)
                        flags:
(gst-inspect-1.0:12438): GLib-GObject-CRITICAL **: 23:32:46.104: g_value_set_uint: assertion 'G_VALUE_HOLDS_UINT (value)' failed
readable, writable
                        Integer. Range: 0 - 51 Default: 0

  qp-min              : Min QP (0 = default)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 51 Default: 0

  qp-min-i            : Min Intra QP (0 = default)
                        flags:
(gst-inspect-1.0:12438): GLib-GObject-CRITICAL **: 23:32:46.104: g_value_set_uint: assertion 'G_VALUE_HOLDS_UINT (value)' failed
readable, writable
                        Integer. Range: 0 - 51 Default: 0

  rc-mode             : RC mode
                        flags: readable, writable
                        Enum "GstMppEncRcMode" Default: 1, "cbr"
                           (0): vbr              - Variable bitrate
                           (1): cbr              - Constant bitrate
                           (2): fixqp            - Fixed QP

  rotation            : Rotation
                        flags: readable, writable
                        Enum "GstMppEncRotation" Default: 0, "0"
                           (0): 0                - Rotate 0
                           (90): 90               - Rotate 90
                           (180): 180              - Rotate 180
                           (270): 270              - Rotate 270

  sei-mode            : SEI mode
                        flags: readable, writable
                        Enum "GstMppEncSeiMode" Default: 0, "disable"
                           (0): disable          - SEI disabled
                           (1): one-seq          - One SEI per sequence
                           (2): one-frame        - One SEI per frame(if changed)

  width               : Width (0 = original)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  zero-copy-pkt       : Zero-copy encoded packet
                        flags: readable, writable
                        Boolean. Default: true
```


# mpph265enc
```
Pad Templates:
  SINK template: 'sink'
    Availability: Always
    Capabilities:
      video/x-raw
                 format: { (string)NV12, (string)I420, (string)YUY2, (string)UYVY, (string)BGR16, (string)RGB16, (string)ABGR, (string)ARGB, (string)BGRA, (string)RGBA, (string)xBGR, (string)xRGB, (string)BGR
x, (string)RGBx, (string)NV12, (string)NV21, (string)I420, (string)YV12, (string)NV16, (string)NV61, (string)BGR16, (string)RGB, (string)BGR, (string)RGBA, (string)BGRA, (string)RGBx, (string)BGRx, (string)NV
24, (string)Y444 }
                  width: [ 96, 2147483647 ]
                 height: [ 64, 2147483647 ]

  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-h265
                  width: [ 96, 2147483647 ]
                 height: [ 64, 2147483647 ]
          stream-format: { (string)byte-stream }
              alignment: { (string)au }

Element Properties:

  arm-afbc            : Input is ARM AFBC compressed format
                        flags: readable, writable
                        Boolean. Default: false

  bps                 : Target BPS (0 = auto calculate)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  bps-max             : Max BPS (0 = auto calculate)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  bps-min             : Min BPS (0 = auto calculate)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  gop                 : Group of pictures starting with I frame (-1 = FPS, 1 = all I frames)
                        flags: readable, writable
                        Integer. Range: -1 - 2147483647 Default: -1

  header-mode         : Header mode
                        flags: readable, writable
                        Enum "MppEncHeaderMode" Default: 0, "first-frame"
                           (0): first-frame      - Only in the first frame
                           (1): each-idr         - In every IDR frames

  height              : Height (0 = original)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  max-reenc           : Max re-encode times for one frame
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 3 Default: 1

  min-force-key-unit-interval: Minimum interval between force-keyunit requests in nanoseconds
                        flags: readable, writable
                        Unsigned Integer64. Range: 0 - 18446744073709551615 Default: 0

  name                : The name of the object
                        flags: readable, writable
                        String. Default: "mpph265enc0"

  parent              : The parent of the object
                        flags: readable, writable
                        Object of type "GstObject"

  qos                 : Handle Quality-of-Service events from downstream
                        flags: readable, writable
                        Boolean. Default: false

  qp-delta-ip         : Delta QP between I and P (-1 = default)
                        flags: readable, writable
                        Integer. Range: -1 - 8 Default: -1

  qp-init             : Initial QP (lower value means higher quality)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 51 Default: 26

  qp-max              : Max QP (0 = default)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 51 Default: 0

  qp-max-i            : Max Intra QP (0 = default)
                        flags:
(gst-inspect-1.0:12445): GLib-GObject-CRITICAL **: 23:35:00.032: g_value_set_uint: assertion 'G_VALUE_HOLDS_UINT (value)' failed
readable, writable
                        Integer. Range: 0 - 51 Default: 0

  qp-min              : Min QP (0 = default)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 51 Default: 0

  qp-min-i            : Min Intra QP (0 = default)
                        flags:
(gst-inspect-1.0:12445): GLib-GObject-CRITICAL **: 23:35:00.032: g_value_set_uint: assertion 'G_VALUE_HOLDS_UINT (value)' failed
readable, writable
                        Integer. Range: 0 - 51 Default: 0

  rc-mode             : RC mode
                        flags: readable, writable
                        Enum "GstMppEncRcMode" Default: 1, "cbr"
                           (0): vbr              - Variable bitrate
                           (1): cbr              - Constant bitrate
                           (2): fixqp            - Fixed QP

  rotation            : Rotation
                        flags: readable, writable
                        Enum "GstMppEncRotation" Default: 0, "0"
                           (0): 0                - Rotate 0
                           (90): 90               - Rotate 90
                           (180): 180              - Rotate 180
                           (270): 270              - Rotate 270

  sei-mode            : SEI mode
                        flags: readable, writable
                        Enum "GstMppEncSeiMode" Default: 0, "disable"
                           (0): disable          - SEI disabled
                           (1): one-seq          - One SEI per sequence
                           (2): one-frame        - One SEI per frame(if changed)

  width               : Width (0 = original)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  zero-copy-pkt       : Zero-copy encoded packet
                        flags: readable, writable
                        Boolean. Default: true
```

# mppvp8enc
```
Pad Templates:
  SINK template: 'sink'
    Availability: Always
    Capabilities:
      video/x-raw
                 format: { (string)NV12, (string)I420, (string)YUY2, (string)UYVY, (string)BGR16, (string)RGB16, (string)ABGR, (string)ARGB, (string)BGRA, (string)RGBA, (string)xBGR, (string)xRGB, (string)BGR
x, (string)RGBx, (string)NV12, (string)NV21, (string)I420, (string)YV12, (string)NV16, (string)NV61, (string)BGR16, (string)RGB, (string)BGR, (string)RGBA, (string)BGRA, (string)RGBx, (string)BGRx }
                  width: [ 128, 2147483647 ]
                 height: [ 64, 2147483647 ]

  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-vp8
                  width: [ 128, 2147483647 ]
                 height: [ 64, 2147483647 ]

Pads:
  SINK: 'sink'
    Pad Template: 'sink'
  SRC: 'src'
    Pad Template: 'src'

Element Properties:

  arm-afbc            : Input is ARM AFBC compressed format
                        flags: readable, writable
                        Boolean. Default: false

  bps                 : Target BPS (0 = auto calculate)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  bps-max             : Max BPS (0 = auto calculate)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  bps-min             : Min BPS (0 = auto calculate)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  gop                 : Group of pictures starting with I frame (-1 = FPS, 1 = all I frames)
                        flags: readable, writable
                        Integer. Range: -1 - 2147483647 Default: -1

  header-mode         : Header mode
                        flags: readable, writable
                        Enum "MppEncHeaderMode" Default: 0, "first-frame"
                           (0): first-frame      - Only in the first frame
                           (1): each-idr         - In every IDR frames

  height              : Height (0 = original)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  max-reenc           : Max re-encode times for one frame
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 3 Default: 1

  min-force-key-unit-interval: Minimum interval between force-keyunit requests in nanoseconds
                        flags: readable, writable
                        Unsigned Integer64. Range: 0 - 18446744073709551615 Default: 0

  name                : The name of the object
                        flags: readable, writable
                        String. Default: "mppvp8enc0"

  parent              : The parent of the object
                        flags: readable, writable
                        Object of type "GstObject"

  qos                 : Handle Quality-of-Service events from downstream
                        flags: readable, writable
                        Boolean. Default: false

  qp-delta-ip         : Delta QP between I and P
                        flags: readable, writable
                        Integer. Range: -1 - 8 Default: 6

  qp-init             : Initial QP (lower value means higher quality)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 127 Default: 40

  qp-max              : Max QP
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 127 Default: 127

  qp-max-i            : Max Intra QP
                        flags:
(gst-inspect-1.0:12468): GLib-GObject-CRITICAL **: 23:38:29.647: g_value_set_uint: assertion 'G_VALUE_HOLDS_UINT (value)' failed
readable, writable
                        Integer. Range: 0 - 127 Default: 0

  qp-min              : Min QP
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 127 Default: 0

  qp-min-i            : Min Intra QP
                        flags:
(gst-inspect-1.0:12468): GLib-GObject-CRITICAL **: 23:38:29.647: g_value_set_uint: assertion 'G_VALUE_HOLDS_UINT (value)' failed
readable, writable
                        Integer. Range: 0 - 127 Default: 0

  rc-mode             : RC mode
                        flags: readable, writable
                        Enum "GstMppEncRcMode" Default: 1, "cbr"
                           (0): vbr              - Variable bitrate
                           (1): cbr              - Constant bitrate
                           (2): fixqp            - Fixed QP

  rotation            : Rotation
                        flags: readable, writable
                        Enum "GstMppEncRotation" Default: 0, "0"
                           (0): 0                - Rotate 0
                           (90): 90               - Rotate 90
                           (180): 180              - Rotate 180
                           (270): 270              - Rotate 270

  sei-mode            : SEI mode
                        flags: readable, writable
                        Enum "GstMppEncSeiMode" Default: 0, "disable"
                           (0): disable          - SEI disabled
                           (1): one-seq          - One SEI per sequence
                           (2): one-frame        - One SEI per frame(if changed)

  width               : Width (0 = original)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  zero-copy-pkt       : Zero-copy encoded packet
                        flags: readable, writable
                        Boolean. Default: true
```
