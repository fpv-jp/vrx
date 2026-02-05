# Jetson Nano 2GB

NVIDIA Jetson Nano 2GB では NVENC（NVIDIA Video Encoder）ハードウェアエンコーダーを使います。

## 利用可能なエンコーダー

| エンコーダー | コーデック | 備考 |
|------------|----------|------|
| `nvv4l2h264enc` | H.264 | NVENC ハードウェア（推奨） |
| `nvv4l2h265enc` | H.265 | NVENC ハードウェア |

## 映像パイプライン例（nvv4l2h264enc）

```
v4l2src device=/dev/video0 do-timestamp=true
  ! video/x-raw, width=1280, height=720, format=UYVY, framerate=30/1
  ! queue max-size-buffers=1 leaky=downstream
  ! nvvidconv
  ! nvv4l2h264enc bitrate=4000000 preset-level=1 control-rate=1
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

- NVIDIA の GStreamer プラグイン（`gst-plugins-nvargus` / `gst-plugins-nveglgles`）が必要です
- JetPack 4.x では `nvv4l2h264enc` が標準で使えます
- `nvvidconv` は NVMM メモリ経由でゼロコピー変換を行います
- Jetson Nano 2GB は JetPack 4.6.x が最終サポートバージョンです
