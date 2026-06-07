# Raspberry Pi 4

Raspberry Pi 4 では V4L2 M2M（Memory-to-Memory）ハードウェアエンコーダーを使って H.264 映像を送信します。

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

## 注意事項

- Raspberry Pi OS (Bookworm) から `libcamerasrc` が標準になりました
- 旧 OS では `v4l2src device=/dev/video0` を使ってください
- `v4l2h264enc` は Raspberry Pi 固有のドライバーが必要です
- H.265 / VP8 / VP9 / AV1 のハードウェアエンコードはサポートされていません
