# redirect_uri_mismatch エラーのクイック修正ガイド

## 🔴 エラー内容
```
アクセスをブロック: このアプリのリクエストは無効です
エラー 400: redirect_uri_mismatch
```

## ✅ すぐに試す解決策

### ステップ1: SupabaseのProject URLを確認
1. Supabase Dashboardにアクセス
2. 左側メニュー → **Settings** → **API**
3. **Project URL**を確認（例: `https://abcdefghijklmnop.supabase.co`）
4. `abcdefghijklmnop`の部分をコピー

### ステップ2: Google Cloud ConsoleでリダイレクトURIを追加
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. **APIとサービス** → **認証情報**
3. 作成した**OAuth 2.0 クライアントID**をクリック
4. **承認済みのリダイレクトURI**セクションを確認
5. 以下のURIが**含まれているか確認**（含まれていない場合は追加）：

```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

**重要**: 
- `<your-project-ref>`を、ステップ1でコピーした値に置き換えてください
- `/v1/` を含めることを忘れないでください
- 末尾にスラッシュ（`/`）を付けないでください

### ステップ3: 保存して待つ
1. **保存**ボタンをクリック
2. **5分程度待つ**（設定が反映されるまで時間がかかることがあります）
3. 再度ログインを試す

## 🔍 確認方法

### 正しいリダイレクトURIの例
```
✅ https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

### 間違ったリダイレクトURIの例
```
❌ https://abcdefghijklmnop.supabase.co/auth/callback        （/v1/が抜けている）
❌ https://abcdefghijklmnop.supabase.co/auth/v1/callback/    （末尾にスラッシュ）
❌ http://abcdefghijklmnop.supabase.co/auth/v1/callback      （httpsではなくhttp）
```

## 📝 チェックリスト

- [ ] SupabaseのProject URLを確認した
- [ ] Google Cloud ConsoleでOAuth 2.0 クライアントIDを開いた
- [ ] 「承認済みのリダイレクトURI」に `https://<your-project-ref>.supabase.co/auth/v1/callback` を追加した
- [ ] `/v1/` を含めていることを確認した
- [ ] 末尾にスラッシュがないことを確認した
- [ ] 「保存」をクリックした
- [ ] 5分待った
- [ ] 再度ログインを試した

## 🆘 それでも解決しない場合

1. **ブラウザのコンソールでエラーを確認**
   - F12キーを押して開発者ツールを開く
   - Consoleタブでエラーメッセージを確認

2. **Supabase Dashboardの設定を確認**
   - Authentication → URL Configuration
   - Site URLが `http://localhost:3000` になっているか確認

3. **Google Cloud Consoleの設定を再確認**
   - 「承認済みのリダイレクトURI」に以下がすべて含まれているか確認：
     - `https://<your-project-ref>.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback`（開発環境用）

4. **ブラウザのキャッシュをクリア**
   - Ctrl+Shift+Delete（Windows）または Cmd+Shift+Delete（Mac）
   - キャッシュをクリアして再度試す
