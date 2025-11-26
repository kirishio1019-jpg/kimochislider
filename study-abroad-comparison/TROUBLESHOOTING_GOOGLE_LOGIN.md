# Googleログインエラーの解決方法

## エラー: "Unsupported provider: provider is not enabled"

このエラーは、SupabaseでGoogle認証プロバイダーが有効になっていない場合に発生します。

### 解決手順

#### ステップ1: SupabaseでGoogle認証を有効化する

1. **Supabaseダッシュボードにログイン**
   - https://supabase.com/dashboard にアクセス
   - あなたのプロジェクトを選択

2. **Authentication設定に移動**
   - 左側のサイドバーから「🔐 Authentication」をクリック
   - 「Providers」タブをクリック

3. **Googleプロバイダーを確認**
   - リストの中から「Google」を探す
   - 「Google」の行をクリック

4. **Google認証を有効化**
   - 「Enable Google provider」スイッチが**ON**になっているか確認
   - OFFの場合は、ONに切り替える

5. **Google認証情報を入力**
   - **Client ID (for OAuth)**: Google Cloud Consoleで作成したOAuth 2.0 Client ID
   - **Client Secret (for OAuth)**: Google Cloud Consoleで作成したOAuth 2.0 Client Secret

   ⚠️ **重要**: 
   - Client IDとClient Secretは、Google Cloud Consoleで作成したものを使用してください
   - これらの値が正しく入力されていないと、認証が失敗します

6. **保存**
   - 「Save」ボタンをクリック
   - 設定が保存されるまで数秒待つ

#### ステップ2: Google Cloud Consoleの設定を確認する

1. **Google Cloud Consoleにアクセス**
   - https://console.cloud.google.com/ にアクセス

2. **認証情報を確認**
   - 左側メニュー → 「APIとサービス」→ 「認証情報」
   - 作成したOAuth 2.0 Client IDをクリック

3. **リダイレクトURIを確認**
   - 「承認済みのリダイレクト URI」セクションを確認
   - 以下のURIが含まれていることを確認：
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
     ※ `your-project-ref` の部分をあなたのSupabaseプロジェクトURLに置き換えてください

   - もし含まれていない場合は、「URIを追加」をクリックして追加してください

#### ステップ3: アプリを再起動する

環境変数の設定が完了している場合でも、設定を反映させるためにアプリを再起動してください：

```bash
# 開発サーバーを停止（Ctrl + C）
# その後、再起動
npm run dev
```

#### ステップ4: ブラウザのキャッシュをクリア

1. ブラウザで `Ctrl + Shift + Delete` を押す
2. キャッシュされた画像とファイルを選択
3. 「データを消去」をクリック
4. ブラウザをリロード（`Ctrl + F5`）

### 確認チェックリスト

- [ ] SupabaseダッシュボードでGoogleプロバイダーが有効になっている
- [ ] Google Client IDが正しく入力されている
- [ ] Google Client Secretが正しく入力されている
- [ ] Google Cloud ConsoleのリダイレクトURIにSupabaseのURLが含まれている
- [ ] `.env.local`ファイルに正しいSupabase認証情報が設定されている
- [ ] 開発サーバーを再起動した
- [ ] ブラウザのキャッシュをクリアした

### よくある問題

#### 問題1: Client IDやClient Secretが見つからない

**解決方法**:
1. Google Cloud Consoleにアクセス
2. 「APIとサービス」→「認証情報」
3. 作成したOAuth 2.0 Client IDを探す
4. 見つからない場合は、新規作成する必要があります
5. Client Secretは一度しか表示されないため、メモしていない場合は再作成が必要です

#### 問題2: リダイレクトURIが間違っている

**解決方法**:
- SupabaseのProject URLを確認（Settings → API → Project URL）
- リダイレクトURIは以下の形式である必要があります：
  ```
  https://[your-project-ref].supabase.co/auth/v1/callback
  ```
- 末尾の `/auth/v1/callback` を忘れずに！

#### 問題3: 保存したのに有効化されていない

**解決方法**:
1. Supabaseダッシュボードで再度確認
2. 「Save」ボタンをクリックした後、数秒待つ
3. ページをリロードして、設定が保存されているか確認
4. それでも解決しない場合は、一度OFFにしてから再度ONにする

### それでも解決しない場合

上記の手順をすべて試しても解決しない場合は、以下を確認してください：

1. **Supabaseダッシュボードのエラーログを確認**
   - Authentication → Logs でエラーログを確認

2. **ブラウザのコンソールでエラーを確認**
   - F12キーを押して開発者ツールを開く
   - Consoleタブでエラーメッセージを確認

3. **ネットワークタブでリクエストを確認**
   - 開発者ツールのNetworkタブで、認証リクエストが正しく送信されているか確認

4. **サポートに問い合わせ**
   - 詳細なエラーメッセージとスクリーンショットを持って、Supabaseのサポートに問い合わせる


