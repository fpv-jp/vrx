# Jetson Orin Nano Super

NVIDIA Jetson Orin Nano Super は Ampere GPU アーキテクチャを搭載し、Nano より大幅に性能が向上しています。

## 利用可能なエンコーダー

| エンコーダー | コーデック | 備考 |
|------------|----------|------|
| `nvv4l2h264enc` | H.264 | NVENC ハードウェア（推奨） |
| `nvv4l2h265enc` | H.265 | NVENC ハードウェア |

## 映像パイプライン例（nvv4l2h264enc）

```
v4l2src device=/dev/video0 do-timestamp=true
  ! video/x-raw, width=1920, height=1080, format=UYVY, framerate=60/1
  ! queue max-size-buffers=1 leaky=downstream
  ! nvvidconv
  ! nvv4l2h264enc bitrate=8000000 preset-level=1 control-rate=1
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

## Jetson Nano との違い

| 項目 | Jetson Nano 2GB | Jetson Orin Nano Super |
|------|----------------|----------------------|
| GPU | Maxwell 128コア | Ampere 1024コア |
| CPU | Cortex-A57 × 4 | Cortex-A78AE × 6 |
| TOPS | — | 67 TOPS |
| JetPack | 4.6.x | 6.x |
| 最大解像度 | 1080p30 | 4K60 |

## 注意事項

- JetPack 6.x 対応（L4T 36.x 以降）
- JetPack 6 では `nvv4l2h264enc` の代わりに `nvh264enc`（GStreamer 公式プラグイン）も使えます
- Orin は AI 推論ワークロードとの組み合わせに最適です
