# 環境変数設定の詳細ガイド

このガイドでは、環境変数を実際に設定する手順を画面の操作とともに詳しく説明します。

## ステップ1: Supabaseの認証情報を取得する

### 1-1. Supabaseにアクセスしてアカウント作成

1. ブラウザで https://supabase.com/ を開く
2. 右上の「Start your project」または「Sign in」をクリック
3. GitHubアカウントでサインインするか、メールアドレスでアカウント作成

### 1-2. 新しいプロジェクトを作成

1. ログイン後、ダッシュボードが表示されます
2. 左上の「New Project」ボタンをクリック
3. プロジェクト情報を入力：
   - **Name**: 任意の名前（例: `local-spots-map`）
   - **Database Password**: データベースのパスワードを設定（忘れないようにメモ！）
   - **Region**: 日本なら「Northeast Asia (Tokyo)」を選択
4. 「Create new project」ボタンをクリック
5. プロジェクトの作成が完了するまで2-3分待ちます（「Setting up your project...」と表示されます）

### 1-3. API認証情報を取得

プロジェクトが作成されたら：

1. **左側のメニュー**から「Settings」（歯車アイコン）をクリック
2. 設定メニューが開いたら、左側の「**API**」をクリック
3. API設定ページが表示されます
4. 以下の2つの値をコピーします：

   **① Project URL**
   - 「Project URL」というセクションがあります
   - その下に表示されているURL（例: `https://xxxxxxxxxxxxx.supabase.co`）をコピー
   - この値が `NEXT_PUBLIC_SUPABASE_URL` になります

   **② anon public key**
   - 「Project API keys」というセクションがあります
   - その中に「**anon**」というラベルのあるキーがあります
   - 「anon」の右側にある「👁️」アイコンをクリックするとキーが表示されます
   - または「Copy」ボタンをクリックしてコピー
   - この値が `NEXT_PUBLIC_SUPABASE_ANON_KEY` になります

### 1-4. .env.localファイルに貼り付け

1. `local-spots-map`ディレクトリにある`.env.local`ファイルを開く（テキストエディタで）
2. 以下のように実際の値を貼り付けます：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MjM5MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **注意**: `your_supabase_project_url` と `your_supabase_anon_key` の部分を、実際にコピーした値に置き換えてください。

---

## ステップ2: Mapboxの認証情報を取得する

### 2-1. Mapboxにアクセスしてアカウント作成

1. ブラウザで https://www.mapbox.com/ を開く
2. 右上の「Sign up」をクリック
3. メールアドレス、パスワード、ユーザー名を入力してアカウント作成
4. メール認証が必要な場合は、メールを確認して認証を完了

### 2-2. Access Tokenを取得

1. ログイン後、右上のアカウントアイコン（人型アイコン）をクリック
2. メニューから「**Account**」をクリック
3. アカウントページが開きます
4. ページの下の方に「**Access tokens**」というセクションがあります
5. 「**Default public token**」という項目があります
   - このトークンは自動的に作成されています
   - トークンの右側に「**Copy**」ボタンがあるので、それをクリックしてコピー
   - または、トークン全体を選択してコピー（`pk.eyJ1IjoieHh4eHh4eHgiLCJhIjoiY2xxeHh4eHh4eHh4eCJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` のような形式）

### 2-3. .env.localファイルに貼り付け

`.env.local`ファイルに、コピーしたトークンを貼り付けます：

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieHh4eHh4eHgiLCJhIjoiY2xxeHh4eHh4eHh4eCJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **注意**: `your_mapbox_access_token` の部分を、実際にコピーしたトークンに置き換えてください。

---

## 完成した.env.localファイルの例

すべて設定が完了すると、`.env.local`ファイルは以下のようになります：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMn0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Mapbox設定
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieHh4eHh4eHgiLCJhIjoiY2xxeHh4eHh4eHh4eCJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **重要**: 
- 実際の値は長い文字列になります
- `=` の後ろにスペースを入れないでください
- 引用符（`"`や`'`）は不要です

---

## 設定の確認方法

設定が正しくできているか確認するには：

1. `.env.local`ファイルを開いて、3つの値がすべて設定されているか確認
2. 開発サーバーを起動: `npm run dev`
3. ブラウザで http://localhost:3000 を開く
4. ブラウザの開発者ツール（F12キー）を開いて「Console」タブを確認
5. エラーが出ていないか確認

もしエラーが出る場合は、`.env.local`ファイルの値が正しく設定されているか再度確認してください。











