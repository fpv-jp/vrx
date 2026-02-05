# Radxa ROCK 5

Radxa ROCK 5 シリーズは Rockchip RK3588 SoC を搭載し、MPP（Media Process Platform）ハードウェアエンコーダーを使います。

## 利用可能なエンコーダー

| エンコーダー | コーデック | 備考 |
|------------|----------|------|
| `mpph264enc` | H.264 | MPP ハードウェア（推奨） |
| `mpph265enc` | H.265 | MPP ハードウェア |

## 映像パイプライン例（mpph264enc）

```
v4l2src device=/dev/video0 do-timestamp=true
  ! video/x-raw, width=1280, height=720, format=UYVY, framerate=30/1
  ! queue max-size-buffers=1 leaky=downstream
  ! videoconvert
  ! mpph264enc
  ! h264parse
  ! rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=96
  ! application/x-rtp,media=video,encoding-name=H264,payload=96
```

## DMABuf パス（ゼロコピー）

RK3588 の DMABuf を活用したゼロコピーパイプラインです。

```
v4l2src device=/dev/video0 do-timestamp=true io-mode=dmabuf
  ! video/x-raw(memory:DMABuf), width=1280, height=720, framerate=30/1
  ! queue max-size-buffers=1 leaky=downstream
  ! mpph264enc
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

## 対応ボード

| ボード | SoC | RAM |
|--------|-----|-----|
| ROCK 5A | RK3588S | 4/8/16 GB |
| ROCK 5B | RK3588 | 4/8/16/32 GB |
| ROCK 5C | RK3588S2 | 2/4/8/16 GB |

## 注意事項

- `mpph264enc` を使うには `gstreamer1.0-rockchip` プラグインが必要です
- Radxa の公式 Ubuntu / Debian イメージには MPP ライブラリが含まれています
- RK3588 は 8K デコード・4K エンコードに対応した高性能な SoC です
- FPV 用途では ROCK 5B の高 RAM モデルが AI 推論との組み合わせに適しています
