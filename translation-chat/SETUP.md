# セットアップガイド

## 前提条件

- Node.js 18以上
- npm または yarn
- Supabaseアカウント
- Google Cloud Translation API または DeepL API のアカウント

## ステップ1: プロジェクトのクローンと依存関係のインストール

```bash
cd translation-chat
npm install
```

## ステップ2: Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com/)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトの設定から以下を取得：
   - Project URL
   - Anon public key
   - Service role key（オプション、管理用）

## ステップ3: データベーススキーマの適用

1. Supabase Dashboard > SQL Editor を開く
2. `supabase-schema.sql` の内容をコピーして実行
3. テーブルが正常に作成されたことを確認

## ステップ4: 環境変数の設定

`.env.local` ファイルをプロジェクトルートに作成：

```env
# Supabase設定（必須）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 翻訳API設定（いずれか一方を設定、必須）
GOOGLE_TRANSLATE_API_KEY=your-google-api-key
# または
DEEPL_API_KEY=your-deepl-api-key
DEEPL_API_FREE=true  # DeepL無料プランの場合

# アプリ設定（オプション）
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## ステップ5: Google Cloud Translation API のセットアップ（オプション）

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. Cloud Translation APIを有効化
4. 認証情報 > APIキーを作成
5. APIキーをコピーして `.env.local` に設定

**注意**: APIキーの使用制限を設定することを推奨します。

## ステップ6: DeepL API のセットアップ（オプション）

1. [DeepL](https://www.deepl.com/pro-api)にアクセス
2. アカウントを作成（無料プランも利用可能）
3. APIキーを取得
4. `.env.local` に設定

## ステップ7: 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

## トラブルシューティング

### 認証エラーが発生する場合

- Supabaseの認証設定を確認
- Email認証が有効になっているか確認
- RLSポリシーが正しく設定されているか確認

### 翻訳が動作しない場合

- 環境変数が正しく設定されているか確認
- APIキーが有効か確認
- APIの使用制限に達していないか確認
- ブラウザのコンソールでエラーメッセージを確認

### リアルタイム更新が動作しない場合

- Supabase Realtimeが有効になっているか確認
- データベースのReplication設定を確認

## 本番環境へのデプロイ

### Vercelへのデプロイ

1. GitHubリポジトリにプッシュ
2. [Vercel](https://vercel.com/)でプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

### その他のプラットフォーム

環境変数を適切に設定すれば、Next.jsをサポートする任意のプラットフォームにデプロイ可能です。

