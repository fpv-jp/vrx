# Linux x86

Intel CPU 搭載の Linux PC で VA-API（Video Acceleration API）ハードウェアエンコーダーを使います。

## 利用可能なエンコーダー

| エンコーダー | コーデック | 備考 |
|------------|----------|------|
| `vah264lpenc` | H.264 | VA-API ハードウェア（推奨） |
| `vah265lpenc` | H.265 | VA-API ハードウェア |
| `vp8enc` | VP8 | ソフトウェア |
| `vp9enc` | VP9 | ソフトウェア |
| `svtav1enc` | AV1 | ソフトウェア（SVT-AV1） |

## 映像パイプライン例（vah264lpenc）

```
v4l2src device=/dev/video0 do-timestamp=true
  ! video/x-raw, width=1280, height=720, format=UYVY, framerate=30/1
  ! queue max-size-buffers=1 leaky=downstream
  ! videoconvert
  ! vah264lpenc
  ! h264parse
  ! rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=96
  ! application/x-rtp,media=video,encoding-name=H264,payload=96
```

### DMABuf（GLMemory）キャプチャパス

V4L2 が DMABuf をサポートする場合、`video/x-raw(memory:DMABuf)` を使うとゼロコピー転送が可能です。

```
v4l2src device=/dev/video0 do-timestamp=true io-mode=dmabuf
  ! video/x-raw(memory:DMABuf), width=1280, height=720, framerate=30/1
  ! queue max-size-buffers=1 leaky=downstream
  ! vah264lpenc
  ! h264parse
  ! rtph264pay config-interval=-1 aggregate-mode=zero-latency pt=96
  ! application/x-rtp,media=video,encoding-name=H264,payload=96
```

## 音声パイプライン例（opusenc / PulseAudio）

```
pulsesrc device=alsa_output.pci-0000_00_1f.3.HiFi__HDMI3__sink.monitor
  ! audio/x-raw, format=S16LE, layout=interleaved, rate=48000, channels=1
  ! queue max-size-buffers=1 leaky=downstream
  ! audioconvert
  ! audioresample
  ! opusenc perfect-timestamp=true
  ! rtpopuspay pt=97
  ! application/x-rtp,media=audio,encoding-name=OPUS,payload=97
```

## 注意事項

- VA-API を使用するには `gstreamer1.0-vaapi` パッケージが必要です
- Intel GPU が必要です（AMD は `va` プラグインが対応していない場合があります）
- `/dev/video0` のデバイスパスはシステムにより異なります
