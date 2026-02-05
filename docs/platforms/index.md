# プラットフォーム対応状況

VRX の Sender 側（[fpv-jp/vtx](https://github.com/fpv-jp/vtx)）が対応している SBC プラットフォームと、各プラットフォームで使えるエンコーダーの一覧です。

## 対応プラットフォーム

| プラットフォーム | GPU / エンコーダー API | H.264 | H.265 | VP8 | VP9 | AV1 |
|----------------|----------------------|-------|-------|-----|-----|-----|
| [Apple Mac](./apple-mac) | VideoToolbox | vtenc_h264_hw | vtenc_h265_hw | vp8enc | vp9enc | svtav1enc |
| [Linux x86](./linux-x86) | VA-API (Intel) | vah264lpenc | vah265lpenc | — | — | — |
| [Raspberry Pi 4](./raspberry-pi-4) | V4L2 M2M | v4l2h264enc | — | — | — | — |
| [Raspberry Pi 5](./raspberry-pi-5) | V4L2 M2M | v4l2h264enc | — | — | — | — |
| [Jetson Nano 2GB](./jetson-nano) | NVENC | nvv4l2h264enc | nvv4l2h265enc | — | — | — |
| [Jetson Orin Nano Super](./jetson-orin) | NVENC | nvv4l2h264enc | nvv4l2h265enc | — | — | — |
| [Radxa ROCK 5](./radxa-rock5) | MPP (RK3588) | mpph264enc | mpph265enc | — | — | — |

## GStreamer パイプラインの仕組み

Sender から送られてくる `MEDIA_DEVICE_LIST_RESPONSE` JSON には、デバイス一覧・コーデック一覧・ネットワーク情報が含まれます。VRX はこれを受け取り、ブラウザ側でプラットフォームごとの GStreamer パイプライン文字列を組み立てて Sender へ送信します。

```
┌─────────────────────────────────────────────┐
│  MEDIA_DEVICE_LIST_RESPONSE                  │
│  {                                           │
│    platform: "LINUX_X86",                   │
│    devices: [...],   ← カメラ・マイク一覧    │
│    codecs: {...},    ← 利用可能なエンコーダー │
│    network: [...]    ← NIC 一覧              │
│  }                                           │
└──────────────────┬──────────────────────────┘
                   ▼
     src/menu/pipeline/<PLATFORM>.js
     buildVidePipeline(P) → GStreamer 文字列
     buildAudioPipeline(P) → GStreamer 文字列
```
