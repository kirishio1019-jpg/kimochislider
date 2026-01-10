# Translation Chat - プロジェクト概要

## プロジェクトの目的

異なる母語同士でも「翻訳を意識せず」会話できる、リアルタイム自動翻訳付きメッセージアプリを構築しました。

## 実装済み機能

### ✅ MVP機能（完成）

1. **アカウント管理**
   - サインアップ/ログイン
   - プロフィール設定（母語、表示言語）
   - ユーザー認証（Supabase Auth）

2. **チャット機能**
   - 1対1チャット
   - グループチャット
   - メッセージ送受信
   - リアルタイム更新（Supabase Realtime）

3. **翻訳機能**
   - 自動言語判定
   - オンデマンド翻訳（方式B）
   - 翻訳結果のキャッシュ
   - 原文/翻訳文の切替表示
   - Google Cloud Translation API / DeepL API対応

4. **UI機能**
   - チャット一覧
   - メッセージ表示
   - 翻訳トグル
   - 既読表示
   - レスポンシブデザイン

5. **安全機能**
   - ブロック機能
   - 通報機能
   - Row Level Security (RLS)

## アーキテクチャ

### フロントエンド
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**

### バックエンド
- **Supabase** (PostgreSQL + Realtime + Auth)
- **Next.js API Routes**

### 外部サービス
- **Google Cloud Translation API** または **DeepL API**

## データフロー

### メッセージ送信フロー

```
1. ユーザーがメッセージを入力
   ↓
2. フロントエンド → POST /api/messages
   ↓
3. 言語判定（自動 or ユーザー指定）
   ↓
4. メッセージをDBに保存（messagesテーブル）
   ↓
5. Supabase Realtimeで他のユーザーに通知
   ↓
6. 受信者がメッセージを表示
   ↓
7. 翻訳が必要な場合、オンデマンドで翻訳を取得
   ↓
8. 翻訳結果をキャッシュ（message_translationsテーブル）
```

### 翻訳フロー

```
1. メッセージ表示時に翻訳が必要か判定
   ↓
2. キャッシュをチェック（message_translationsテーブル）
   ↓
3. キャッシュがない場合、POST /api/translate
   ↓
4. 翻訳APIを呼び出し
   ↓
5. 翻訳結果をDBに保存
   ↓
6. フロントエンドに返却
```

## データベース設計

### 主要テーブル

- **users**: ユーザー情報、言語設定
- **conversations**: 会話（1対1/グループ）
- **conversation_members**: 会話のメンバー
- **messages**: メッセージ（原文、検出言語）
- **message_translations**: 翻訳結果のキャッシュ
- **message_reads**: 既読状態
- **blocks**: ブロック情報
- **reports**: 通報情報

詳細は `supabase-schema.sql` を参照。

## APIエンドポイント

### 認証
- Supabase Authを使用（Next.js API Routes経由）

### 会話
- `GET /api/conversations` - 会話一覧取得
- `POST /api/conversations` - 会話作成

### メッセージ
- `GET /api/messages?conversationId=xxx` - メッセージ取得
- `POST /api/messages` - メッセージ送信
- `POST /api/messages/read` - 既読マーク

### 翻訳
- `POST /api/translate` - 翻訳取得

### 安全機能
- `GET /api/blocks` - ブロック一覧
- `POST /api/blocks` - ブロック作成
- `DELETE /api/blocks?blockedId=xxx` - ブロック解除
- `POST /api/reports` - 通報作成

## セキュリティ

### Row Level Security (RLS)
- すべてのテーブルでRLSを有効化
- ユーザーは自分のデータと参加している会話のみアクセス可能

### 認証
- Supabase Authを使用
- JWTトークンベースの認証

### データ保護
- 通信はTLSで暗号化
- 翻訳APIへの送信データは利用規約で明記（要実装）

## パフォーマンス最適化

### 翻訳キャッシュ
- 同じメッセージ×言語の組み合わせは再利用
- `message_translations`テーブルに保存

### リアルタイム更新
- Supabase Realtimeを使用
- 新しいメッセージを即座に表示

### ページング
- メッセージ取得時にlimit/offsetを使用
- 大量のメッセージでもパフォーマンスを維持

## 今後の拡張予定

### 優先度: 高
- [ ] プッシュ通知
- [ ] 画像アップロード・表示
- [ ] メッセージ検索機能

### 優先度: 中
- [ ] 音声入力→文字起こし→翻訳
- [ ] メッセージ編集・削除
- [ ] リアクション機能のUI実装

### 優先度: 低
- [ ] 通話（音声/動画）同時通訳
- [ ] 専門用語辞書
- [ ] オフライン翻訳
- [ ] 翻訳品質フィードバック

## 開発時の注意事項

### 環境変数
- `.env.local` に必要な環境変数を設定
- 翻訳APIキーは必須

### データベース
- `supabase-schema.sql` を実行してテーブルを作成
- RLSポリシーが正しく設定されているか確認

### 翻訳API
- Google Cloud Translation API または DeepL API のいずれかを設定
- API使用量に注意（コスト管理）

## トラブルシューティング

### よくある問題

1. **翻訳が動作しない**
   - 環境変数を確認
   - APIキーが有効か確認
   - ブラウザコンソールでエラーを確認

2. **リアルタイム更新が動作しない**
   - Supabase Realtimeが有効か確認
   - データベースのReplication設定を確認

3. **認証エラー**
   - Supabaseの認証設定を確認
   - RLSポリシーを確認

詳細は `SETUP.md` と `README.md` を参照してください。

