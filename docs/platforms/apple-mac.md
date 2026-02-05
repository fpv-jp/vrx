# Apple Mac

macOS の AVFoundation フレームワーク経由でカメラを取得し、VideoToolbox ハードウェアエンコーダーで送信します。

## 利用可能なエンコーダー

| エンコーダー | コーデック | 備考 |
|------------|----------|------|
| `vtenc_h264_hw` | H.264 | VideoToolbox ハードウェア（推奨） |
| `vtenc_h265_hw` | H.265 | VideoToolbox ハードウェア |
| `vp8enc` | VP8 | ソフトウェア |
| `vp9enc` | VP9 | ソフトウェア |
| `svtav1enc` | AV1 | ソフトウェア（SVT-AV1） |

## 映像パイプライン例（vtenc_h264_hw）

```
avfvideosrc do-stats=true do-timestamp=true device-index=0
  ! video/x-raw, width=1280, height=720, format=UYVY, framerate=30/1
  ! queue max-size-buffers=1 leaky=downstream
  ! vtenc_h264_hw realtime=true
  ! h264parse
  ! rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=96
  ! application/x-rtp,media=video,encoding-name=H264,payload=96
```

## 音声パイプライン例（opusenc）

```
osxaudiosrc do-timestamp=true unique-id=BlackHole2ch_UID
  ! audio/x-raw, format=F32LE, layout=interleaved, rate=48000, channels=2
  ! audioconvert
  ! audioresample
  ! queue max-size-buffers=1 leaky=downstream
  ! opusenc perfect-timestamp=true
  ! rtpopuspay pt=97
  ! application/x-rtp,media=audio,encoding-name=OPUS,payload=97
```

## 注意事項

- macOS では `avfvideosrc` の `device-index` でカメラを指定します
- iPhone を Continuity Camera として使う場合も同様にリストに表示されます
- BlackHole などのオーディオ仮想デバイスを使うと、PC 内部の音声を送信できます
