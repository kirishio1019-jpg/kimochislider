# リダイレクトURIエラーの解決方法

## エラー: "redirect_uri_mismatch"

このエラーは、Google Cloud Consoleで設定した「承認済みのリダイレクトURI」と、アプリが送信したリダイレクトURIが一致しない場合に発生します。

## 解決手順

### ステップ1: SupabaseのプロジェクトURLを確認

1. **Supabaseダッシュボードにアクセス**
   - https://supabase.com/dashboard にアクセス
   - あなたのプロジェクトを選択

2. **Project URLを確認**
   - 左サイドバー → 「⚙️ Settings」をクリック
   - 「API」をクリック
   - 「Project URL」をコピー
   - 例: `https://abcdefghijklmnop.supabase.co`

### ステップ2: Google Cloud ConsoleでリダイレクトURIを追加

1. **Google Cloud Consoleにアクセス**
   - https://console.cloud.google.com/ にアクセス
   - あなたのプロジェクトを選択

2. **認証情報を開く**
   - 左側メニュー → 「APIとサービス」→ 「認証情報」
   - 作成した「OAuth 2.0 クライアント ID」をクリック

3. **リダイレクトURIを追加**
   - 「承認済みのリダイレクト URI」セクションを確認
   - 「URIを追加」をクリック
   - 以下の形式でURIを追加：
     ```
     https://[your-project-ref].supabase.co/auth/v1/callback
     ```
   
   **例**:
   - SupabaseのProject URLが `https://abcdefghijklmnop.supabase.co` の場合
   - 追加するURI: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
   
   ⚠️ **重要ポイント**:
   - `[your-project-ref]` の部分を、ステップ1でコピーしたSupabaseのProject URLに置き換える
   - 末尾の `/auth/v1/callback` を忘れずに！
   - `https://` で始まる必要がある
   - 末尾にスラッシュ（`/`）を付けない

4. **保存**
   - 「保存」ボタンをクリック
   - 変更が保存されるまで数秒待つ

### ステップ3: 開発環境用のURIも追加（オプション）

ローカル開発環境でも動作させたい場合：

1. 同じ画面で「URIを追加」を再度クリック
2. 以下を追加：
   ```
   http://localhost:3000/auth/callback
   ```
   - これは開発環境用なので、本番環境だけを使う場合は不要です

### ステップ4: アプリを再起動

1. ブラウザでページをリロード（`Ctrl + F5`）
2. 再度「Googleでログイン」を試す

## リダイレクトURIの確認

### 正しい形式

✅ **正しい**:
```
https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

❌ **間違い**:
```
https://abcdefghijklmnop.supabase.co/auth/v1/callback/  ← 末尾にスラッシュ
https://abcdefghijklmnop.supabase.co/auth/callback     ← /v1/ がない
http://abcdefghijklmnop.supabase.co/auth/v1/callback   ← http:// ではなく https://
```

## トラブルシューティング

### 問題1: リダイレクトURIを追加してもエラーが続く

**解決方法**:
1. ブラウザのキャッシュをクリア（`Ctrl + Shift + Delete`）
2. ブラウザを完全に閉じて、再度開く
3. 数分待ってから再度試す（設定の反映に時間がかかることがある）

### 問題2: どのURIを追加すればいいかわからない

**解決方法**:
1. Supabaseダッシュボード → Settings → API → Project URL を確認
2. そのURLに `/auth/v1/callback` を追加
3. 例: Project URLが `https://abc123.supabase.co` なら、`https://abc123.supabase.co/auth/v1/callback` を追加

### 問題3: 複数のSupabaseプロジェクトがある

**解決方法**:
- 現在使用しているプロジェクトのURLを確認
- `.env.local`ファイルの `NEXT_PUBLIC_SUPABASE_URL` の値を確認
- そのURLに対応するリダイレクトURIを追加

## 確認チェックリスト

設定を確認するためのチェックリスト：

- [ ] SupabaseのProject URLを確認した
- [ ] Google Cloud ConsoleでOAuth 2.0 Client IDを開いた
- [ ] 「承認済みのリダイレクト URI」に以下を追加した：
  - [ ] `https://[your-project-ref].supabase.co/auth/v1/callback`
  - [ ] （オプション）`http://localhost:3000/auth/callback`
- [ ] 「保存」ボタンをクリックした
- [ ] ブラウザをリロードした
- [ ] 再度ログインを試した

## 完了！

これらの手順を完了すれば、`redirect_uri_mismatch`エラーは解決するはずです。

それでも問題が続く場合は、以下を確認してください：
1. リダイレクトURIが正確に一致しているか（スペースやタイプミスがないか）
2. Google Cloud Consoleで変更が保存されているか
3. 正しいSupabaseプロジェクトを使用しているか


