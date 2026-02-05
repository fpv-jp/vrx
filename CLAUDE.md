# VRX - Video Receiver

WebRTCを使用してリモートドローン（VTX）からビデオ・オーディオ・テレメトリを受信・可視化するWebアプリ。
対応するSender側は [fpv-jp/vtx](https://github.com/fpv-jp/vtx)、シグナリングサーバーは [fpv-jp/app](https://github.com/fpv-jp/app)。

## 開発コマンド

```bash
npm run dev              # Vite開発サーバー起動
npm run build            # public + private 両方ビルド
npm run fmt              # Prettier フォーマット
npm test                 # Vitest（1回実行）
npm run test:watch       # Vitest（ウォッチモード）
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
| [src/main.js](src/main.js) | エントリーポイント。Alpine.js store 初期化、URLパラメータ `?p=r/s` でSender/Receiver判定、シグナリング初期化 |
| [src/constants.js](src/constants.js) | メッセージ型番号(SENDER/RECEIVER)、DataChannelラベル、ICE設定 |
| [src/utils.js](src/utils.js) | ヘルパー関数（シグナリング送信、codec解析、デバイス列挙、H264プロファイル判定） |

### Receiver ([src/receiver/](src/receiver/))

| ファイル | 役割 |
|---------|------|
| [index.js](src/receiver/index.js) | `ReceiverState`（`ws`/`pc`/HUD等）、`RTCPeerConnection` 管理、track/datachannel イベント |
| [signaling.js](src/receiver/signaling.js) | Receiver側シグナリングメッセージハンドラ（SDP/ICE受信・応答） |
| [datachannel.js](src/receiver/datachannel.js) | DataChannel受信・テレメトリパース、HeadUpDisplay更新 |

### Sender ([src/sender/](src/sender/))

| ファイル | 役割 |
|---------|------|
| [index.js](src/sender/index.js) | `SenderState`（`ws`/`pc`/センサー等）、`RTCPeerConnection` 管理 |
| [signaling.js](src/sender/signaling.js) | Sender側シグナリングメッセージハンドラ |
| [datachannel.js](src/sender/datachannel.js) | DataChannel作成・管理（`cmd`/`imu`/`gnss`/`bat`） |

### ストリーム ([src/stream/](src/stream/))

| ファイル | 役割 |
|---------|------|
| [handler.js](src/stream/handler.js) | encode/decode Worker管理、`PostMessageType` 定義 |
| [processor.js](src/stream/processor.js) | Worker内実処理：VideoEncoder/Decoder、SDP解析でcodec推定、Canvas描画、録画フレーム転送 |

### 録画 ([src/record/](src/record/))

| ファイル | 役割 |
|---------|------|
| [index.js](src/record/index.js) | 録画コーディネーター。`stream/processor.js` からの `RecordFrame` を受け取りHUDと合成してWorkerへ転送 |
| [worker.js](src/record/worker.js) | `mp4-muxer` + `VideoEncoder` でH.264 MP4生成、完了時にダウンロード |

### メニュー ([src/menu/](src/menu/))

Alpine.js リアクティブストア（`Alpine.store('menu')`）を唯一の状態源として使うUIパネル。

| ファイル | 役割 |
|---------|------|
| [index.js](src/menu/index.js) | `setMediaDeviceList(message)` — MEDIA_DEVICE_LIST_RESPONSE を受けてストア初期化、各initXxxList() を呼ぶ |
| [video.js](src/menu/video.js) | ビデオデバイス・コーデック・キャプチャのリスト管理、サブメニュー表示制御 |
| [audio.js](src/menu/audio.js) | オーディオデバイス・コーデック・サンプリングのリスト管理 |
| [connection.js](src/menu/connection.js) | 接続ボタンハンドラ：browser/gstreamer ペイロード生成、`MEDIA_STREAM_START` 送信 |
| [device.js](src/menu/device.js) | `initDeviceList()` — デバイスリストをストアへセット |
| [network.js](src/menu/network.js) | `initNetworkList()` — ネットワークインターフェース選択リスト |
| [bord.js](src/menu/bord.js) | `initBordList()` — フライトコントローラー選択リスト |
| [sender.js](src/menu/sender.js) | Senderエントリーリスト管理 |
| [sub-control.js](src/menu/sub-control.js) | 接続後サブコントロール（録画開始/停止イベントハンドラ） |
| [pipeline/](src/menu/pipeline/) | プラットフォーム別GStreamerパイプライン定義（APPLE_MAC/LINUX_X86/Jetson/RPi/Radxa） |
| [utils/codec-utils.js](src/menu/utils/codec-utils.js) | `browserCodecList()`、`sortByOrder()` |
| [utils/list-utils.js](src/menu/utils/list-utils.js) | `setListOptions()` — ストアのリスト値・オプション一括セット |
| [utils/parameter-utils.js](src/menu/utils/parameter-utils.js) | GStreamer caps 文字列パース・ストア反映ユーティリティ |

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
  → src/stream/processor.js Worker
    → SDP解析でcodec文字列推定（avc1.xxxxx / vp09 / hvc1 / av01）
    → VideoDecoder.configure()
    → VideoDecoder.decode()
    → createImageBitmap()
    → Canvas 描画 (#RemoteVideo)
    → 録画中: frame.clone() → PostMessageType.RecordFrame → src/record/index.js
```

## 録画フロー

```
src/record/index.js
  ← PostMessageType.RecordFrame (VideoFrame clone from stream/processor.js)
  → createImageBitmap(#HeadUpDisplay) で HUD スナップショット取得
  → record/worker.js へ { videoFrame, hudBitmap } を転送

record/worker.js
  → OffscreenCanvas で video + HUD を合成
  → VideoEncoder (H.264 avc1.640028, 10Mbps)
  → mp4-muxer (ArrayBufferTarget)
  → 停止時: encoder.flush() → muxer.finalize() → Blob ダウンロード
```

## テレメトリ処理（IMU Quaternion → Euler角）

```javascript
// receiver/datachannel.js
Float32Array[x, y, z, w]  // センサーから受信
  → 座標系補正: x = -x; [y, z] = [z, y]
  → Euler角変換 (YXZ順: Yaw/Pitch/Roll)
  → degrees変換 + heading = (yaw + 360) % 360
  → ReceiverState.headUpDisplay.update(telemetryData)
```

## グローバル状態

- `ReceiverState` — `pc`（RTCPeerConnection）、`ws`（WebSocket）、`cmd`/`headUpDisplay` 等
- `SenderState` — `pc`、`ws`、`cmd`/`imu`/`gnss`/`bat` 等
- `MonitorState` — ping、WiFi情報、トラフィックチャート
- `Alpine.store('menu')` — メニューUIの全状態（デバイス選択・コーデック・接続状態・録画中フラグ等）

## 接続フロー（Receiver側）

1. `main.js`: `p=r` 検出 → `initReceiverSignaling()` → WebSocket接続
2. `SESSION_ID_ISSUANCE` 受信 → Receiver ID割り当て
3. `CHANGE_SENDER_ENTRIES` 受信 → Senderリスト表示
4. ユーザーがSenderを選択 → `MEDIA_DEVICE_LIST_REQUEST` 送信
5. `MEDIA_DEVICE_LIST_RESPONSE` 受信 → `setMediaDeviceList(message)` → メニューにデバイス・codec情報表示
6. ユーザーが接続ボタン → `buildBrowserPayload()` or `buildGstreamerPayload()` → `SDP_OFFER` 送信
7. `SDP_ANSWER` + `ICE` 受信 → P2P接続確立
8. `track` イベント → 映像/音声デコード開始
9. `datachannel` イベント → テレメトリ受信開始

## テスト

```
test/menu/
  APPLE_MAC.json        # macOS VTX からのデバイスリスト fixture
  LINUX_X86.json        # Linux x86 VTX からのデバイスリスト fixture
  APPLE_MAC.test.js     # APPLE_MAC パイプラインビルダーのユニットテスト（9件）
  LINUX_X86.test.js     # LINUX_X86 パイプラインビルダーのユニットテスト（9件）
```

テスト対象: `sortByOrder` によるデフォルトコーデック選択順・各コーデックのGStreamerパイプライン文字列。
Alpine/DOMモック不要 — パイプラインビルダーは `P`（ストアスナップショット）を受け取るほぼ純粋関数。
SBCプラットフォーム（RASPBERRY_PI/JETSON/RADXA）の fixture は追加予定。
