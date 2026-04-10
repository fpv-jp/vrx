# VRX - Video Receiver

WebRTCを使用してリモートドローン（VTX）からビデオ・オーディオ・テレメトリを受信・可視化するWebアプリ。
対応するSender側は [fpv-jp/vtx](https://github.com/fpv-jp/vtx)、シグナリングサーバーは [fpv-jp/app](https://github.com/fpv-jp/app)。

## 開発コマンド

```bash
npm run dev              # Vite開発サーバー起動
npm run build            # public + private 両方ビルド
npm run fmt              # Prettier フォーマット
```

ブラウザアクセス:
- `https://fpv:4443/` または `https://fpv:4443/?p=r` — Receiver（デフォルト）
- `https://fpv:4443/?p=s` — Sender（VRXをSender側として使う場合）

### ビルドモード

| モード | コマンド | 出力先 | ホスト先 | ターゲット |
|--------|---------|--------|---------|-----------|
| **public** | `npm run build:public` | `vrx/public` | クラウド | スマホ・タブレットPC |
| **private** | `npm run build:private` | `vrx/private` | SBC内（ローカル） | [fpv-jp/vtx](https://github.com/fpv-jp/vtx) と組み合わせて使用 |

環境変数は `.env.public` / `.env.private` で `VITE_SIGNALING_ENDPOINT` を設定。

## Senderの2種類

| 方法 | 対象 | リポジトリ |
|------|------|-----------|
| VRXをSenderモードで使う（`?p=s`） | スマホ・タブレットPC | このリポジトリ |
| VTXをSenderとして使う | SBC（Jetson/RPi等） | [fpv-jp/vtx](https://github.com/fpv-jp/vtx) |

## アーキテクチャ概要

```
Signaling Server (WebSocket)
        │
   ┌────┴────┐
  WS1       WS2
   │         │
VTX(Sender)  VRX(Receiver)
        └──P2P──┘
          WebRTC
      ┌─────┴─────┐
   Video/Audio  DataChannel
                (テレメトリ)
```

## ファイル構成と役割

### コア

| ファイル | 役割 |
|---------|------|
| [src/main.js](src/main.js) | エントリーポイント。URLパラメータ `?p=r/s` でSender/Receiver判定、シグナリング初期化 |
| [src/constants.js](src/constants.js) | メッセージ型番号(SENDER/RECEIVER)、DataChannelラベル、ICE設定 |
| [src/receiver.js](src/receiver.js) | Receiver側 `RTCPeerConnection` 管理、track/datachannel イベント |
| [src/sender.js](src/sender.js) | Sender側 `RTCPeerConnection` 管理 |
| [src/receiver-websocket.js](src/receiver-websocket.js) | Receiver側シグナリングメッセージハンドラ（SDP/ICE受信・応答） |
| [src/sender-websocket.js](src/sender-websocket.js) | Sender側シグナリングメッセージハンドラ |
| [src/receiver-datachannel.js](src/receiver-datachannel.js) | DataChannel受信・テレメトリパース、HeadUpDisplay更新 |
| [src/sender-datachannel.js](src/sender-datachannel.js) | DataChannel作成・管理（テレメトリ送信） |
| [src/stream-handler.js](src/stream-handler.js) | encode/decode Worker管理 |
| [src/stream-processor.js](src/stream-processor.js) | Worker内実処理：VideoEncoder/Decoder、SDP解析でcodec推定、Canvas描画 |
| [src/utils.js](src/utils.js) | ヘルパー関数（シグナリング、codec解析、デバイス列挙） |

### メニュー ([src/menu/](src/menu/))

Tweakpane を使ったパラメータUIパネル。

| ファイル | 役割 |
|---------|------|
| [index.js](src/menu/index.js) | メニュー全体の管理・Sender選択→デバイスリスト更新 |
| [component.js](src/menu/component.js) | `MenuParams` 定義（sender/codec/解像度/FPS等） |
| [pipeline/](src/menu/pipeline/) | プラットフォーム別GStreamerパイプライン定義（Jetson/RPi/Mac等） |

### ウィジェット ([src/widgets/](src/widgets/))

| ファイル | 役割 |
|---------|------|
| [index.js](src/widgets/index.js) | UI初期化・イベントハンドラ |
| [monitoring.js](src/widgets/monitoring.js) | ネットワーク監視（RTCStats、ping、WiFi情報）、1秒ごと更新 |
| [telemetry-overlay.js](src/widgets/telemetry-overlay.js) | Head-Up Display（HUD）管理 |
| [search-radar.js](src/widgets/search-radar.js) | 方位レーダー表示 |
| [audio-visualizer.js](src/widgets/audio-visualizer.js) | オーディオビジュアライザー |

## シグナリングメッセージ型番号（constants.js）

```
SENDER (100番台): Senderが送信
  100: SESSION_ID_ISSUANCE     — セッションID割り当て
  101: MEDIA_DEVICE_LIST_REQUEST
  102: MEDIA_STREAM_START
  103: SDP_ANSWER
  104: ICE
  108: RECEIVER_CLOSE
  110: PLATFORM_INFO

RECEIVER (200番台): Receiverが送信
  200: SESSION_ID_ISSUANCE
  201: CHANGE_SENDER_ENTRIES   — 利用可能なSenderリスト更新
  202: MEDIA_DEVICE_LIST_RESPONSE
  203: SDP_OFFER
  204: ICE
  208: SENDER_CLOSE
```

## DataChannel構成（テレメトリ）

| Label | ordered | reliable | maxPacketLifeTime | 用途 |
|-------|---------|----------|-------------------|------|
| CMD | ✓ | ✓ | — | PING/PONG, HANG_UP |
| IMU | ✗ | ✗ | 50ms | Quaternion（Float32Array） |
| GNSS | ✓ | ✓ | — | GPS座標（JSON） |
| BAT | ✓ | ✓ | — | バッテリー情報（JSON） |
| MSP_RAW_IMU | — | — | — | 加速度・ジャイロ・磁力計 |
| MSP_RAW_GPS | — | — | — | GPS（MSP） |
| MSP_ATTITUDE | — | — | — | Roll/Pitch/Yaw（MSP） |
| WPA_SUPPLICANT | — | — | — | WiFi情報（JSON） |

## 映像デコードフロー

```
WebRTC track (EncodedVideoChunk)
  → stream-processor.js Worker
    → SDP解析でcodec文字列推定（avc1.xxxxx / vp09 / hvc1 / av01）
    → VideoDecoder.configure()
    → VideoDecoder.decode()
    → createImageBitmap()
    → Canvas 描画 (#RemoteVideo)
```

## テレメトリ処理（IMU Quaternion → Euler角）

```javascript
// receiver-datachannel.js
Float32Array[x, y, z, w]  // センサーから受信
  → 座標系補正: x = -x; [y, z] = [z, y]
  → Euler角変換 (YXZ順: Yaw/Pitch/Roll)
  → degrees変換 + heading = (yaw + 360) % 360
  → ReceiverState.headUpDisplay.update(telemetryData)
```

## グローバル状態

- `ReceiverState` — pc2（RTCPeerConnection）、ws2（WebSocket）、headUpDisplay等
- `SenderState` — pc1、ws1、センサー等
- `MonitorState` — ping、WiFi情報、トラフィックチャート

## 接続フロー（Receiver側）

1. `main.js`: `p=r` 検出 → `initReceiverSignaling()` → WebSocket接続
2. `SESSION_ID_ISSUANCE` 受信 → Receiver ID割り当て
3. `CHANGE_SENDER_ENTRIES` 受信 → Senderリスト表示
4. ユーザーがSenderを選択 → `MEDIA_DEVICE_LIST_REQUEST` 送信
5. `MEDIA_DEVICE_LIST_RESPONSE` 受信 → メニューにデバイス・codec情報表示
6. ユーザーが接続ボタン → `SDP_OFFER` 送信
7. `SDP_ANSWER` + `ICE` 受信 → P2P接続確立
8. `track` イベント → 映像/音声デコード開始
9. `datachannel` イベント → テレメトリ受信開始
