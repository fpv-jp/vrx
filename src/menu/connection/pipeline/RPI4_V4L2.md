# v4l2h264enc
```
Pad Templates:
  SINK template: 'sink'
    Availability: Always
    Capabilities:
      video/x-raw(memory:DMABuf)
                 format: DMA_DRM
             drm-format: { (string)YU12, (string)YV12, (string)NV12, (string)NV21, (string)RG16, (string)BG24, (string)RG24, (string)AB24, (string)XR24, (string)YUYV, (string)YVYU, (string)UYVY, (string)VYUY }
                  width: [ 1, 32768 ]
                 height: [ 1, 32768 ]
              framerate: [ 0/1, 2147483647/1 ]
      video/x-raw(memory:DMABuf, format:Interlaced)
                 format: DMA_DRM
             drm-format: { (string)YU12, (string)YV12, (string)NV12, (string)NV21, (string)RG16, (string)BG24, (string)RG24, (string)AB24, (string)XR24, (string)YUYV, (string)YVYU, (string)UYVY, (string)VYUY }
                  width: [ 1, 32768 ]
                 height: [ 1, 32768 ]
              framerate: [ 0/1, 2147483647/1 ]
         interlace-mode: alternate
      video/x-raw
                 format: { (string)I420, (string)YV12, (string)NV12, (string)NV21, (string)RGB16, (string)RGB, (string)BGR, (string)RGBA, (string)BGRx, (string)BGRA, (string)YUY2, (string)YVYU, (string)UYVY }
                  width: [ 1, 32768 ]
                 height: [ 1, 32768 ]
              framerate: [ 0/1, 2147483647/1 ]
      video/x-raw(format:Interlaced)
                 format: { (string)I420, (string)YV12, (string)NV12, (string)NV21, (string)RGB16, (string)RGB, (string)BGR, (string)RGBA, (string)BGRx, (string)BGRA, (string)YUY2, (string)YVYU, (string)UYVY }
                  width: [ 1, 32768 ]
                 height: [ 1, 32768 ]
              framerate: [ 0/1, 2147483647/1 ]
         interlace-mode: alternate

  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-h264
          stream-format: byte-stream
              alignment: au
                  level: { (string)1, (string)1b, (string)1.1, (string)1.2, (string)1.3, (string)2, (string)2.1, (string)2.2, (string)3, (string)3.1, (string)3.2, (string)4, (string)4.1, (string)4.2, (string)5, (string)5.1 }
                profile: { (string)baseline, (string)constrained-baseline, (string)main, (string)high }

Element Properties:

  capture-io-mode     : Capture I/O mode (matches src pad)
                        flags: readable, writable
                        Enum "GstV4l2IOMode" Default: 0, "auto"
                           (0): auto             - GST_V4L2_IO_AUTO
                           (1): rw               - GST_V4L2_IO_RW
                           (2): mmap             - GST_V4L2_IO_MMAP
                           (3): userptr          - GST_V4L2_IO_USERPTR
                           (4): dmabuf           - GST_V4L2_IO_DMABUF
                           (5): dmabuf-import    - GST_V4L2_IO_DMABUF_IMPORT

  device              : Device location
                        flags: readable
                        String. Default: "/dev/video11"

  device-fd           : File descriptor of the device
                        flags: readable
                        Integer. Range: -1 - 2147483647 Default: -1

  device-name         : Name of the device
                        flags: readable
                        String. Default: null

  extra-controls      : Extra v4l2 controls (CIDs) for the device
                        flags: readable, writable
                        Boxed pointer of type "GstStructure"

  min-force-key-unit-interval: Minimum interval between force-keyunit requests in nanoseconds
                        flags: readable, writable
                        Unsigned Integer64. Range: 0 - 18446744073709551615 Default: 0

  name                : The name of the object
                        flags: readable, writable
                        String. Default: "v4l2h264enc0"

  output-io-mode      : Output side I/O mode (matches sink pad)
                        flags: readable, writable
                        Enum "GstV4l2IOMode" Default: 0, "auto"
                           (0): auto             - GST_V4L2_IO_AUTO
                           (1): rw               - GST_V4L2_IO_RW
                           (2): mmap             - GST_V4L2_IO_MMAP
                           (3): userptr          - GST_V4L2_IO_USERPTR
                           (4): dmabuf           - GST_V4L2_IO_DMABUF
                           (5): dmabuf-import    - GST_V4L2_IO_DMABUF_IMPORT

  parent              : The parent of the object
                        flags: readable, writable
                        Object of type "GstObject"

  qos                 : Handle Quality-of-Service events from downstream
                        flags: readable, writable
                        Boolean. Default: false
```