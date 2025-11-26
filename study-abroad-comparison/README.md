# 留学先比較アプリ

v0で作成したUIコンポーネントを使用した、留学先のレビューを比較するWebアプリケーションです。

## 機能

- 📊 **比較機能**: 最大3つの留学先を選択して、満足度、費用、語学レベルなどを比較
- 📝 **詳細レビュー**: 各留学先の詳細なレビューを確認
- 📈 **費用比較チャート**: 選択した留学先の費用を視覚的に比較
- 🔗 **ナビゲーション**: ページ間をスムーズに移動

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **フォント**: Noto Serif JP

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定（オプション）

Googleログイン機能を使用する場合は、`.env.local`ファイルを作成してSupabaseの認証情報を設定してください。

プロジェクトルートに`.env.local`ファイルを作成し、以下の内容を追加してください：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**注意**: 環境変数が設定されていない場合でも、アプリは動作しますが、Googleログイン機能は無効になります。

Supabaseのセットアップ方法については、`GOOGLE_LOGIN_SETUP.md`を参照してください。

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

## ページ構成

- **ホームページ** (`/`): アプリの概要とナビゲーション
- **比較ページ** (`/comparison`): 留学先を選択して比較
- **詳細ページ** (`/detail/[id]`): 各留学先の詳細レビュー

## プロジェクト構造

```
study-abroad-comparison/
├── app/
│   ├── comparison/
│   │   └── page.tsx          # 比較ページ
│   ├── detail/
│   │   └── [id]/
│   │       └── page.tsx      # 詳細ページ（動的ルート）
│   ├── layout.tsx            # ルートレイアウト
│   ├── page.tsx              # ホームページ
│   └── globals.css           # グローバルスタイル
├── components/
│   ├── comparison-page.tsx    # 比較ページコンポーネント
│   └── detail-page.tsx       # 詳細ページコンポーネント
└── components.json           # shadcn/ui設定
```

## 使用方法

1. ホームページから「留学先を比較する」をクリック
2. 比較したい留学先を最大3つまで選択（チェックボックス）
3. 比較テーブルと費用比較チャートが表示されます
4. 各留学先の「詳細」ボタンをクリックして詳細レビューを確認

## ビルド

```bash
npm run build
```

## ライセンス

MIT
