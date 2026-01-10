# Googleログイン404エラー修正ガイド

## エラー内容

```
404: NOT_FOUND
Code: NOT_FOUND
ID: hnd1::cgq86-1768031586922-b0c66a307b2e
```

このエラーは、**Supabase DashboardでリダイレクトURLが設定されていない**場合に発生します。

## 即座に解決する方法

### ステップ1: 実際のVercel URLを確認

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクト `kimochislider` を選択
3. 「Deployments」タブを開く
4. 最新のデプロイのURLをコピー（例: `https://kimochislider-xxxxx.vercel.app`）
   - または、プロジェクト設定の「Domains」セクションで確認

### ステップ2: Supabase DashboardでリダイレクトURLを設定

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. **プロジェクトを選択**
3. 左側のメニューから「**Authentication**」をクリック
4. 「**URL Configuration**」をクリック
5. 「**Redirect URLs**」セクションで「**Add URL**」をクリック
6. 以下のURLを**正確に**入力：
   ```
   https://your-actual-vercel-url.vercel.app/auth/callback
   ```
   ⚠️ **重要**: 
   - `your-actual-vercel-url.vercel.app`を実際のVercel URLに置き換える
   - `https://`で始める
   - 末尾に`/auth/callback`を追加
   - スラッシュ（`/`）の位置に注意

7. 「**Site URL**」も設定：
   ```
   https://your-actual-vercel-url.vercel.app
   ```
   ⚠️ 末尾にスラッシュ（`/`）は不要

8. 「**Save**」をクリック

### ステップ3: 動作確認

1. 設定を保存後、**10-30秒待つ**（設定が反映されるまで）
2. 本番環境のURLにアクセス
3. ブラウザの開発者ツール（F12）を開く
4. 「Console」タブを選択
5. Googleログインボタンをクリック
6. コンソールに表示される`=== Google Login Debug ===`のログを確認
   - `Redirect URL`が正しいか確認
   - `App URL`が正しいか確認
7. エラーが解消されているか確認

## よくある間違い

### ❌ 間違った設定例

```
https://your-app-name.vercel.app/auth/callback/  ← 末尾にスラッシュがある
http://your-app-name.vercel.app/auth/callback   ← httpではなくhttps
https://your-app-name.vercel.app                ← /auth/callbackがない
your-app-name.vercel.app/auth/callback          ← https://がない
```

### ✅ 正しい設定例

```
https://kimochislider-xxxxx.vercel.app/auth/callback
```

## 確認チェックリスト

- [ ] Vercelの実際のURLを確認した
- [ ] Supabase Dashboardで「Redirect URLs」に本番URLを追加した
- [ ] URLは`https://`で始まっている
- [ ] URLの末尾は`/auth/callback`になっている
- [ ] 末尾に余分なスラッシュ（`/`）がない
- [ ] 「Site URL」も本番URLに設定した
- [ ] 「Save」をクリックした
- [ ] 設定後、10-30秒待ってから再試行した
- [ ] ブラウザのコンソールログを確認した

## デバッグ方法

### 1. ブラウザのコンソールログを確認

1. F12キーを押して開発者ツールを開く
2. 「Console」タブを選択
3. Googleログインボタンをクリック
4. 以下のログを確認：
   ```
   === Google Login Debug ===
   App URL: https://your-actual-url.vercel.app
   Redirect URL: https://your-actual-url.vercel.app/auth/callback
   Window location origin: https://your-actual-url.vercel.app
   Window location hostname: your-actual-url.vercel.app
   NEXT_PUBLIC_APP_URL: undefined (または実際の値)
   ========================
   ```

### 2. Supabase Dashboardの設定を再確認

1. 「Redirect URLs」に追加したURLが正確か確認
2. URLにタイポがないか確認
3. 大文字・小文字が正しいか確認
4. 複数のURLが追加されている場合、正しいURLが含まれているか確認

### 3. Vercelの環境変数を確認

1. Vercel Dashboardでプロジェクトを選択
2. 「Settings」→「Environment Variables」を開く
3. `NEXT_PUBLIC_APP_URL`が設定されているか確認
4. 設定されていない、または間違っている場合は修正
5. 修正後、再デプロイを実行

## 緊急時の対処法

もし設定がうまくいかない場合：

1. Supabase Dashboardで「Redirect URLs」に以下を**すべて**追加：
   ```
   https://your-app-name.vercel.app/auth/callback
   https://your-app-name.vercel.app/*
   http://localhost:3000/auth/callback
   ```

2. 「Site URL」を以下に設定：
   ```
   https://your-app-name.vercel.app
   ```

3. 「Save」をクリック

4. **30秒待つ**

5. ブラウザのキャッシュをクリア（Ctrl+Shift+Delete）

6. シークレットモードで再試行

## まだエラーが発生する場合

1. **Vercelの再デプロイ**
   - Vercel Dashboardで最新のデプロイを選択
   - 「Redeploy」をクリック

2. **Supabaseの設定を再確認**
   - 「Redirect URLs」に追加したURLを削除して再度追加
   - 「Save」をクリック
   - 30秒待つ

3. **ブラウザのキャッシュを完全にクリア**
   - シークレットモードで試す
   - または、ブラウザのキャッシュを完全にクリア

4. **別のブラウザで試す**
   - Chrome、Firefox、Edgeなどで試す
