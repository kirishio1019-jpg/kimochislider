# デプロイ手順

このアプリケーションを公開するための手順です。

## 前提条件

- Supabaseプロジェクトが作成済みであること
- ローカルの`.env.local`ファイルに環境変数が設定済みであること
- GitHubアカウントがあること（推奨）
- Vercelアカウントがあること（無料プランで利用可能）

**注意**: ローカルの`.env.local`ファイルはGitHubにプッシュされません（`.gitignore`で除外されています）。Vercelでデプロイする際は、Vercel Dashboardで環境変数を再度設定する必要があります。

## 1. Supabaseの設定確認

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. 左メニューから「Settings」→「API」をクリック
4. 以下の情報をメモ：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`に使用
   - **anon public** キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`に使用

## 2. データベーススキーマの適用

1. Supabase Dashboardで「SQL Editor」を開く
2. `supabase-schema.sql`の内容をコピーして実行
3. スキーマが正しく作成されたか確認

## 3. GitHubにリポジトリを作成（推奨）

**これらのコマンドは、PowerShellやコマンドプロンプトなどのターミナルで実行してください。**

### 手順

1. **ターミナルを開く**
   - Windows: PowerShell または コマンドプロンプト（cmd）
   - VS Codeを使用している場合: `Ctrl + @` でターミナルを開く

2. **プロジェクトディレクトリに移動**
   ```powershell
   cd c:\Users\kiris\.cursor\pending
   ```

3. **Gitリポジトリを初期化（まだの場合）**
   ```powershell
   git init
   ```

4. **ファイルをステージング**
   ```powershell
   git add .
   ```

5. **コミット**
   ```powershell
   git commit -m "Initial commit"
   ```

6. **GitHubでリポジトリを作成**
   - [GitHub](https://github.com/new)で新しいリポジトリを作成
   - リポジトリ名を入力（例: `kimochi-slider`）
   - 「Create repository」をクリック

7. **リモートリポジトリを追加してプッシュ**
   ```powershell
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```
   ⚠️ **重要**: `your-username`と`your-repo-name`を実際のGitHubユーザー名とリポジトリ名に置き換えてください

### 既にGitリポジトリが存在する場合

既にGitHubリポジトリが存在する場合は、以下のコマンドでプッシュできます：

```powershell
cd c:\Users\kiris\.cursor\pending
git add .
git commit -m "Update: デプロイ準備完了"
git push origin main
```

## 4. Vercelへのデプロイ

### 方法1: GitHub経由（推奨）

1. [Vercel](https://vercel.com)にアクセスしてログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリを選択（またはインポート）
4. プロジェクト設定：
   - **Framework Preset**: Next.js（自動検出されるはず）
   - **Root Directory**: `./`（そのまま）
   - **Build Command**: `npm run build`（デフォルト）
   - **Output Directory**: `.next`（デフォルト）
5. **Environment Variables**を設定：
   - `.env.local`ファイルに設定されている値をVercel Dashboardに入力してください
   ```
   NEXT_PUBLIC_SUPABASE_URL=（.env.localの値をコピー）
   NEXT_PUBLIC_SUPABASE_ANON_KEY=（.env.localの値をコピー）
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
   ```
   ⚠️ **重要**: 
   - `.env.local`ファイルの値をコピーして設定してください
   - `NEXT_PUBLIC_APP_URL`はデプロイ後にVercelが発行するURLに更新してください
6. 「Deploy」をクリック
7. デプロイ完了後、Vercelが発行したURLを確認
8. 環境変数の`NEXT_PUBLIC_APP_URL`を実際のURLに更新して再デプロイ

### 方法2: Vercel CLI経由

```bash
# Vercel CLIをインストール
npm i -g vercel

# プロジェクトディレクトリで実行
cd c:\Users\kiris\.cursor\pending
vercel

# 初回は設定を聞かれるので、以下を選択：
# - Set up and deploy? Yes
# - Which scope? （アカウントを選択）
# - Link to existing project? No
# - Project name? （プロジェクト名を入力）
# - Directory? ./
# - Override settings? No

# 環境変数を設定
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_APP_URL

# 本番環境にデプロイ
vercel --prod
```

## 5. 環境変数の設定（Vercel Dashboard）

デプロイ後、Vercel Dashboardで環境変数を確認・更新：

1. Vercel Dashboardでプロジェクトを選択
2. 「Settings」→「Environment Variables」を開く
3. 以下の環境変数が設定されているか確認：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`（デプロイ後のURLに更新）

## 6. Supabaseの認証設定

Google認証を使用している場合、SupabaseでリダイレクトURLを設定：

1. Supabase Dashboardで「Authentication」→「URL Configuration」を開く
2. 「Redirect URLs」に以下を追加：
   ```
   https://your-app-name.vercel.app/auth/callback
   ```
3. 「Site URL」を更新：
   ```
   https://your-app-name.vercel.app
   ```

## 7. 動作確認

デプロイ後、以下を確認：

1. トップページが表示されるか
2. イベント作成が動作するか
3. イベントページが表示されるか
4. スライダーが動作するか
5. 回答が保存されるか

## トラブルシューティング

### ビルドエラーが発生する場合

1. ローカルでビルドを確認：
   ```bash
   npm run build
   ```
2. エラーメッセージを確認して修正
3. TypeScriptのエラーがないか確認：
   ```bash
   npx tsc --noEmit
   ```

### 環境変数が反映されない場合

1. Vercel Dashboardで環境変数が正しく設定されているか確認
2. 環境変数の値に余分なスペースや引用符がないか確認
3. 再デプロイを実行（環境変数変更後は再デプロイが必要）

### Supabase接続エラーが発生する場合

1. `NEXT_PUBLIC_SUPABASE_URL`と`NEXT_PUBLIC_SUPABASE_ANON_KEY`が正しいか確認
2. Supabaseプロジェクトがアクティブか確認
3. RLS（Row Level Security）ポリシーが正しく設定されているか確認

## カスタムドメインの設定（オプション）

Vercelでカスタムドメインを設定する場合：

1. Vercel Dashboardでプロジェクトを選択
2. 「Settings」→「Domains」を開く
3. ドメインを追加
4. DNS設定を指示に従って更新

## 継続的なデプロイ

GitHubリポジトリと連携している場合、`main`ブランチへのプッシュで自動的にデプロイされます。

## その他のデプロイプラットフォーム

### Netlify

1. Netlifyにログイン
2. 「Add new site」→「Import an existing project」
3. GitHubリポジトリを選択
4. ビルド設定：
   - Build command: `npm run build`
   - Publish directory: `.next`
5. 環境変数を設定
6. 「Deploy site」をクリック

### Railway

1. Railwayにログイン
2. 「New Project」→「Deploy from GitHub repo」
3. リポジトリを選択
4. 環境変数を設定
5. デプロイが自動的に開始されます

## セキュリティチェックリスト

- [ ] `.env.local`が`.gitignore`に含まれている
- [ ] 環境変数に機密情報が含まれていない
- [ ] SupabaseのRLSポリシーが適切に設定されている
- [ ] APIルートに適切な認証・認可が実装されている
