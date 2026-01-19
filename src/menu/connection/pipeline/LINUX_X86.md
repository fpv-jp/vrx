# vaapih264enc
```
Pad Templates:
  SINK template: 'sink'
    Availability: Always
    Capabilities:
      video/x-raw(memory:VASurface)
                 format: { (string)NV12, (string)YV12, (string)I420, (string)YUY2, (string)UYVY, (string)Y444, (string)VUYA }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
         interlace-mode: progressive
      video/x-raw(memory:DMABuf)
                 format: { (string)NV12, (string)YV12, (string)I420, (string)YUY2, (string)UYVY, (string)Y444, (string)VUYA }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
         interlace-mode: progressive
      video/x-raw
                 format: { (string)NV12, (string)YV12, (string)I420, (string)YUY2, (string)UYVY, (string)Y444, (string)VUYA }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
         interlace-mode: progressive

  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-h264
          stream-format: { (string)avc, (string)byte-stream }
              alignment: au
                profile: { (string)main, (string)high, (string)constrained-baseline }

Element Properties:

  aud                 : Use AU (Access Unit) delimeter
                        Boolean. Default: false

  bitrate             : The desired bitrate expressed in kbps (0: auto-calculate)
                        Unsigned Integer. Range: 0 - 2048000 Default: 0

  cabac               : Enable CABAC entropy coding mode
                        Boolean. Default: false

  compliance-mode     : Tune Encode quality/performance by relaxing specification compliance restrictions
                        Enum "GstVaapiEncoderH264ComplianceMode" Default: 0, "strict"
                           (0): strict           - Strict compliance to the H264 Specification
                           (1): restrict-buf-alloc - Restrict the allocation size of coded-buffer

  cpb-length          : Length of the CPB buffer in milliseconds
                        Unsigned Integer. Range: 1 - 10000 Default: 1500

  dct8x8              : Enable adaptive use of 8x8 transforms in I-frames
                        Boolean. Default: false

  default-roi-delta-qp: The default delta-qp to apply to each Region of Interest(lower value means higher-quality, higher value means lower-quality)
                        Integer. Range: -10 - 10 Default: -10

  init-qp             : Initial quantizer value
                        Unsigned Integer. Range: 0 - 51 Default: 26

  keyframe-period     : Maximal distance between two keyframes (0: auto-calculate)
                        Unsigned Integer. Range: 0 - 4294967295 Default: 30

  max-bframes         : Number of B-frames between I and P
                        Unsigned Integer. Range: 0 - 10 Default: 0

  max-qp              : Maximum quantizer value
                        Unsigned Integer. Range: 0 - 51 Default: 51

  mbbrc               : Macroblock level Bitrate Control
                        Enum "GstVaapiEncoderMbbrc" Default: 0, "auto"
                           (0): auto             - Auto
                           (1): on               - On
                           (2): off              - Off

  min-force-key-unit-interval: Minimum interval between force-keyunit requests in nanoseconds
                        Unsigned Integer64. Range: 0 - 18446744073709551615 Default: 0

  min-qp              : Minimum quantizer value
                        Unsigned Integer. Range: 0 - 51 Default: 1

  name                : The name of the object
                        String. Default: "vaapiencodeh264-0"

  num-slices          : Number of slices per frame
                        Unsigned Integer. Range: 1 - 200 Default: 1

  num-views           : Number of Views for MVC encoding
                        Unsigned Integer. Range: 1 - 10 Default: 1

  parent              : The parent of the object
                        Object of type "GstObject"

  prediction-type     : Reference Picture Selection Modes
                        Enum "GstVaapiEncoderH264PredictionType" Default: 0, "default"
                           (0): default          - Default encode, prev/next frame as ref
                           (1): hierarchical-p   - Hierarchical P frame encode
                           (2): hierarchical-b   - Hierarchical B frame encode

  qos                 : Handle Quality-of-Service events from downstream
                        Boolean. Default: false

  qp-ib               : Difference of QP between I and B frame (available only on CQP)
                        Integer. Range: -51 - 51 Default: 0

  qp-ip               : Difference of QP between I and P frame (available only on CQP)
                        Integer. Range: -51 - 51 Default: 0

  quality-factor      : quality factor for ICQ/QVBR bitrate control mode(low value means higher-quality, higher value means lower-quality)
                        Unsigned Integer. Range: 1 - 51 Default: 26

  quality-level       : Encoding Quality Level (lower value means higher-quality/slow-encode,  higher value means lower-quality/fast-encode)
                        Unsigned Integer. Range: 1 - 7 Default: 4

  rate-control        : Rate control mode
                        Enum "GstVaapiRateControlH264" Default: 1, "cqp"
                           (1): cqp              - Constant QP
                           (2): cbr              - Constant bitrate
                           (4): vbr              - Variable bitrate
                           (5): vbr_constrained  - Variable bitrate - Constrained
                           (7): icq              - Constant QP - Intelligent
                           (8): qvbr             - Variable bitrate - Quality defined

  refs                : Number of reference frames
                        Unsigned Integer. Range: 1 - 8 Default: 1

  target-percentage   : The desired target percentage of bitrate for variable rate controls.
                        Unsigned Integer. Range: 1 - 100 Default: 70

  temporal-levels     : Number of temporal levels in the encoded stream
                        Unsigned Integer. Range: 1 - 4 Default: 1

  trellis             : The Trellis Quantization Method of Encoder
                        Boolean. Default: false

  tune                : Encoder tuning option
                        Enum "GstVaapiEncoderTuneH264" Default: 0, "none"
                           (0): none             - None
                           (1): high-compression - High compression
                           (3): low-power        - Low power mode

  view-ids            : Set of View Ids used for MVC encoding
                        Default: "<  >"
                        GstValueArray of GValues of type "guint"
```

# vaapih265enc
```
Pad Templates:
  SINK template: 'sink'
    Availability: Always
    Capabilities:
      video/x-raw(memory:VASurface)
                 format: { (string)NV12, (string)YV12, (string)I420, (string)YUY2, (string)UYVY, (string)Y444, (string)VUYA, (string)P010_10LE, (string)Y210, (string)Y410, (string)P012_LE, (string)Y212_LE }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
         interlace-mode: progressive
      video/x-raw(memory:DMABuf)
                 format: { (string)NV12, (string)YV12, (string)I420, (string)YUY2, (string)UYVY, (string)Y444, (string)VUYA, (string)P010_10LE, (string)Y210, (string)Y410, (string)P012_LE, (string)Y212_LE }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
         interlace-mode: progressive
      video/x-raw
                 format: { (string)NV12, (string)YV12, (string)I420, (string)YUY2, (string)UYVY, (string)Y444, (string)VUYA, (string)P010_10LE, (string)Y210, (string)Y410, (string)P012_LE, (string)Y212_LE }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
         interlace-mode: progressive

  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-h265
          stream-format: { (string)hvc1, (string)byte-stream }
              alignment: au
                profile: { (string)main, (string)main-10, (string)main-12, (string)main-422-10, (string)main-444, (string)main-444-10, (string)screen-extended-main, (string)screen-extended-main-10, (string)screen-extended-main-444, (string)screen-extended-main-444-10 }

Element Properties:

  bitrate             : The desired bitrate expressed in kbps (0: auto-calculate)
                        Unsigned Integer. Range: 0 - 2048000 Default: 0

  cpb-length          : Length of the CPB buffer in milliseconds
                        Unsigned Integer. Range: 1 - 10000 Default: 1500

  default-roi-delta-qp: The default delta-qp to apply to each Region of Interest(lower value means higher-quality, higher value means lower-quality)
                        Integer. Range: -10 - 10 Default: -10

  init-qp             : Initial quantizer value
                        Unsigned Integer. Range: 0 - 51 Default: 26

  keyframe-period     : Maximal distance between two keyframes (0: auto-calculate)
                        Unsigned Integer. Range: 0 - 4294967295 Default: 30

  low-delay-b         : Transforms P frames into predictive B frames. Enable it when P frames are not supported.
                        Boolean. Default: false

  max-bframes         : Number of B-frames between I and P
                        Unsigned Integer. Range: 0 - 10 Default: 0

  max-qp              : Maximum quantizer value
                        Unsigned Integer. Range: 0 - 51 Default: 51

  mbbrc               : Macroblock level Bitrate Control
                        Enum "GstVaapiEncoderMbbrc" Default: 0, "auto"
                           (0): auto             - Auto
                           (1): on               - On
                           (2): off              - Off

  min-force-key-unit-interval: Minimum interval between force-keyunit requests in nanoseconds
                        Unsigned Integer64. Range: 0 - 18446744073709551615 Default: 0

  min-qp              : Minimum quantizer value
                        Unsigned Integer. Range: 0 - 51 Default: 1

  name                : The name of the object
                        String. Default: "vaapiencodeh265-0"

  num-slices          : Number of slices per frame
                        Unsigned Integer. Range: 1 - 200 Default: 1

  num-tile-cols       : the number of columns for tile encoding
                        Unsigned Integer. Range: 1 - 20 Default: 1

  num-tile-rows       : the number of rows for tile encoding
                        Unsigned Integer. Range: 1 - 22 Default: 1

  parent              : The parent of the object
                        Object of type "GstObject"

  qos                 : Handle Quality-of-Service events from downstream
                        Boolean. Default: false

  qp-ib               : Difference of QP between I and B frame (available only on CQP)
                        Integer. Range: -51 - 51 Default: 0

  qp-ip               : Difference of QP between I and P frame (available only on CQP)
                        Integer. Range: -51 - 51 Default: 0

  quality-factor      : quality factor for ICQ/QBVR bitrate control mode (lower value means higher quality, higher value means lower quality)
                        Unsigned Integer. Range: 1 - 51 Default: 26

  quality-level       : Encoding Quality Level (lower value means higher-quality/slow-encode,  higher value means lower-quality/fast-encode)
                        Unsigned Integer. Range: 1 - 7 Default: 4

  rate-control        : Rate control mode
                        Enum "GstVaapiRateControlH265" Default: 1, "cqp"
                           (1): cqp              - Constant QP
                           (2): cbr              - Constant bitrate
                           (4): vbr              - Variable bitrate
                           (7): icq              - Constant QP - Intelligent
                           (8): qvbr             - Variable bitrate - Quality defined

  refs                : Number of reference frames
                        Unsigned Integer. Range: 1 - 3 Default: 1

  target-percentage   : The desired target percentage of bitrate for variable rate controls.
                        Unsigned Integer. Range: 1 - 100 Default: 70

  trellis             : The Trellis Quantization Method of Encoder
                        Boolean. Default: false

  tune                : Encoder tuning option
                        Enum "GstVaapiEncoderTuneH265" Default: 0, "none"
                           (0): none             - None
                           (3): low-power        - Low power mode
```

# vaapipostproc
```
Pad Templates:
  SINK template: 'sink'
    Availability: Always
    Capabilities:
      video/x-raw(memory:VASurface)
                 format: { (string)ENCODED, (string)NV12, (string)YV12, (string)I420, (string)YUY2, (string)UYVY, (string)Y444, (string)GRAY8, (string)P010_10LE, (string)P012_LE, (string)VUYA, (string)Y210, (string)Y410, (string)Y212_LE, (string)Y412_LE,
 (string)ARGB, (string)xRGB, (string)RGBA, (string)RGBx, (string)ABGR, (string)xBGR, (string)BGRA, (string)BGRx, (string)RGB16, (string)RGB, (string)BGR10A2_LE }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
         interlace-mode: { (string)progressive, (string)interleaved, (string)mixed }
      video/x-raw
                 format: { (string)ENCODED, (string)NV12, (string)YV12, (string)I420, (string)YUY2, (string)UYVY, (string)Y444, (string)GRAY8, (string)P010_10LE, (string)P012_LE, (string)VUYA, (string)Y210, (string)Y410, (string)Y212_LE, (string)Y412_LE,
 (string)ARGB, (string)xRGB, (string)RGBA, (string)RGBx, (string)ABGR, (string)xBGR, (string)BGRA, (string)BGRx, (string)RGB16, (string)RGB, (string)BGR10A2_LE }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
         interlace-mode: { (string)progressive, (string)interleaved, (string)mixed }
      video/x-raw(memory:DMABuf)
                 format: { (string)ENCODED, (string)NV12, (string)YV12, (string)I420, (string)YUY2, (string)UYVY, (string)Y444, (string)GRAY8, (string)P010_10LE, (string)P012_LE, (string)VUYA, (string)Y210, (string)Y410, (string)Y212_LE, (string)Y412_LE,
 (string)ARGB, (string)xRGB, (string)RGBA, (string)RGBx, (string)ABGR, (string)xBGR, (string)BGRA, (string)BGRx, (string)RGB16, (string)RGB, (string)BGR10A2_LE }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
         interlace-mode: { (string)progressive, (string)interleaved, (string)mixed }

  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-raw(memory:VASurface)
                 format: { (string)ENCODED, (string)NV12, (string)YV12, (string)I420, (string)YUY2, (string)UYVY, (string)Y444, (string)GRAY8, (string)P010_10LE, (string)P012_LE, (string)VUYA, (string)Y210, (string)Y410, (string)Y212_LE, (string)Y412_LE,
 (string)ARGB, (string)xRGB, (string)RGBA, (string)RGBx, (string)ABGR, (string)xBGR, (string)BGRA, (string)BGRx, (string)RGB16, (string)RGB, (string)BGR10A2_LE }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
         interlace-mode: progressive
      video/x-raw(meta:GstVideoGLTextureUploadMeta)
                 format: { (string)RGBA, (string)BGRA }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
      video/x-raw
                 format: { (string)ENCODED, (string)NV12, (string)YV12, (string)I420, (string)YUY2, (string)UYVY, (string)Y444, (string)GRAY8, (string)P010_10LE, (string)P012_LE, (string)VUYA, (string)Y210, (string)Y410, (string)Y212_LE, (string)Y412_LE,
 (string)ARGB, (string)xRGB, (string)RGBA, (string)RGBx, (string)ABGR, (string)xBGR, (string)BGRA, (string)BGRx, (string)RGB16, (string)RGB, (string)BGR10A2_LE }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
         interlace-mode: { (string)progressive, (string)interleaved, (string)mixed }

Element Properties:

  brightness          : The color brightness value
                        Float. Range:              -1 -               1 Default:               0

  contrast            : The color contrast value
                        Float. Range:               0 -               2 Default:               1

  crop-bottom         : Pixels to crop at bottom
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  crop-left           : Pixels to crop at left
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  crop-right          : Pixels to crop at right
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  crop-top            : Pixels to crop at top
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  deinterlace-method  : Deinterlace method to use
                        Enum "GstVaapiDeinterlaceMethod" Default: 1, "bob"
                           (0): none             - Disable deinterlacing
                           (1): bob              - Bob deinterlacing
                           (2): weave            - Weave deinterlacing
                           (3): motion-adaptive  - Motion adaptive deinterlacing
                           (4): motion-compensated - Motion compensated deinterlacing

  deinterlace-mode    : Deinterlace mode to use
                        Enum "GstVaapiDeinterlaceMode" Default: 0, "auto"
                           (0): auto             - Auto detection
                           (1): interlaced       - Force deinterlacing
                           (2): disabled         - Never deinterlace

  denoise             : The level of denoising to apply
                        Float. Range:               0 -               1 Default:               0

  force-aspect-ratio  : When enabled, scaling will respect original aspect ratio
                        Boolean. Default: true

  format              : The forced output pixel format
                        Enum "GstVideoFormat" Default: 1, "encoded"
                           (0): unknown          - GST_VIDEO_FORMAT_UNKNOWN
                           (1): encoded          - GST_VIDEO_FORMAT_ENCODED
                           (2): i420             - GST_VIDEO_FORMAT_I420
                           (3): yv12             - GST_VIDEO_FORMAT_YV12
                           (4): yuy2             - GST_VIDEO_FORMAT_YUY2
                           (5): uyvy             - GST_VIDEO_FORMAT_UYVY
                           (6): ayuv             - GST_VIDEO_FORMAT_AYUV
                           (7): rgbx             - GST_VIDEO_FORMAT_RGBx
                           (8): bgrx             - GST_VIDEO_FORMAT_BGRx
                           (9): xrgb             - GST_VIDEO_FORMAT_xRGB
                           (10): xbgr             - GST_VIDEO_FORMAT_xBGR
                           (11): rgba             - GST_VIDEO_FORMAT_RGBA
                           (12): bgra             - GST_VIDEO_FORMAT_BGRA
                           (13): argb             - GST_VIDEO_FORMAT_ARGB
                           (14): abgr             - GST_VIDEO_FORMAT_ABGR
                           (15): rgb              - GST_VIDEO_FORMAT_RGB
                           (16): bgr              - GST_VIDEO_FORMAT_BGR
                           (17): y41b             - GST_VIDEO_FORMAT_Y41B
                           (18): y42b             - GST_VIDEO_FORMAT_Y42B
                           (19): yvyu             - GST_VIDEO_FORMAT_YVYU
                           (20): y444             - GST_VIDEO_FORMAT_Y444
                           (21): v210             - GST_VIDEO_FORMAT_v210
                           (22): v216             - GST_VIDEO_FORMAT_v216
                           (23): nv12             - GST_VIDEO_FORMAT_NV12
                           (24): nv21             - GST_VIDEO_FORMAT_NV21
                           (25): gray8            - GST_VIDEO_FORMAT_GRAY8
                           (26): gray16-be        - GST_VIDEO_FORMAT_GRAY16_BE
                           (27): gray16-le        - GST_VIDEO_FORMAT_GRAY16_LE
                           (28): v308             - GST_VIDEO_FORMAT_v308
                           (29): rgb16            - GST_VIDEO_FORMAT_RGB16
                           (30): bgr16            - GST_VIDEO_FORMAT_BGR16
                           (31): rgb15            - GST_VIDEO_FORMAT_RGB15
                           (32): bgr15            - GST_VIDEO_FORMAT_BGR15
                           (33): uyvp             - GST_VIDEO_FORMAT_UYVP
                           (34): a420             - GST_VIDEO_FORMAT_A420
                           (35): rgb8p            - GST_VIDEO_FORMAT_RGB8P
                           (36): yuv9             - GST_VIDEO_FORMAT_YUV9
                           (37): yvu9             - GST_VIDEO_FORMAT_YVU9
                           (38): iyu1             - GST_VIDEO_FORMAT_IYU1
                           (39): argb64           - GST_VIDEO_FORMAT_ARGB64
                           (40): ayuv64           - GST_VIDEO_FORMAT_AYUV64
                           (41): r210             - GST_VIDEO_FORMAT_r210
                           (42): i420-10be        - GST_VIDEO_FORMAT_I420_10BE
                           (43): i420-10le        - GST_VIDEO_FORMAT_I420_10LE
                           (44): i422-10be        - GST_VIDEO_FORMAT_I422_10BE
                           (45): i422-10le        - GST_VIDEO_FORMAT_I422_10LE
                           (46): y444-10be        - GST_VIDEO_FORMAT_Y444_10BE
                           (47): y444-10le        - GST_VIDEO_FORMAT_Y444_10LE
                           (48): gbr              - GST_VIDEO_FORMAT_GBR
                           (49): gbr-10be         - GST_VIDEO_FORMAT_GBR_10BE
                           (50): gbr-10le         - GST_VIDEO_FORMAT_GBR_10LE
                           (51): nv16             - GST_VIDEO_FORMAT_NV16
                           (52): nv24             - GST_VIDEO_FORMAT_NV24
                           (53): nv12-64z32       - GST_VIDEO_FORMAT_NV12_64Z32
                           (54): a420-10be        - GST_VIDEO_FORMAT_A420_10BE
                           (55): a420-10le        - GST_VIDEO_FORMAT_A420_10LE
                           (56): a422-10be        - GST_VIDEO_FORMAT_A422_10BE
                           (57): a422-10le        - GST_VIDEO_FORMAT_A422_10LE
                           (58): a444-10be        - GST_VIDEO_FORMAT_A444_10BE
                           (59): a444-10le        - GST_VIDEO_FORMAT_A444_10LE
                           (60): nv61             - GST_VIDEO_FORMAT_NV61
                           (61): p010-10be        - GST_VIDEO_FORMAT_P010_10BE
                           (62): p010-10le        - GST_VIDEO_FORMAT_P010_10LE
                           (63): iyu2             - GST_VIDEO_FORMAT_IYU2
                           (64): vyuy             - GST_VIDEO_FORMAT_VYUY
                           (65): gbra             - GST_VIDEO_FORMAT_GBRA
                           (66): gbra-10be        - GST_VIDEO_FORMAT_GBRA_10BE
                           (67): gbra-10le        - GST_VIDEO_FORMAT_GBRA_10LE
                           (68): gbr-12be         - GST_VIDEO_FORMAT_GBR_12BE
                           (69): gbr-12le         - GST_VIDEO_FORMAT_GBR_12LE
                           (70): gbra-12be        - GST_VIDEO_FORMAT_GBRA_12BE
                           (71): gbra-12le        - GST_VIDEO_FORMAT_GBRA_12LE
                           (72): i420-12be        - GST_VIDEO_FORMAT_I420_12BE
                           (73): i420-12le        - GST_VIDEO_FORMAT_I420_12LE
                           (74): i422-12be        - GST_VIDEO_FORMAT_I422_12BE
                           (75): i422-12le        - GST_VIDEO_FORMAT_I422_12LE
                           (76): y444-12be        - GST_VIDEO_FORMAT_Y444_12BE
                           (77): y444-12le        - GST_VIDEO_FORMAT_Y444_12LE
                           (78): gray10-le32      - GST_VIDEO_FORMAT_GRAY10_LE32
                           (79): nv12-10le32      - GST_VIDEO_FORMAT_NV12_10LE32
                           (80): nv16-10le32      - GST_VIDEO_FORMAT_NV16_10LE32
                           (81): nv12-10le40      - GST_VIDEO_FORMAT_NV12_10LE40
                           (82): y210             - GST_VIDEO_FORMAT_Y210
                           (83): y410             - GST_VIDEO_FORMAT_Y410
                           (84): vuya             - GST_VIDEO_FORMAT_VUYA
                           (85): bgr10a2-le       - GST_VIDEO_FORMAT_BGR10A2_LE
                           (86): rgb10a2-le       - GST_VIDEO_FORMAT_RGB10A2_LE
                           (87): y444-16be        - GST_VIDEO_FORMAT_Y444_16BE
                           (88): y444-16le        - GST_VIDEO_FORMAT_Y444_16LE
                           (89): p016-be          - GST_VIDEO_FORMAT_P016_BE
                           (90): p016-le          - GST_VIDEO_FORMAT_P016_LE
                           (91): p012-be          - GST_VIDEO_FORMAT_P012_BE
                           (92): p012-le          - GST_VIDEO_FORMAT_P012_LE
                           (93): y212-be          - GST_VIDEO_FORMAT_Y212_BE
                           (94): y212-le          - GST_VIDEO_FORMAT_Y212_LE
                           (95): y412-be          - GST_VIDEO_FORMAT_Y412_BE
                           (96): y412-le          - GST_VIDEO_FORMAT_Y412_LE
                           (97): nv12-4l4         - GST_VIDEO_FORMAT_NV12_4L4
                           (98): nv12-32l32       - GST_VIDEO_FORMAT_NV12_32L32
                           (99): rgbp             - GST_VIDEO_FORMAT_RGBP
                           (100): bgrp             - GST_VIDEO_FORMAT_BGRP
                           (101): av12             - GST_VIDEO_FORMAT_AV12
                           (102): argb64-le        - GST_VIDEO_FORMAT_ARGB64_LE
                           (103): argb64-be        - GST_VIDEO_FORMAT_ARGB64_BE
                           (104): rgba64-le        - GST_VIDEO_FORMAT_RGBA64_LE
                           (105): rgba64-be        - GST_VIDEO_FORMAT_RGBA64_BE
                           (106): bgra64-le        - GST_VIDEO_FORMAT_BGRA64_LE
                           (107): bgra64-be        - GST_VIDEO_FORMAT_BGRA64_BE
                           (108): abgr64-le        - GST_VIDEO_FORMAT_ABGR64_LE
                           (109): abgr64-be        - GST_VIDEO_FORMAT_ABGR64_BE
                           (110): nv12-16l32s      - GST_VIDEO_FORMAT_NV12_16L32S
                           (111): nv12-8l128       - GST_VIDEO_FORMAT_NV12_8L128
                           (112): nv12-10be-8l128  - GST_VIDEO_FORMAT_NV12_10BE_8L128
                           (113): nv12-10le40-4l4  - GST_VIDEO_FORMAT_NV12_10LE40_4L4
                           (114): dma-drm          - GST_VIDEO_FORMAT_DMA_DRM
                           (115): mt2110t          - GST_VIDEO_FORMAT_MT2110T
                           (116): mt2110r          - GST_VIDEO_FORMAT_MT2110R
                           (117): a422             - GST_VIDEO_FORMAT_A422
                           (118): a444             - GST_VIDEO_FORMAT_A444
                           (119): a444-12le        - GST_VIDEO_FORMAT_A444_12LE
                           (120): a444-12be        - GST_VIDEO_FORMAT_A444_12BE
                           (121): a422-12le        - GST_VIDEO_FORMAT_A422_12LE
                           (122): a422-12be        - GST_VIDEO_FORMAT_A422_12BE
                           (123): a420-12le        - GST_VIDEO_FORMAT_A420_12LE
                           (124): a420-12be        - GST_VIDEO_FORMAT_A420_12BE
                           (125): a444-16le        - GST_VIDEO_FORMAT_A444_16LE
                           (126): a444-16be        - GST_VIDEO_FORMAT_A444_16BE
                           (127): a422-16le        - GST_VIDEO_FORMAT_A422_16LE
                           (128): a422-16be        - GST_VIDEO_FORMAT_A422_16BE
                           (129): a420-16le        - GST_VIDEO_FORMAT_A420_16LE
                           (130): a420-16be        - GST_VIDEO_FORMAT_A420_16BE
                           (131): gbr-16le         - GST_VIDEO_FORMAT_GBR_16LE
                           (132): gbr-16be         - GST_VIDEO_FORMAT_GBR_16BE
                           (133): rbga             - GST_VIDEO_FORMAT_RBGA
                           (134): y216-le          - GST_VIDEO_FORMAT_Y216_LE
                           (135): y216-be          - GST_VIDEO_FORMAT_Y216_BE
                           (136): y416-le          - GST_VIDEO_FORMAT_Y416_LE
                           (137): y416-be          - GST_VIDEO_FORMAT_Y416_BE
                           (138): gray10-le16      - GST_VIDEO_FORMAT_GRAY10_LE16

  hdr-tone-map        : Apply HDR tone mapping algorithm
                        Enum "GstVaapiHDRToneMap" Default: 0, "auto"
                           (0): auto             - Auto detection
                           (1): disabled         - Disable HDR tone mapping

  height              : Forced output height
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0

  hue                 : The color hue value
                        Float. Range:            -180 -             180 Default:               0

  name                : The name of the object
                        String. Default: "vaapipostproc0"

  parent              : The parent of the object
                        Object of type "GstObject"

  qos                 : Handle Quality-of-Service events
                        Boolean. Default: false

  saturation          : The color saturation value
                        Float. Range:               0 -               2 Default:               1

  scale-method        : Scaling method to use
                        Enum "GstVaapiScaleMethod" Default: 0, "default"
                           (0): default          - Default scaling mode
                           (1): fast             - Fast scaling mode
                           (2): hq               - High quality scaling mode

  sharpen             : The level of sharpening/blurring to apply
                        Float. Range:              -1 -               1 Default:               0

  skin-tone-enhancement: Apply the skin tone enhancement algorithm
                        Boolean. Default: false

  skin-tone-enhancement-level: Apply the skin tone enhancement algorithm with specified level
                        Unsigned Integer. Range: 0 - 9 Default: 3

  video-direction     : Video direction: rotation and flipping
                        Enum "GstVideoOrientationMethod" Default: 0, "identity"
                           (0): identity         - GST_VIDEO_ORIENTATION_IDENTITY
                           (1): 90r              - GST_VIDEO_ORIENTATION_90R
                           (2): 180              - GST_VIDEO_ORIENTATION_180
                           (3): 90l              - GST_VIDEO_ORIENTATION_90L
                           (4): horiz            - GST_VIDEO_ORIENTATION_HORIZ
                           (5): vert             - GST_VIDEO_ORIENTATION_VERT
                           (6): ul-lr            - GST_VIDEO_ORIENTATION_UL_LR
                           (7): ur-ll            - GST_VIDEO_ORIENTATION_UR_LL
                           (8): auto             - GST_VIDEO_ORIENTATION_AUTO
                           (9): custom           - GST_VIDEO_ORIENTATION_CUSTOM

  width               : Forced output width
                        Unsigned Integer. Range: 0 - 2147483647 Default: 0
```
