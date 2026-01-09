# SupabaseリダイレクトURL 404エラー クイック修正ガイド

## エラー内容

```
404: NOT_FOUND
Code: NOT_FOUND
ID: hnd1::qcz94-1767990554488-01567e5a8397
```

このエラーは、**Supabase DashboardでリダイレクトURLが設定されていない**場合に発生します。

## 即座に解決する方法

### ステップ1: 実際のVercel URLを確認

1. Vercel Dashboardにアクセス
2. プロジェクトを選択
3. 「Deployments」タブを開く
4. 最新のデプロイのURLをコピー（例: `https://kimochislider-xxxxx.vercel.app`）

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

1. 設定を保存後、**数秒待つ**（設定が反映されるまで）
2. 本番環境のURLにアクセス
3. Googleログインボタンをクリック
4. エラーが解消されているか確認

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
- [ ] 設定後、数秒待ってから再試行した

## まだエラーが発生する場合

1. **ブラウザのコンソールログを確認**
   - F12キーを押して開発者ツールを開く
   - 「Console」タブを選択
   - `=== Google Login Debug ===`のログを確認
   - `Redirect URL`が正しいか確認

2. **Supabase Dashboardの設定を再確認**
   - 「Redirect URLs」に追加したURLが正確か確認
   - URLにタイポがないか確認
   - 大文字・小文字が正しいか確認

3. **ブラウザのキャッシュをクリア**
   - シークレットモードで試す
   - または、ブラウザのキャッシュをクリア

4. **Vercelの再デプロイ**
   - Vercel Dashboardで最新のデプロイを選択
   - 「Redeploy」をクリック

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

4. 数秒待ってから再試行
