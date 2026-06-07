# Raspberry Pi 5

Raspberry Pi 5 では VideoCore VII GPU を搭載し、V4L2 M2M エンコーダーが改善されています。基本的なパイプラインは Raspberry Pi 4 と同様です。

## 利用可能なエンコーダー

| エンコーダー | コーデック | 備考 |
|------------|----------|------|
| `v4l2h264enc` | H.264 | V4L2 M2M ハードウェア |

## 映像パイプライン例（v4l2h264enc）

```
libcamerasrc
  ! video/x-raw, width=1280, height=720, format=UYVY, framerate=30/1
  ! queue max-size-buffers=1 leaky=downstream
  ! v4l2h264enc extra-controls="controls, h264_profile=4, h264_level=13"
  ! h264parse
  ! rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=96
  ! application/x-rtp,media=video,encoding-name=H264,payload=96
```

## 音声パイプライン例（opusenc）

```
pulsesrc device=...
  ! audio/x-raw, format=S16LE, layout=interleaved, rate=48000, channels=1
  ! queue max-size-buffers=1 leaky=downstream
  ! audioconvert
  ! audioresample
  ! opusenc perfect-timestamp=true
  ! rtpopuspay pt=97
  ! application/x-rtp,media=audio,encoding-name=OPUS,payload=97
```

## Raspberry Pi 4 との違い

| 項目 | RPi 4 | RPi 5 |
|------|-------|-------|
| CPU | Cortex-A72 | Cortex-A76 |
| GPU | VideoCore VI | VideoCore VII |
| エンコーダー | V4L2 M2M | V4L2 M2M（改善） |
| USB | USB 3.0 × 2 | USB 3.0 × 2 |

## 注意事項

- Raspberry Pi 5 は Raspberry Pi OS (Bookworm) 以降を推奨します
- `libcamerasrc` で IMX708 などの公式カメラモジュールを使用できます
- USB 接続のカメラを使う場合は `v4l2src device=/dev/video0` を指定してください
