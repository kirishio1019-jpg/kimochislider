# 404エラー診断ガイド

## エラー情報
```
404: NOT_FOUND
Code: NOT_FOUND
ID: hnd1::mxwvx-1768032677354-ba62b216ca7b
```

## 診断手順

### ステップ1: ブラウザのコンソールログを確認

1. F12キーを押して開発者ツールを開く
2. 「Console」タブを選択
3. Googleログインボタンをクリック
4. 以下の情報を確認：

```
=== Google Login Debug ===
App URL: [実際のURL]
Redirect URL: [実際のURL]
--- Supabase Configuration ---
NEXT_PUBLIC_SUPABASE_URL: [Supabase URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY: [Anon Keyの最初の20文字]...
Supabase URL valid: true/false
========================
```

### ステップ2: Supabase Dashboardで確認

#### 2-1. リダイレクトURLの確認

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. 「Authentication」→「URL Configuration」を開く
4. 「Redirect URLs」セクションを確認
5. **コンソールに表示された`Redirect URL`が正確に登録されているか確認**
   - 例: `https://your-app-name.vercel.app/auth/callback`
   - ⚠️ **完全一致が必要です**（末尾のスラッシュ、大文字小文字など）

#### 2-2. Site URLの確認

1. 「Site URL」が正しく設定されているか確認
2. コンソールに表示された`App URL`と一致しているか確認
   - 例: `https://your-app-name.vercel.app`
   - ⚠️ 末尾にスラッシュ（`/`）は不要

#### 2-3. Google Providerの確認

1. 「Authentication」→「Providers」を開く
2. 「Google」をクリック
3. 以下を確認：
   - ✅ **Enabled**がONになっているか
   - ✅ **Client ID**が設定されているか
   - ✅ **Client Secret**が設定されているか

### ステップ3: Vercelの環境変数を確認

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクト `kimochislider` を選択
3. 「Settings」→「Environment Variables」を開く
4. 以下の環境変数を確認：

#### NEXT_PUBLIC_SUPABASE_URL
- ✅ 設定されているか
- ✅ `https://`で始まっているか
- ✅ `.supabase.co`を含んでいるか
- ✅ Supabase Dashboardの「Settings」→「API」→「Project URL」と一致しているか

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ 設定されているか
- ✅ Supabase Dashboardの「Settings」→「API」→「anon public」キーと一致しているか

#### NEXT_PUBLIC_APP_URL（オプション）
- ✅ 設定されている場合、実際のVercel URLと一致しているか

### ステップ4: よくある間違いの確認

#### ❌ 間違った設定例

1. **リダイレクトURLの末尾にスラッシュがある**
   ```
   https://your-app-name.vercel.app/auth/callback/  ← 間違い
   ```

2. **httpとhttpsが混在している**
   ```
   http://your-app-name.vercel.app/auth/callback   ← 間違い（httpsが必要）
   ```

3. **リダイレクトURLが登録されていない**
   - Supabase Dashboardに登録されていない

4. **Supabase URLが間違っている**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://wrong-url.supabase.co  ← 間違い
   ```

5. **Google Providerが有効化されていない**
   - Supabase DashboardでGoogle ProviderがOFFになっている

#### ✅ 正しい設定例

1. **リダイレクトURL**
   ```
   https://your-app-name.vercel.app/auth/callback
   ```

2. **Site URL**
   ```
   https://your-app-name.vercel.app
   ```

3. **Supabase URL**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

## 解決方法

### 方法1: Supabase DashboardでリダイレクトURLを設定

1. Supabase Dashboard → Authentication → URL Configuration
2. 「Redirect URLs」に以下を追加：
   ```
   https://your-actual-vercel-url.vercel.app/auth/callback
   ```
   ⚠️ `your-actual-vercel-url.vercel.app`を実際のVercel URLに置き換える
3. 「Site URL」を設定：
   ```
   https://your-actual-vercel-url.vercel.app
   ```
4. 「Save」をクリック
5. **30秒待つ**

### 方法2: Vercelの環境変数を確認・修正

1. Vercel Dashboard → Settings → Environment Variables
2. `NEXT_PUBLIC_SUPABASE_URL`を確認
3. Supabase Dashboard → Settings → API → Project URLと一致しているか確認
4. 間違っている場合は修正
5. 修正後、再デプロイを実行

### 方法3: Google Providerを有効化

1. Supabase Dashboard → Authentication → Providers
2. 「Google」をクリック
3. 「Enabled」をONにする
4. 「Client ID」と「Client Secret」を設定
5. 「Save」をクリック

## デバッグ用コード

ブラウザのコンソールで以下のコードを実行して、設定を確認できます：

```javascript
// Supabase設定の確認
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')
console.log('App URL:', window.location.origin)
console.log('Redirect URL:', `${window.location.origin}/auth/callback`)
```

## まだ解決しない場合

1. **Supabase Dashboardの設定を再確認**
   - リダイレクトURLを削除して再度追加
   - 「Save」をクリック
   - 30秒待つ

2. **Vercelの再デプロイ**
   - Vercel Dashboardで最新のデプロイを選択
   - 「Redeploy」をクリック

3. **ブラウザのキャッシュをクリア**
   - シークレットモードで試す
   - または、ブラウザのキャッシュを完全にクリア

4. **別のブラウザで試す**
   - Chrome、Firefox、Edgeなどで試す
