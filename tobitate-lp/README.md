# 桐越至恩 | トビタテ！留学JAPAN 第17期 自己紹介LP

オーストラリアにおける「サードプレイス・モザイク」の社会学的考察と日本地方への応用可能性をテーマにした自己紹介ランディングページです。

## 技術スタック

- **Next.js 16** - Reactフレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS v4** - スタイリング
- **Noto Serif JP** - 日本語フォント
- **Vercel Analytics** - アナリティクス

## セットアップ

1. 依存関係のインストール
   ```bash
   npm install
   ```

2. 開発サーバーの起動
   ```bash
   npm run dev
   ```

3. ブラウザで `http://localhost:3000` を開く

## ビルド

本番環境用のビルド:

```bash
npm run build
npm start
```

## プロジェクト構造

```
tobitate-lp/
├── app/
│   ├── globals.css      # グローバルスタイルとTailwind設定
│   ├── layout.tsx       # ルートレイアウト
│   └── page.tsx         # メインページ
├── components/
│   └── ui/
│       └── badge.tsx    # Badgeコンポーネント
├── lib/
│   └── utils.ts         # ユーティリティ関数
├── package.json
├── tsconfig.json
└── next.config.ts
```

## デプロイ

Vercelへのデプロイが推奨されます:

1. GitHubにリポジトリをプッシュ
2. [Vercel](https://vercel.com)でプロジェクトをインポート
3. 自動デプロイが開始されます

## カスタマイズ

### 色の変更

`app/globals.css`の`:root`セクションでカラーパレットを変更できます。

### コンテンツの変更

`app/page.tsx`で各セクションのコンテンツを編集できます。

## ライセンス

このプロジェクトは、トビタテ！留学JAPAN 第17期の応募のために作成されています。
