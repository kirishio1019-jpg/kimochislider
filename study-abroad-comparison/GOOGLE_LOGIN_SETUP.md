# Googleログイン機能のセットアップ

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクト設定から以下を取得：
   - Project URL
   - Anon public key

## 2. Google認証プロバイダーの設定

1. Supabaseダッシュボードで「Authentication」→「Providers」に移動
2. Googleプロバイダーを有効化
3. Google Cloud ConsoleでOAuth 2.0認証情報を作成：
   - [Google Cloud Console](https://console.cloud.google.com/)
   - 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuth 2.0 クライアント ID」
   - 承認済みのリダイレクト URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Client IDとClient SecretをSupabaseに設定

## 3. 環境変数の設定

プロジェクトルートに`.env.local`ファイルを作成し、以下を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. 実装された機能

- ✅ Googleログイン/ログアウト
- ✅ レビュー投稿時のユーザーID保存
- ✅ 編集・削除時のユーザーIDチェック
- ✅ 作成者のみが編集・削除可能

## 5. 注意事項

- 環境変数を設定しないと、アプリケーションが正しく動作しません
- `.env.local`ファイルは`.gitignore`に追加してください（既に追加されているはずです）


