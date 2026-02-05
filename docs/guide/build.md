# ビルド

## ビルドモード

VRX には 2 つのビルドモードがあります。

| モード | コマンド | 出力先 | ホスト | 用途 |
|--------|---------|--------|--------|------|
| **public** | `npm run build:public` | `vrx/public/` | クラウドサーバー | スマホ・タブレット・PC から使う |
| **private** | `npm run build:private` | `vrx/private/` | SBC 上（ローカル） | fpv-jp/vtx と同じ SBC 上でホスト |

```bash
# 両方まとめてビルド
npm run build

# 個別にビルド
npm run build:public
npm run build:private
```

## 環境変数

各モードに対応した `.env` ファイルでシグナリングエンドポイントを設定します。

**.env.public**
```ini
VITE_SIGNALING_ENDPOINT=wss://your-cloud-server/signaling
```

**.env.private**
```ini
VITE_SIGNALING_ENDPOINT=wss://192.168.1.x:8080/signaling
```

## GitHub Pages へのデプロイ

`.github/workflows/deploy.yml` を作成すると、`main` ブランチへの push 時に自動デプロイできます。

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run docs:build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/.vitepress/dist
```

## ドキュメントのビルド

```bash
# 開発サーバー（ホットリロードあり）
npm run docs:dev

# 本番ビルド
npm run docs:build

# ビルド結果をプレビュー
npm run docs:preview
```
