# はじめに

## 関連リポジトリ

VRX は 3 つのリポジトリで構成されるシステムの一部です。

| リポジトリ | 役割 |
|-----------|------|
| [fpv-jp/app](https://github.com/fpv-jp/app) | シグナリングサーバー（WebSocket） |
| [fpv-jp/vtx](https://github.com/fpv-jp/vtx) | Sender 側（SBC: Jetson / RPi / Radxa） |
| **fpv-jp/vrx** | **Receiver 側（このリポジトリ）** |

## 動作要件

- **Node.js** 18 以上
- **ブラウザ** Chrome / Edge 推奨（WebCodecs API が必要）
- シグナリングサーバー（[fpv-jp/app](https://github.com/fpv-jp/app)）が起動済みであること

## セットアップ

```bash
git clone https://github.com/fpv-jp/vrx.git
cd vrx
npm install
```

## 開発サーバー起動

```bash
npm run dev
```

ブラウザで `https://fpv:4443/` にアクセスします（HTTPS 必須）。

| URL | 用途 |
|-----|------|
| `https://fpv:4443/` | Receiver モード（デフォルト） |
| `https://fpv:4443/?p=s` | Sender モード（スマホ・PC カメラを使う場合） |

## Sender の 2 種類

```
┌─────────────────────────────────────────────┐
│ Sender の選択                                │
│                                             │
│  スマホ・タブレット → VRX の ?p=s モード     │
│  SBC（Jetson / RPi）→ fpv-jp/vtx           │
└─────────────────────────────────────────────┘
```

## 使い方

1. ブラウザで VRX（Receiver）にアクセス
2. **Sender ID** ドロップダウンから接続先を選択
3. **🎦 Start** ボタンを押す
4. 映像・テレメトリの受信が始まる

接続後は **Sub Control** パネルから以下の操作が可能です。

| 操作 | 説明 |
|------|------|
| Grayscale | 映像をグレースケールに切り替え |
| Mute | 音声をミュート |
| Fullscreen | フルスクリーン表示 |
| ⏺ Record | HUD 合成 MP4 録画開始 |
| ⏹ Stop Recording | 録画停止・ダウンロード |

## 環境変数

`.env.public` / `.env.private` でシグナリングサーバーのエンドポイントを設定します。

```ini
VITE_SIGNALING_ENDPOINT=wss://your-server/signaling
```

詳細は [ビルド](./build) を参照してください。
