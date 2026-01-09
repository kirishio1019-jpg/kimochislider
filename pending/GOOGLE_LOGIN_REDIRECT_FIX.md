# GoogleログインのリダイレクトURL修正

## 問題

デプロイ済みのアプリでGoogleログインすると、ローカルのURL（`http://localhost:3000`）にリダイレクトされてしまう。

## 原因

`app/page.tsx`の`handleGoogleLogin`関数で、`window.location.origin`を使用していたため、本番環境でも現在のURLが使用されていました。

## 修正内容

### 1. コードの修正

`app/page.tsx`の`handleGoogleLogin`関数を修正：

**修正前:**
```typescript
redirectTo: `${window.location.origin}/auth/callback`,
```

**修正後:**
```typescript
// 本番環境では環境変数を使用、開発環境ではwindow.location.originを使用
const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
const redirectUrl = `${appUrl}/auth/callback`

const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: redirectUrl,
  },
})
```

### 2. 環境変数の確認

Vercel Dashboardで環境変数`NEXT_PUBLIC_APP_URL`が正しく設定されているか確認：

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクトを選択
3. 「Settings」→「Environment Variables」を開く
4. `NEXT_PUBLIC_APP_URL`が実際のVercel URLに設定されているか確認
   - 例: `https://kimochislider-xxxxx.vercel.app`
5. 設定されていない、または間違っている場合は修正

### 3. SupabaseのリダイレクトURL設定の確認

Supabase DashboardでリダイレクトURLが正しく設定されているか確認：

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. 「Authentication」→「URL Configuration」を開く
4. 「Redirect URLs」に以下が含まれているか確認：
   ```
   https://your-app-name.vercel.app/auth/callback
   ```
   ⚠️ `your-app-name.vercel.app`を実際のVercel URLに置き換えてください

5. 「Site URL」が正しく設定されているか確認：
   ```
   https://your-app-name.vercel.app
   ```

6. 設定されていない場合は追加して「Save」をクリック

## 動作確認

### ローカル環境での確認

1. `.env.local`ファイルに以下が設定されているか確認：
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

2. 開発サーバーを起動：
   ```powershell
   cd c:\Users\kiris\.cursor\pending
   npm run dev
   ```

3. ブラウザで `http://localhost:3000` にアクセス
4. Googleログインを試す
5. リダイレクト先が `http://localhost:3000/auth/callback` になっているか確認

### 本番環境での確認

1. Vercelにデプロイ後、実際のURLにアクセス
2. Googleログインを試す
3. リダイレクト先が `https://your-app-name.vercel.app/auth/callback` になっているか確認
4. 正しくリダイレクトされない場合は、以下を確認：
   - Vercelの環境変数`NEXT_PUBLIC_APP_URL`が正しく設定されているか
   - SupabaseのリダイレクトURL設定が正しいか
   - ブラウザのコンソールにエラーがないか

## トラブルシューティング

### 問題: まだローカルURLにリダイレクトされる

**原因1**: Vercelの環境変数が設定されていない、または間違っている
- **解決策**: Vercel Dashboardで`NEXT_PUBLIC_APP_URL`を確認・修正し、再デプロイ

**原因2**: SupabaseのリダイレクトURL設定が間違っている
- **解決策**: Supabase DashboardでリダイレクトURLを確認・修正

**原因3**: ブラウザのキャッシュ
- **解決策**: ブラウザのキャッシュをクリアして再試行

### 問題: 環境変数が反映されない

**解決策**: 
1. Vercel Dashboardで環境変数を確認
2. 環境変数を変更した場合は、再デプロイが必要です
3. 「Deployments」タブで最新のデプロイを選択し、「Redeploy」をクリック

## 確認チェックリスト

- [ ] コードが修正されている（`app/page.tsx`）
- [ ] Vercelの環境変数`NEXT_PUBLIC_APP_URL`が設定されている
- [ ] SupabaseのリダイレクトURLに本番URLが追加されている
- [ ] SupabaseのSite URLが本番URLに設定されている
- [ ] ローカル環境で動作確認済み
- [ ] 本番環境で動作確認済み
