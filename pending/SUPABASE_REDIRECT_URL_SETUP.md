# SupabaseリダイレクトURL設定ガイド

## 問題

GoogleログインのリダイレクトURLがlocalhostになってしまう問題を解決するためのガイドです。

## 重要な設定

SupabaseのOAuth認証では、**Supabase DashboardでリダイレクトURLを許可する必要があります**。これが設定されていないと、リダイレクトが失敗します。

## 設定手順

### 1. Supabase DashboardでリダイレクトURLを設定

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. 左側のメニューから「**Authentication**」をクリック
4. 「**URL Configuration**」をクリック
5. 「**Redirect URLs**」セクションで以下を追加：

   **本番環境用:**
   ```
   https://your-app-name.vercel.app/auth/callback
   ```
   ⚠️ `your-app-name.vercel.app`を実際のVercel URLに置き換えてください

   **開発環境用:**
   ```
   http://localhost:3000/auth/callback
   ```

6. 「**Site URL**」も設定：
   ```
   https://your-app-name.vercel.app
   ```
   ⚠️ 本番環境のURLを設定してください

7. 「**Save**」をクリック

### 2. Google OAuth設定の確認

1. 「Authentication」→「**Providers**」をクリック
2. 「**Google**」をクリック
3. 以下が設定されているか確認：
   - **Enabled**: ON
   - **Client ID**: Google OAuth Client ID
   - **Client Secret**: Google OAuth Client Secret
4. 「**Save**」をクリック

### 3. 動作確認

1. 本番環境にデプロイ後、実際のURLにアクセス
2. Googleログインボタンをクリック
3. ブラウザの開発者ツール（F12）→「Console」タブを開く
4. 以下のログを確認：
   ```
   === Google Login Debug ===
   App URL: https://your-app-name.vercel.app
   Redirect URL: https://your-app-name.vercel.app/auth/callback
   Window location origin: https://your-app-name.vercel.app
   Window location hostname: your-app-name.vercel.app
   ========================
   ```
5. Google認証画面にリダイレクトされることを確認
6. 認証後、`https://your-app-name.vercel.app/auth/callback`にリダイレクトされることを確認

## トラブルシューティング

### まだlocalhostにリダイレクトされる場合

1. **SupabaseのリダイレクトURL設定を確認**
   - Supabase Dashboardで「Authentication」→「URL Configuration」を開く
   - 「Redirect URLs」に本番URLが追加されているか確認
   - 末尾にスラッシュ（`/`）がないか確認

2. **ブラウザのコンソールログを確認**
   - `=== Google Login Debug ===`のログを確認
   - `Redirect URL`が本番URLになっているか確認
   - もしlocalhostになっている場合、`getAppUrl()`のログも確認

3. **Vercelの環境変数を確認**
   - Vercel Dashboardで`NEXT_PUBLIC_APP_URL`が設定されているか確認
   - 設定されていない場合は設定して再デプロイ

4. **ブラウザのキャッシュをクリア**
   - ブラウザのキャッシュをクリアして再試行
   - シークレットモードで確認

### リダイレクトエラーが発生する場合

1. **SupabaseのリダイレクトURL設定を確認**
   - リダイレクトURLが正確に設定されているか確認
   - URLにタイポがないか確認

2. **Google OAuth設定を確認**
   - Google Cloud Consoleで「承認済みのリダイレクト URI」に以下が追加されているか確認：
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```
   - Supabase Dashboardの「Authentication」→「Providers」→「Google」でClient IDとSecretが正しく設定されているか確認

## 確認チェックリスト

- [ ] Supabase Dashboardで「Redirect URLs」に本番URLが追加されている
- [ ] Supabase Dashboardで「Site URL」が本番URLに設定されている
- [ ] Google OAuth Providerが有効化されている
- [ ] Google OAuth Client IDとSecretが設定されている
- [ ] Google Cloud ConsoleでリダイレクトURIが設定されている
- [ ] Vercelの環境変数`NEXT_PUBLIC_APP_URL`が設定されている（オプション）
- [ ] ブラウザのコンソールでリダイレクトURLが本番URLになっている
- [ ] Googleログインが正常に動作している

## 技術的な詳細

### `getAppUrl()`関数の動作

```typescript
export function getAppUrl(): string {
  if (typeof window === 'undefined') {
    // サーバーサイド: 環境変数を使用
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
  
  // クライアントサイド
  const currentOrigin = window.location.origin
  const isProduction = !window.location.hostname.includes('localhost')
  
  // 本番環境の場合、常にcurrentOriginを使用（本番URL）
  if (isProduction) {
    return currentOrigin
  }
  
  // 開発環境の場合
  return currentOrigin // localhost:3000
}
```

### 重要なポイント

- **本番環境では`window.location.origin`が本番URLになる**
  - ユーザーが`https://your-app.vercel.app`にアクセスしている場合、`window.location.origin`は`https://your-app.vercel.app`になります
  - そのため、環境変数が設定されていなくても、本番環境では正しく動作します

- **SupabaseのリダイレクトURLは必須**
  - Supabase DashboardでリダイレクトURLを許可しないと、OAuth認証が失敗します
  - 本番URLと開発URLの両方を追加することを推奨します
