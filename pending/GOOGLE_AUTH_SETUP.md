# Google認証の設定手順

Googleログイン機能を使用するには、Supabase DashboardでGoogle OAuthプロバイダーを設定する必要があります。

## 📋 全体の流れ

1. **Google Cloud Console**でOAuth認証情報を作成（Client IDとClient Secretを取得）
2. **Supabase Dashboard**でGoogleプロバイダーを有効化（Client IDとClient Secretを設定）
3. **リダイレクトURL**を確認・設定（開発環境用のみでOK）
4. **データベーススキーマ**を更新（user_idカラムを追加）
5. **動作確認**
6. **本番環境用の設定**（アプリをデプロイした後で追加）

**注意**: 本番環境のURLはまだわからなくても大丈夫です。開発環境用の設定だけで動作確認できます。

---

## 🔍 SupabaseのProject URLを確認する方法

Google Cloud Consoleで設定する前に、SupabaseのProject URLを確認してください：

1. Supabase Dashboardにアクセス
2. 左側メニューから「Settings」→「API」をクリック
3. 「Project URL」を確認（例: `https://abcdefghijklmnop.supabase.co`）
4. このURLの`abcdefghijklmnop`の部分が`<your-project-ref>`です

---

## 1. Google Cloud ConsoleでOAuth認証情報を作成

### ステップ1: Google Cloud Consoleにアクセス
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. Googleアカウントでログイン（まだアカウントがない場合は作成）
3. プロジェクトを選択（または新規作成）
   - 画面上部のプロジェクト選択ドロップダウンをクリック
   - 「新しいプロジェクト」をクリックして作成するか、既存のプロジェクトを選択

### ステップ2: OAuth同意画面を設定

**重要**: OAuth 2.0 クライアントIDを作成する前に、OAuth同意画面の設定が必要です。

1. **左側のハンバーガーメニュー（☰）をクリック**
2. **「APIとサービス」を選択**
3. **「OAuth同意画面」をクリック**

4. **ユーザータイプを選択**
   - **外部**を選択（一般公開アプリの場合）
   - または **内部**を選択（Google Workspace内でのみ使用する場合）
   - 「作成」をクリック

5. **アプリ情報を入力**
   - **アプリ名**: 「きもちスライダー」（任意の名前でOK）
   - **ユーザーサポートメール**: あなたのメールアドレスを選択
   - **アプリのロゴ**: （任意、スキップ可）
   - **アプリのホームページ**: （任意、スキップ可）
   - **アプリのプライバシーポリシーリンク**: （任意、スキップ可）
   - **アプリの利用規約リンク**: （任意、スキップ可）
   - **承認済みのドメイン**: （任意、スキップ可）
   - **デベロッパーの連絡先情報**: あなたのメールアドレスを入力（必須）
   - **保存して次へ**をクリック

6. **スコープ画面**
   - デフォルトのままでOK（特に変更不要）
   - **保存して次へ**をクリック

7. **テストユーザー画面**
   - 開発中は、自分のメールアドレスを追加（任意）
   - またはそのまま**保存して次へ**をクリック

8. **概要画面**
   - 設定内容を確認
   - **ダッシュボードに戻る**をクリック

### ステップ3: OAuth 2.0 クライアントIDを作成

1. **左側のハンバーガーメニュー（☰）をクリック**
2. **「APIとサービス」→「認証情報」を選択**

3. **画面上部の「+ 認証情報を作成」ボタンをクリック**
4. **「OAuth 2.0 クライアントID」を選択**

5. **アプリケーションの種類を選択**
   - **「ウェブアプリケーション」**を選択
   - 「作成」をクリック

6. **OAuth 2.0 クライアントIDの作成画面で以下を入力**

   **名前**: 「きもちスライダー」（任意の名前でOK）

   **承認済みのJavaScript生成元**:
   - 「+ URIを追加」をクリック
   - 以下を1つずつ追加：
     ```
     https://<your-project-ref>.supabase.co
     ```
     （`<your-project-ref>`は、Supabase Dashboardの「Settings」→「API」で確認できる「Project URL」の部分）
   - 開発環境用に以下も追加：
     ```
     http://localhost:3000
     ```

   **承認済みのリダイレクトURI**:
   - 「+ URIを追加」をクリック
   - 以下を1つずつ追加（**重要**: `/v1/`を含めること）：
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
     （`<your-project-ref>`は上記と同じ）
     ⚠️ **注意**: `/auth/v1/callback` の `/v1/` を忘れないでください！
   - 開発環境用に以下も追加：
     ```
     http://localhost:3000/auth/callback
     ```
   
   **確認ポイント**:
   - リダイレクトURIは**完全一致**する必要があります
   - 末尾にスラッシュ（`/`）を付けないでください
   - `https://` と `http://` は別物として扱われます

7. **「作成」ボタンをクリック**

8. **Client IDとClient Secretをコピー**
   - ポップアップウィンドウが表示されます
   - **Client ID**（長い文字列）をコピー
   - **Client Secret**（長い文字列）をコピー
   - ⚠️ **重要**: Client Secretはこの画面でしか表示されないため、必ずコピーして安全な場所に保存してください
   - 「OK」をクリックして閉じる

**補足**: 後でClient IDやClient Secretを確認したい場合は、「認証情報」ページの一覧から該当のOAuth 2.0 クライアントIDをクリックすると確認できます（Client Secretは再表示されませんが、再生成は可能です）。

## 2. Supabase DashboardでGoogleプロバイダーを設定

### ステップ1: Supabase Dashboardにアクセス
1. [Supabase Dashboard](https://app.supabase.com/)にアクセス
2. プロジェクトを選択

### ステップ2: Authentication設定を開く
1. 左側メニューから「Authentication」をクリック
2. 「Providers」タブをクリック

### ステップ3: Googleプロバイダーを有効化
1. プロバイダー一覧から「Google」を探す（アルファベット順でGのあたり）
2. 「Google」の行をクリック（または右側の「編集」ボタンをクリック）

3. **「Enable Google provider」トグルスイッチをONにする**
   - トグルがONになると、入力フィールドが表示されます

4. **以下の情報を入力**：
   - **Client ID (for OAuth)**: 
     - Google Cloud ConsoleでコピーしたClient IDを貼り付け
     - 例: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
   - **Client Secret (for OAuth)**: 
     - Google Cloud ConsoleでコピーしたClient Secretを貼り付け
     - 例: `GOCSPX-abcdefghijklmnopqrstuvwxyz`

5. **「Save」ボタンをクリック**
   - 保存が成功すると、緑色の成功メッセージが表示されます

## 3. リダイレクトURLの確認

Supabase Dashboardの「Authentication」→「URL Configuration」で、以下が設定されていることを確認してください：

1. **「Authentication」メニューを開く**
2. **「URL Configuration」タブをクリック**

3. **Site URL**を確認・設定：
   - 現在は開発環境用に `http://localhost:3000` が設定されているはずです
   - これで問題ありません（本番環境のURLは後で設定できます）
   - 必要に応じて編集して「Save」をクリック

4. **Redirect URLs**を確認・追加：
   - リストに `http://localhost:3000/auth/callback` が含まれているか確認
   - **含まれていない場合**:
     - リストの下にある入力フィールドに `http://localhost:3000/auth/callback` を入力
     - 「Add URL」ボタンまたは「+」ボタンをクリック
     - または、リストの下に「Add redirect URL」というリンクがある場合はそれをクリック
   - 「Save」ボタンをクリックして保存

**重要**: 
- 開発環境では `http://localhost:3000/auth/callback` があればOKです
- 本番環境のURLは、アプリをデプロイした後で追加すれば大丈夫です
- Google Cloud Consoleで設定したリダイレクトURIと、ここで設定するRedirect URLsは異なります：
  - Google Cloud Console: `https://<your-project-ref>.supabase.co/auth/v1/callback`（Supabaseが処理）
  - Supabase Dashboard: `http://localhost:3000/auth/callback`（あなたのアプリが処理）

**もし「Add URL」ボタンが見つからない場合**:
- Supabase DashboardのUIが更新されている可能性があります
- その場合は、`http://localhost:3000/auth/callback` が既にデフォルトで含まれている可能性が高いです
- そのまま進めて、動作確認で問題があれば後で追加してください

## 4. データベーススキーマの更新

Supabase DashboardのSQL Editorで、以下のSQLを実行してください：

1. **Supabase Dashboardの左側メニューから「SQL Editor」をクリック**
2. **「New query」をクリック**
3. **以下のSQLをコピー＆ペースト**：

```sql
-- add-user-auth.sql の内容を実行
ALTER TABLE events ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE POLICY "Users can manage their own events" ON events
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

4. **「Run」ボタン（またはCtrl+Enter）をクリック**
5. **成功メッセージが表示されることを確認**

## 5. 動作確認

1. **アプリを起動**
   ```bash
   npm run dev
   ```
   - `http://localhost:3000` でアプリが起動することを確認

2. **Googleログインをテスト**
   - ホーム画面右上の「Googleでログイン」ボタンをクリック
   - Googleアカウント選択画面が表示されることを確認
   - Googleアカウントでログイン
   - マイページ（`/my-events`）にリダイレクトされることを確認

3. **エラーが出た場合**
   - ブラウザのコンソール（F12キー）でエラーを確認
   - 上記の「トラブルシューティング」セクションを参照

## 6. 本番環境用の設定（後で設定）

アプリをデプロイした後、以下の設定を追加してください：

### Google Cloud Consoleで追加
1. Google Cloud Consoleの「認証情報」→ 作成したOAuth 2.0 クライアントIDをクリック
2. 「承認済みのJavaScript生成元」に本番URLを追加：
   - `https://your-domain.com`（あなたの本番URL）
3. 「承認済みのリダイレクトURI」に本番URLを追加：
   - `https://your-domain.com/auth/callback`
4. 「保存」をクリック

### Supabase Dashboardで追加
1. 「Authentication」→「URL Configuration」を開く
2. 「Site URL」を本番URLに変更（または開発用と本番用を両方使う場合は、開発用のままでもOK）
3. 「Redirect URLs」に `https://your-domain.com/auth/callback` を追加
4. 「Save」をクリック

## トラブルシューティング

### エラー: "Unsupported provider: missing OAuth secret"
- **原因**: Supabase DashboardでGoogle OAuthのClient Secretが設定されていない
- **解決策**: 上記の「ステップ3: Googleプロバイダーを有効化」を確認し、Client Secretが正しく入力されているか確認してください

### エラー: "redirect_uri_mismatch"（エラー 400）

**原因**: Google Cloud Consoleで設定したリダイレクトURIと、Supabaseが実際に使用しているリダイレクトURIが一致していません。

**解決策（ステップバイステップ）**:

1. **SupabaseのProject URLを確認**
   - Supabase Dashboard → Settings → API
   - 「Project URL」を確認（例: `https://abcdefghijklmnop.supabase.co`）
   - `abcdefghijklmnop`の部分をメモ

2. **Google Cloud ConsoleでリダイレクトURIを確認・追加**
   - [Google Cloud Console](https://console.cloud.google.com/)にアクセス
   - 「APIとサービス」→「認証情報」を開く
   - 作成したOAuth 2.0 クライアントIDをクリック
   - 「承認済みのリダイレクトURI」セクションを確認
   - **以下が含まれているか確認**（含まれていない場合は追加）：
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
     （`<your-project-ref>`は上記で確認した部分）
   - 開発環境用にも以下が含まれているか確認：
     ```
     http://localhost:3000/auth/callback
     ```
   - 「保存」をクリック

3. **エラーメッセージの詳細を確認する方法**
   - Googleのエラーページに「エラーの詳細」というリンクがある場合、それをクリック
   - または、ブラウザのアドレスバーに表示されているURLを確認
   - URLに`redirect_uri=...`というパラメータが含まれている場合、その値がGoogle Cloud Consoleに設定されているか確認

4. **よくある間違い**
   - ❌ `https://<your-project-ref>.supabase.co/auth/callback`（`/v1/`が抜けている）
   - ✅ `https://<your-project-ref>.supabase.co/auth/v1/callback`（正しい）
   - ❌ 末尾にスラッシュがある: `https://.../auth/v1/callback/`
   - ✅ 末尾にスラッシュなし: `https://.../auth/v1/callback`

5. **設定後、数分待つ**
   - Google Cloud Consoleの設定変更が反映されるまで、数分かかる場合があります
   - 5分程度待ってから再度ログインを試してください

6. **それでも解決しない場合**
   - Supabase Dashboard → Authentication → URL Configuration
   - 「Site URL」が `http://localhost:3000` になっているか確認
   - ブラウザのコンソール（F12）でエラーの詳細を確認

### ログイン後、リダイレクトされない
- **原因**: `/auth/callback` ルートが正しく動作していない可能性
- **解決策**: ブラウザのコンソールでエラーを確認し、`app/auth/callback/route.ts`が正しく作成されているか確認してください
