# AIU Study Abroad - 留学体験レビューアプリ

留学経験のリアルな情報をシェアするコミュニティアプリです。

## 機能

- 🏠 **ホームページ**: 最新レビューと人気の留学先を表示
- 🔍 **検索機能**: 国、語学レベル、費用でレビューを検索
- 📝 **レビュー投稿**: 詳細な留学体験を投稿
- ❓ **質問・回答コーナー**: 留学に関する質問を投稿・回答
- 📊 **比較機能**: 最大3つの留学先を比較
- 📖 **詳細ページ**: 各レビューの詳細情報を表示

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **UI**: React 19
- **アナリティクス**: Vercel Analytics

## プロジェクト構造

```
aiu-study-abroad/
├── app/
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # メインアプリコンポーネント
│   └── globals.css         # グローバルスタイル
├── components/
│   ├── navigation.tsx      # ナビゲーションコンポーネント
│   ├── review-card.tsx     # レビューカード
│   ├── country-stats-grid.tsx # 国統計グリッド
│   └── pages/
│       ├── home-page.tsx      # ホームページ
│       ├── search-page.tsx    # 検索ページ
│       ├── questions-page.tsx # 質問ページ
│       ├── comparison-page.tsx # 比較ページ
│       ├── detail-page.tsx    # 詳細ページ
│       └── review-form-page.tsx # レビュー投稿ページ
└── package.json
```

## ライセンス

MIT



