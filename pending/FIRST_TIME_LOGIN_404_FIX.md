# 最初のログイン時の404エラー修正ガイド

## 問題の症状

- **設定は全て正しい**
- **一度エラーが出ても戻ると正常にログインされている**
- **一番最初にログインするときに404エラーが出る**

## 考えられる原因

### 1. Supabase Auth APIエンドポイントへの最初のリクエストが失敗している

最初のログイン時に、Supabaseの認証エンドポイント（`https://your-project.supabase.co/auth/v1/authorize`）へのリクエストが404エラーを返している可能性があります。

### 2. OAuth認証のリダイレクトURLがSupabase Dashboardに登録されていない

`signInWithOAuth`が返す`data.url`に含まれるリダイレクトURLが、Supabase Dashboardに登録されていない可能性があります。

### 3. ブラウザのセキュリティ設定やCORSの問題

ブラウザのセキュリティ設定やCORSポリシーが、最初のOAuth認証リクエストをブロックしている可能性があります。

### 4. Supabaseクライアントの初期化の問題

Supabaseクライアントが正しく初期化されていない、または認証フロー（PKCE）が正しく設定されていない可能性があります。

## 診断方法

### ステップ1: ブラウザのコンソールで確認

1. 本番環境のURLにアクセス
2. F12キーで開発者ツールを開く
3. 「Console」タブを選択
4. Googleログインボタンをクリック
5. 以下のログを確認：

```
🔵 === Google Login Debug ===
🔵 Redirect URL: https://kimochislider.vercel.app/auth/callback
🔵 --- Supabase Configuration ---
🔵 NEXT_PUBLIC_SUPABASE_URL: https://abcdefghijklmnop.supabase.co
🔵 ========================
🔵 === Attempting OAuth Sign In ===
🔵 Provider: google
🔵 Redirect To: https://kimochislider.vercel.app/auth/callback
🔵 Supabase Auth Endpoint: https://abcdefghijklmnop.supabase.co/auth/v1/authorize
🔵 ===============================
```

### ステップ2: OAuth URLの確認

エラーが発生した場合、以下のログが表示されます：

```
🔴 === OAuth Error Details ===
🔴 Error: ...
🔴 Error message: 404: NOT_FOUND
...
```

**成功した場合**、以下のログが表示されます：

```
🟢 === OAuth URL Generated Successfully ===
🟢 OAuth URL: https://abcdefghijklmnop.supabase.co/auth/v1/authorize?provider=google&...
🟢 Will redirect to: https://abcdefghijklmnop.supabase.co/auth/v1/authorize?provider=google&...
🟢 ========================================
```

### ステップ3: Networkタブで確認

1. 開発者ツールの「Network」タブを開く
2. Googleログインボタンをクリック
3. 以下のリクエストを確認：
   - `auth/v1/authorize`へのリクエスト
   - ステータスコードが404になっていないか確認
   - レスポンスの内容を確認

## 解決方法

### 方法1: Supabase Dashboardで設定を再確認

1. **Redirect URLsの確認**
   - Supabase Dashboard → Authentication → URL Configuration
   - 「Redirect URLs」に以下が登録されているか確認：
     ```
     https://kimochislider.vercel.app/auth/callback
     ```
   - 登録されていない場合は追加
   - 「Save」をクリック
   - **30秒待つ**

2. **Site URLの確認**
   - 「Site URL」が以下に設定されているか確認：
     ```
     https://kimochislider.vercel.app
     ```
   - 設定されていない場合は設定
   - 「Save」をクリック
   - **30秒待つ**

3. **Google Providerの確認**
   - Supabase Dashboard → Authentication → Providers → Google
   - 「Enabled」がONになっているか確認
   - 「Client ID」と「Client Secret」が設定されているか確認

### 方法2: Vercelの環境変数を確認

1. Vercel Dashboard → Settings → Environment Variables
2. `NEXT_PUBLIC_SUPABASE_URL`が正しいか確認
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY`が設定されているか確認
4. 間違っている場合は修正
5. **再デプロイを実行**

### 方法3: ブラウザのキャッシュをクリア

1. シークレットモードで試す
2. または、ブラウザのキャッシュを完全にクリア（Ctrl+Shift+Delete）
3. ブラウザを再起動

### 方法4: Supabaseクライアントの設定を確認

コードでは、PKCE flowを明示的に設定しています：

```typescript
return createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce', // PKCE flowを使用（より安全）
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
```

この設定により、より安全な認証フローが使用されます。

## 追加の診断情報

### OAuth URLの検証

コードでは、`signInWithOAuth`が返す`data.url`を確認し、正しい場合にリダイレクトを実行します：

```typescript
if (data?.url) {
  console.log('🟢 OAuth URL:', data.url)
  // OAuth URLの検証
  if (!data.url.startsWith('https://')) {
    console.error('🔴 OAuth URL does not start with https://')
    return
  }
  // リダイレクトを実行
  window.location.href = data.url
  return
}
```

### エラーの詳細な分析

404エラーが発生した場合、以下の情報がコンソールに表示されます：

```
🔴 === 404 Error Analysis ===
🔴 Error occurred during signInWithOAuth call
🔴 This might be a Supabase API endpoint issue
🔴 Check if Supabase Auth endpoint is accessible
🔴 Expected endpoint: https://your-project.supabase.co/auth/v1/authorize
🔴 ===========================
```

## 確認チェックリスト

- [ ] Supabase Dashboardで「Redirect URLs」に本番URLが登録されている
- [ ] Supabase Dashboardで「Site URL」が設定されている
- [ ] Supabase DashboardでGoogle Providerが有効化されている
- [ ] Vercel Dashboardで`NEXT_PUBLIC_SUPABASE_URL`が正しい
- [ ] Vercel Dashboardで`NEXT_PUBLIC_SUPABASE_ANON_KEY`が設定されている
- [ ] ブラウザのコンソールでOAuth URLが生成されているか確認
- [ ] Networkタブで`auth/v1/authorize`へのリクエストが成功しているか確認

## まだ解決しない場合

1. **Supabase Dashboardの設定を再保存**
   - 設定を削除して再度追加
   - 「Save」をクリック
   - 30秒待つ

2. **Vercelの再デプロイ**
   - Vercel Dashboardで最新のデプロイを選択
   - 「Redeploy」をクリック

3. **別のブラウザで試す**
   - Chrome、Firefox、Edgeなどで試す

4. **Supabaseのサポートに問い合わせ**
   - Supabase Dashboard → Support
   - エラーの詳細（エラーID、コンソールログ）を共有
