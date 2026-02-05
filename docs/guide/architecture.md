# アーキテクチャ

## システム全体図

```
┌──────────────────────────────────────────────────────┐
│                 Signaling Server                      │
│              (WebSocket / fpv-jp/app)                 │
└───────────────┬──────────────────┬───────────────────┘
                │ WS1              │ WS2
                ▼                  ▼
     ┌──────────────────┐  ┌──────────────────┐
     │   VTX / Sender   │  │   VRX / Receiver │
     │  (SBC or ?p=s)   │  │   (このアプリ)    │
     └────────┬─────────┘  └────────┬─────────┘
              │                      │
              └──────── WebRTC ───────┘
                      P2P 接続
                 ┌────────┴────────┐
            Video/Audio        DataChannel
           (RTP over DTLS)    (テレメトリ)
```

## 映像デコードフロー

```
WebRTC Track (EncodedVideoChunk)
  └─→ src/stream/handler.js          Worker 管理
        └─→ src/stream/processor.js  [Web Worker]
              ├─ SDP 解析でコーデック推定
              │    avc1 / vp09 / hvc1 / av01
              ├─ VideoDecoder.configure()
              ├─ VideoDecoder.decode()
              ├─ createImageBitmap()
              └─ Canvas (#RemoteVideo) 描画
                   │ 録画中
                   └─→ frame.clone() → PostMessage
                         └─→ src/record/index.js
                               └─→ src/record/worker.js
                                     ├─ HUD 合成 (OffscreenCanvas)
                                     ├─ VideoEncoder (H.264)
                                     ├─ mp4-muxer
                                     └─ MP4 ダウンロード
```

## テレメトリフロー

```
DataChannel (IMU / GNSS / BAT / WPA_SUPPLICANT)
  └─→ src/receiver/datachannel.js
        ├─ IMU: Float32Array[x, y, z, w] クォータニオン
        │    → 座標系補正 → Euler 角 (YXZ) → HUD 更新
        ├─ GNSS: JSON → 緯度・経度
        ├─ BAT: JSON → バッテリー残量
        └─ WPA_SUPPLICANT: JSON → WiFi 情報 → 監視パネル
```

## 接続シーケンス

```
VRX (Receiver)              Signaling Server             VTX (Sender)
     │                            │                            │
     │──── WebSocket 接続 ────────▶│                            │
     │◀─── SESSION_ID_ISSUANCE ───│                            │
     │                            │◀──── WebSocket 接続 ────────│
     │◀─── CHANGE_SENDER_ENTRIES ─│                            │
     │                            │                            │
     │  [ユーザーが Sender 選択]   │                            │
     │                            │                            │
     │──── MEDIA_DEVICE_LIST_REQUEST ─────────────────────────▶│
     │◀─── MEDIA_DEVICE_LIST_RESPONSE ────────────────────────│
     │                            │                            │
     │  [ユーザーが Start 押下]    │                            │
     │                            │                            │
     │──── SDP_OFFER ─────────────────────────────────────────▶│
     │◀─── SDP_ANSWER ────────────────────────────────────────│
     │◀─── ICE ───────────────────────────────────────────────│
     │──── ICE ───────────────────────────────────────────────▶│
     │                            │                            │
     │◀══════════ WebRTC P2P (映像 / 音声 / テレメトリ) ═══════│
```

## GStreamer パイプライン生成

VTX から受け取ったデバイスリスト JSON をもとに、ブラウザ側でプラットフォーム別の GStreamer パイプライン文字列を組み立て、`MEDIA_STREAM_START` メッセージで VTX へ送信します。

```
MEDIA_DEVICE_LIST_RESPONSE (JSON)
  └─→ src/menu/index.js  setMediaDeviceList()
        ├─ initDeviceList()   デバイス選択リスト生成
        ├─ initVideoList()    コーデック・キャプチャ選択
        └─ initAudioList()    オーディオコーデック・サンプリング選択

[ユーザーが Start 押下]
  └─→ src/menu/connection.js  buildGstreamerPayload()
        └─→ src/menu/pipeline/<PLATFORM>.js
              ├─ buildVidePipeline(P)  → video_pipeline 文字列
              └─ buildAudioPipeline(P) → audio_pipeline 文字列

→ MEDIA_STREAM_START { video_pipeline, audio_pipeline, ... }
```

## DataChannel 構成

| Label | ordered | maxPacketLifeTime | 用途 |
|-------|---------|-------------------|------|
| CMD | ✓ | — | PING/PONG, HANG_UP |
| IMU | ✗ | 50ms | Quaternion（Float32Array） |
| GNSS | ✓ | — | GPS 座標（JSON） |
| BAT | ✓ | — | バッテリー情報（JSON） |
| MSP_ATTITUDE | — | — | Roll / Pitch / Yaw |
| MSP_RAW_GPS | — | — | GPS（MSP プロトコル） |
| WPA_SUPPLICANT | — | — | WiFi 情報（JSON） |

## シグナリングメッセージ型番号

| 番号 | 名前 | 送信元 |
|------|------|--------|
| 100 | SESSION_ID_ISSUANCE | Sender → Server |
| 101 | MEDIA_DEVICE_LIST_REQUEST | Receiver → Sender |
| 102 | MEDIA_STREAM_START | Receiver → Sender |
| 103 | SDP_ANSWER | Sender → Receiver |
| 104 | ICE | Sender → Receiver |
| 200 | SESSION_ID_ISSUANCE | Receiver → Server |
| 201 | CHANGE_SENDER_ENTRIES | Server → Receiver |
| 202 | MEDIA_DEVICE_LIST_RESPONSE | Sender → Receiver |
| 203 | SDP_OFFER | Receiver → Sender |
| 204 | ICE | Receiver → Sender |
