# Translation Chat - リアルタイム自動翻訳メッセージアプリ

異なる母語同士でも「翻訳を意識せず」会話できる、リアルタイム自動翻訳付きメッセージアプリです。

## 主な機能

- 🌐 **リアルタイム自動翻訳**: 送信されたメッセージを自動的に受信者の表示言語に翻訳
- 💬 **1対1・グループチャット**: 個人間の会話からグループチャットまで対応
- 🔄 **原文・翻訳文の切替**: ワンタップで原文と翻訳文を切り替え可能
- 🔍 **自動言語判定**: 送信テキストの言語を自動判定
- ✅ **既読表示**: メッセージの既読状態を管理
- 🔒 **安全機能**: ブロック、通報機能を実装
- 🔍 **メッセージ検索**: 原文と翻訳文の両方を検索可能
- ↩️ **返信機能**: メッセージに返信可能
- 🗑️ **メッセージ削除**: 送信後5分以内のメッセージを削除可能
- 🛡️ **スパム検知**: NGワード検知とスパムパターン検知
- ⚙️ **設定ページ**: 言語設定やプロフィールの管理

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **リアルタイム**: Supabase Realtime
- **翻訳API**: Google Cloud Translation API / DeepL API

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 翻訳API設定（いずれか一方を設定）
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
# または
DEEPL_API_KEY=your_deepl_api_key
DEEPL_API_FREE=true  # DeepL無料プランの場合

# アプリ設定
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabaseのセットアップ

1. [Supabase](https://supabase.com/)でプロジェクトを作成
2. プロジェクトのURLとAnon Keyを取得
3. SQL Editorで `supabase-schema.sql` を実行してテーブルを作成

```bash
# Supabase Dashboard > SQL Editor で実行
# または Supabase CLI を使用
supabase db reset
```

### 4. 翻訳APIの設定

#### Google Cloud Translation API

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. Cloud Translation APIを有効化
3. APIキーを作成
4. `.env.local` に設定

#### DeepL API（オプション）

1. [DeepL](https://www.deepl.com/pro-api)でアカウント作成
2. APIキーを取得
3. `.env.local` に設定

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

## プロジェクト構造

```
translation-chat/
├── app/
│   ├── api/              # APIルート
│   │   ├── conversations/
│   │   ├── messages/
│   │   └── translate/
│   ├── auth/             # 認証ページ
│   ├── chat/             # チャットページ
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # ホームページ
├── components/
│   └── chat/              # チャットコンポーネント
├── lib/
│   ├── supabase/         # Supabaseクライアント
│   ├── translation.ts     # 翻訳機能
│   └── utils.ts           # ユーティリティ
├── types/
│   └── index.ts           # TypeScript型定義
├── supabase-schema.sql    # データベーススキーマ
└── package.json
```

## 主要機能の説明

### メッセージ送信フロー

1. ユーザーがメッセージを入力・送信
2. システムが自動的に言語を判定（またはユーザー指定）
3. メッセージをデータベースに保存
4. 受信者の表示言語に応じて翻訳を生成（オンデマンド）
5. 翻訳結果をキャッシュして再利用

### 翻訳表示ロジック

- **デフォルト**: 受信者の表示言語に翻訳されたテキストを表示
- **原文表示**: 「原文を見る」ボタンで原文を表示可能
- **言語ラベル**: メッセージの元の言語を小さく表示
- **キャッシュ**: 同じメッセージ×言語の組み合わせは再利用

### リアルタイム更新

Supabase Realtimeを使用して、新しいメッセージをリアルタイムで受信・表示します。

## データベーススキーマ

主要なテーブル：

- `users`: ユーザー情報（母語、表示言語設定）
- `conversations`: 会話（1対1またはグループ）
- `conversation_members`: 会話のメンバー
- `messages`: メッセージ（原文、検出言語）
- `message_translations`: 翻訳結果のキャッシュ
- `message_reads`: 既読状態
- `blocks`: ブロック情報
- `reports`: 通報情報

詳細は `supabase-schema.sql` を参照してください。

## 実装済み機能（MVP）

- ✅ アカウント作成/ログイン
- ✅ 1対1/グループチャット
- ✅ 自動言語判定
- ✅ オンデマンド翻訳（方式B）
- ✅ 原文/翻訳文の切替表示
- ✅ メッセージ送信取り消し（5分以内）
- ✅ 既読表示
- ✅ メッセージ検索
- ✅ 返信機能
- ✅ ブロック・通報機能
- ✅ NGワード/スパム検知
- ✅ 設定ページ（言語設定、プロフィール管理）

## 今後の拡張予定

- [ ] 音声入力→文字起こし→翻訳
- [ ] 通話（音声/動画）同時通訳
- [ ] 専門用語辞書・企業用用語集
- [ ] 翻訳品質フィードバック/学習
- [ ] オフライン翻訳（限定言語）
- [ ] プッシュ通知
- [ ] 画像キャプションの翻訳
- [ ] リアクション機能のUI改善
- [ ] メッセージ編集機能

## ライセンス

MIT

