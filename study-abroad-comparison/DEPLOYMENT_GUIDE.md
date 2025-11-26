# アプリ公開ガイド

このアプリを公開するための手順を説明します。最も簡単な方法は**Vercel**を使用することです（無料で利用可能）。

## 🚀 Vercelにデプロイする方法

### 前提条件

1. **GitHubアカウント**を持っていること
2. **Vercelアカウント**（GitHubアカウントで簡単に作成可能）
3. **Supabaseアカウント**（Googleログイン機能を使用する場合）

### 手順1: プロジェクトをGitHubにプッシュ

1. **GitHubで新しいリポジトリを作成**
   - https://github.com/new にアクセス
   - リポジトリ名を入力（例：`sappy-study-abroad`）
   - 「Public」または「Private」を選択
   - 「Create repository」をクリック

2. **ローカルでGitを初期化（まだの場合）**
   ```bash
   cd study-abroad-comparison
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **GitHubにプッシュ**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
   （`YOUR_USERNAME`と`YOUR_REPO_NAME`を実際の値に置き換えてください）

### 手順2: Vercelにデプロイ

1. **Vercelにサインアップ**
   - https://vercel.com/signup にアクセス
   - 「Continue with GitHub」をクリックしてGitHubアカウントでサインアップ

2. **プロジェクトをインポート**
   - Vercelダッシュボードで「Add New...」→「Project」をクリック
   - 先ほど作成したGitHubリポジトリを選択
   - 「Import」をクリック

3. **プロジェクト設定**
   - **Framework Preset**: Next.js（自動検出されるはず）
   - **Root Directory**: `./`（そのまま）
   - **Build Command**: `npm run build`（デフォルト）
   - **Output Directory**: `.next`（デフォルト）
   - **Install Command**: `npm install`（デフォルト）

### 手順3: 環境変数の設定（Supabaseを使用する場合）

1. **Vercelのプロジェクト設定ページで環境変数を追加**
   - プロジェクトページで「Settings」→「Environment Variables」をクリック
   - 以下の環境変数を追加：

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **SupabaseのリダイレクトURLを更新**
   - Supabaseダッシュボードで「Authentication」→「URL Configuration」を開く
   - 「Redirect URLs」に以下を追加：
     ```
     https://your-project-name.vercel.app/auth/callback
     ```
   - （実際のVercelのURLに置き換えてください）

3. **Google OAuth設定も更新（Googleログインを使用する場合）**
   - Google Cloud Consoleで「認証済みのリダイレクト URI」に以下を追加：
     ```
     https://your-supabase-project-ref.supabase.co/auth/v1/callback
     ```

### 手順4: デプロイ

1. **「Deploy」ボタンをクリック**
   - Vercelが自動的にビルドとデプロイを開始します
   - 数分待つとデプロイが完了します

2. **デプロイ完了後**
   - 自動的に生成されたURL（例：`https://your-project-name.vercel.app`）でアプリにアクセスできます
   - カスタムドメインも設定可能です（Settings → Domains）

## 🔒 重要な注意事項

### 1. 環境変数の管理
- **`.env.local`ファイルはGitHubにプッシュしないでください**
- 環境変数は必ずVercelの設定から追加してください
- `.gitignore`に`.env.local`が含まれていることを確認してください

### 2. Supabaseの設定
- 本番環境用のSupabaseプロジェクトを使用することをお勧めします
- 開発用と本番用で別々のSupabaseプロジェクトを作成することも可能です

### 3. ローカルストレージの制限
- 現在、データはブラウザの`localStorage`に保存されています
- これは各ユーザーのブラウザにのみ保存されるため、他のデバイスでは見えません
- 将来的にSupabaseのデータベースに移行することを検討してください

## 📝 デプロイ後の確認事項

- [ ] アプリが正常に表示される
- [ ] レビューの投稿・編集・削除が動作する
- [ ] Googleログインが動作する（設定した場合）
- [ ] モバイル端末でも正常に表示される
- [ ] ページの読み込み速度を確認

## 🔄 今後の更新方法

コードを更新したら、以下の手順で再デプロイされます：

1. 変更をコミット
   ```bash
   git add .
   git commit -m "Update description"
   ```

2. GitHubにプッシュ
   ```bash
   git push
   ```

3. Vercelが自動的に再デプロイを開始します

## 🌐 カスタムドメインの設定（オプション）

1. Vercelのプロジェクト設定で「Settings」→「Domains」を開く
2. ドメイン名を入力して「Add」をクリック
3. 表示されたDNS設定をドメインプロバイダーに追加

## 💡 その他のホスティングオプション

Vercel以外にも以下のサービスが利用可能です：

- **Netlify**: https://www.netlify.com/
- **Railway**: https://railway.app/
- **Render**: https://render.com/

ただし、Next.jsアプリにはVercelが最も最適化されています。

## 📚 参考資料

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)


