# 404エラー最終修正ガイド

## 問題の症状

- OAuth URLは正常に生成されている
- しかし、404エラーが発生している
- 一度エラーが出ても戻ると正常にログインされている

## 根本原因

Supabase DashboardでリダイレクトURLが正しく設定されていない、または設定が反映されていない可能性があります。

## 解決方法

### 方法1: ワイルドカードパターンを使用（推奨）

Supabase Dashboardで、ワイルドカードパターンを使用してリダイレクトURLを設定します：

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. 「Authentication」→「URL Configuration」を開く
4. 「Redirect URLs」セクションで「Add URL」をクリック
5. 以下のURLを**すべて**追加：

```
https://kimochislider.vercel.app/**
https://*.vercel.app/**
http://localhost:3000/**
```

⚠️ **重要**：
- `**`は任意のパスにマッチします
- これにより、`/auth/callback`だけでなく、すべてのパスが許可されます

6. 「Site URL」を設定：
```
https://kimochislider.vercel.app
```

7. 「Save」をクリック
8. **30秒待つ**

### 方法2: 正確なURLを再登録

1. Supabase Dashboard → Authentication → URL Configuration
2. 「Redirect URLs」セクションで、既存のURLを**すべて削除**
3. 以下を**正確に**追加：

```
https://kimochislider.vercel.app/auth/callback
```

⚠️ **確認ポイント**：
- `https://`で始まっている
- 末尾に`/auth/callback`がある
- **末尾にスラッシュ（`/`）がない**
- 大文字小文字が正しい

4. 「Site URL」を設定：
```
https://kimochislider.vercel.app
```

5. 「Save」をクリック
6. **30秒待つ**

### 方法3: Google OAuth Providerの設定を確認

1. Supabase Dashboard → Authentication → Providers → Google
2. 以下を確認：
   - ✅ **Enabled**がONになっている
   - ✅ **Client ID**が設定されている
   - ✅ **Client Secret**が設定されている
3. 設定されていない場合は設定
4. 「Save」をクリック

### 方法4: Vercelの環境変数を確認

1. Vercel Dashboard → Settings → Environment Variables
2. `NEXT_PUBLIC_SUPABASE_URL`が以下と一致しているか確認：
   ```
   https://qrypddarrakhckzifaqe.supabase.co
   ```
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY`が設定されているか確認
4. 間違っている場合は修正
5. **再デプロイを実行**

## 確認手順

### ステップ1: Supabase Dashboardで確認

1. 「Redirect URLs」に以下が登録されているか確認：
   ```
   https://kimochislider.vercel.app/**
   ```
   または
   ```
   https://kimochislider.vercel.app/auth/callback
   ```

2. 「Site URL」が以下に設定されているか確認：
   ```
   https://kimochislider.vercel.app
   ```

3. Google Providerが有効化されているか確認

### ステップ2: ブラウザのコンソールで確認

1. 本番環境のURLにアクセス
2. F12キーで開発者ツールを開く
3. 「Console」タブを選択
4. Googleログインボタンをクリック
5. 以下のログを確認：

```
🔵 Redirect URL: https://kimochislider.vercel.app/auth/callback
🟢 OAuth URL: https://qrypddarrakhckzifaqe.supabase.co/auth/v1/authorize?...
🟢 - Redirect_to param (decoded): https://kimochislider.vercel.app/auth/callback
🟢 - Redirect URLs match: true
```

### ステップ3: Networkタブで確認

1. 開発者ツールの「Network」タブを開く
2. Googleログインボタンをクリック
3. `auth/v1/authorize`へのリクエストを確認
4. ステータスコードが404になっていないか確認

## まだ解決しない場合

### 1. Supabase Dashboardの設定を完全にリセット

1. 「Redirect URLs」の**すべてのURLを削除**
2. 「Site URL」をクリア
3. 「Save」をクリック
4. **30秒待つ**
5. 方法1または方法2で再設定
6. 「Save」をクリック
7. **30秒待つ**

### 2. 別のブラウザで試す

- Chrome、Firefox、Edgeなどで試す
- シークレットモードで試す

### 3. Supabaseのサポートに問い合わせ

1. Supabase Dashboard → Support
2. エラーの詳細を共有：
   - エラーID: `hnd1::vsjkx-1768034769731-5ff18e5e424c`
   - コンソールログ
   - Redirect URL: `https://kimochislider.vercel.app/auth/callback`

## 確認チェックリスト

- [ ] Supabase Dashboardで「Redirect URLs」にワイルドカードパターン（`https://kimochislider.vercel.app/**`）または正確なURL（`https://kimochislider.vercel.app/auth/callback`）が登録されている
- [ ] Supabase Dashboardで「Site URL」が設定されている
- [ ] Supabase DashboardでGoogle Providerが有効化されている
- [ ] Vercel Dashboardで`NEXT_PUBLIC_SUPABASE_URL`が正しい
- [ ] Vercel Dashboardで`NEXT_PUBLIC_SUPABASE_ANON_KEY`が設定されている
- [ ] 設定後、30秒待った
- [ ] ブラウザのキャッシュをクリアした
- [ ] 別のブラウザで試した
