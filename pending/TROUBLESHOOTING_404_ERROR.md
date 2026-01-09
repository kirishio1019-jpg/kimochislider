# Googleログイン404エラーの解決方法

## エラー内容

Googleログイン後に以下のエラーが発生する場合：

```
404: NOT_FOUND
Code: NOT_FOUND
ID: hnd1::gwrlt-1767989969235-88b586f3d705
```

## 原因

このエラーは、SupabaseのリダイレクトURL設定が正しくない場合に発生します。

## 解決方法

### 1. Supabase DashboardでリダイレクトURLを確認・設定

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. 左側のメニューから「**Authentication**」をクリック
4. 「**URL Configuration**」をクリック
5. 「**Redirect URLs**」セクションを確認

   **以下のURLが追加されているか確認：**
   ```
   https://your-app-name.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```
   ⚠️ `your-app-name.vercel.app`を実際のVercel URLに置き換えてください

6. 追加されていない場合は追加して「**Save**」をクリック

### 2. Site URLの確認

1. 同じ「URL Configuration」ページで「**Site URL**」を確認
2. 本番環境のURLが設定されているか確認：
   ```
   https://your-app-name.vercel.app
   ```
3. 設定されていない場合は設定して「**Save**」をクリック

### 3. Google OAuth設定の確認

1. 「Authentication」→「**Providers**」をクリック
2. 「**Google**」をクリック
3. 以下が設定されているか確認：
   - **Enabled**: ON
   - **Client ID**: Google OAuth Client ID（正しく設定されているか）
   - **Client Secret**: Google OAuth Client Secret（正しく設定されているか）

### 4. Google Cloud Consoleでの設定確認

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを選択
3. 「**APIとサービス**」→「**認証情報**」をクリック
4. OAuth 2.0 クライアント IDをクリック
5. 「**承認済みのリダイレクト URI**」に以下が追加されているか確認：
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
   ⚠️ `your-project-id`を実際のSupabaseプロジェクトIDに置き換えてください

### 5. 動作確認

1. 設定を保存後、本番環境にアクセス
2. Googleログインボタンをクリック
3. ブラウザの開発者ツール（F12）→「Console」タブを開く
4. 以下のログを確認：
   ```
   [Auth Callback] Request URL: ...
   [Auth Callback] Code: ...
   [Auth Callback] App URL: ...
   ```
5. エラーが発生した場合、エラーメッセージがホームページに表示されます

## よくある問題

### 問題1: リダイレクトURLが追加されていない

**症状**: 404エラーが発生する

**解決策**: 
- Supabase Dashboardで「Redirect URLs」に本番URLを追加
- URLにタイポがないか確認
- 末尾にスラッシュ（`/`）がないか確認

### 問題2: Site URLが設定されていない

**症状**: 認証後に正しくリダイレクトされない

**解決策**: 
- Supabase Dashboardで「Site URL」を本番URLに設定

### 問題3: Google OAuth設定が間違っている

**症状**: Google認証画面にリダイレクトされない、または認証後にエラーが発生する

**解決策**: 
- Google Cloud Consoleで「承認済みのリダイレクト URI」にSupabaseのコールバックURLが追加されているか確認
- Supabase DashboardでClient IDとSecretが正しく設定されているか確認

## 確認チェックリスト

- [ ] Supabase Dashboardで「Redirect URLs」に本番URLが追加されている
- [ ] Supabase Dashboardで「Site URL」が本番URLに設定されている
- [ ] Google OAuth Providerが有効化されている
- [ ] Google OAuth Client IDとSecretが正しく設定されている
- [ ] Google Cloud ConsoleでリダイレクトURIが設定されている
- [ ] ブラウザのコンソールでエラーログを確認
- [ ] エラーメッセージがホームページに表示されている（設定後）

## デバッグ方法

### 1. ブラウザのコンソールログを確認

1. ブラウザの開発者ツール（F12）を開く
2. 「Console」タブを選択
3. Googleログインを試す
4. 以下のログを確認：
   - `=== Google Login Debug ===`
   - `[Auth Callback] Request URL:`
   - `[Auth Callback] Code:`
   - `[Auth Callback] Error:`

### 2. ネットワークタブを確認

1. ブラウザの開発者ツール（F12）を開く
2. 「Network」タブを選択
3. Googleログインを試す
4. `/auth/callback`へのリクエストを確認
5. ステータスコードとレスポンスを確認

### 3. Supabase Dashboardのログを確認

1. Supabase Dashboardで「**Logs**」を開く
2. 「**Auth Logs**」を確認
3. エラーが発生しているか確認

## 追加のトラブルシューティング

まだエラーが発生する場合：

1. **ブラウザのキャッシュをクリア**
   - ブラウザのキャッシュをクリアして再試行
   - シークレットモードで確認

2. **Vercelの再デプロイ**
   - Vercel Dashboardで最新のデプロイを選択
   - 「Redeploy」をクリック

3. **環境変数の確認**
   - Vercel Dashboardで`NEXT_PUBLIC_SUPABASE_URL`と`NEXT_PUBLIC_SUPABASE_ANON_KEY`が正しく設定されているか確認

4. **Supabaseプロジェクトの確認**
   - Supabase Dashboardでプロジェクトが正しく動作しているか確認
   - 他の認証方法（メール/パスワードなど）が動作するか確認
