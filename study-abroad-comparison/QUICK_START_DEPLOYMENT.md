# 🚀 アプリを公開する簡単な手順

## 概要

「Gitにコミットしてプッシュ」とは、**あなたのコードを保存して、インターネット上（GitHub）にアップロードする**ことです。

```
あなたのPC → GitHub（コード保存サイト）→ Vercel（公開サイト）
```

## 📋 準備

### 1. Gitのインストール（まだの場合）

1. https://git-scm.com/download/win にアクセス
2. 「Download for Windows」をクリック
3. インストーラーを実行（すべて「Next」でOK）
4. インストール後、PCを再起動

### 2. GitHubアカウントの準備

1. https://github.com にアクセス
2. アカウントを作成（まだの場合）

## 🎯 手順（3ステップ）

### ステップ1: GitHubでリポジトリを作成（5分）

1. https://github.com/new にアクセス
2. **Repository name**: `sappy-study-abroad`（好きな名前でOK）
3. **Public** または **Private** を選択
4. **「Add a README file」や「Add .gitignore」はチェックしない**
5. 「Create repository」をクリック

作成後、GitHubに「Quick setup」のページが表示されます。このページのURLをコピーしておいてください（例：`https://github.com/your-username/sappy-study-abroad.git`）

### ステップ2: コードをGitHubにアップロード（10分）

#### 方法A: VS Code（Cursor）を使う方法（簡単）

1. Cursor（またはVS Code）でプロジェクトフォルダーを開く
2. 左側のソース管理アイコン（📊）をクリック
3. 「Publish to GitHub」ボタンをクリック
4. 指示に従って認証
5. リポジトリ名を入力して公開

#### 方法B: コマンドラインを使う方法

**PowerShell**（またはコマンドプロンプト）を開いて、以下を実行：

```powershell
# 1. プロジェクトフォルダーに移動
cd C:\Users\kiris\.cursor\study-abroad-comparison

# 2. Gitを初期化（初回のみ）
git init

# 3. すべてのファイルを追加
git add .

# 4. 変更を記録（コミット）
git commit -m "Initial commit: Sappy Study Abroad Platform"

# 5. GitHubに接続（YOUR_USERNAMEとREPO_NAMEを実際の値に置き換える）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 6. メインブランチに設定
git branch -M main

# 7. GitHubにアップロード（プッシュ）
git push -u origin main
```

**注意**: `git push`を実行すると、ユーザー名とパスワード（トークン）を求められます。

- **ユーザー名**: GitHubのユーザー名
- **パスワード**: GitHubの**パーソナルアクセストークン**（通常のパスワードではありません）

#### パーソナルアクセストークンの取得方法

1. GitHub → 右上のアイコン → **Settings**
2. 左下の **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token (classic)**
5. **Note**: 「Sappy deployment」など好きな名前
6. **Expiration**: 90 days（または No expiration）
7. **Select scopes**: ✅ **repo** にチェック
8. **Generate token** をクリック
9. 表示されたトークンを**コピー**（後で見れないので注意！）
10. このトークンを`git push`のパスワードとして使用

### ステップ3: Vercelで公開（5分）

1. https://vercel.com/signup にアクセス
2. **「Continue with GitHub」**をクリック
3. GitHubアカウントでログイン
4. **「Add New...」** → **「Project」**をクリック
5. 作成したリポジトリ（`sappy-study-abroad`）を選択
6. **「Import」**をクリック
7. 設定を確認（そのままでOK）
8. **「Deploy」**をクリック
9. 数分待つと公開完了！

公開されたURLが表示されます（例：`https://sappy-study-abroad.vercel.app`）

## 🔐 環境変数の設定（Supabaseを使用する場合）

Vercelでデプロイした後、Supabaseの環境変数を設定：

1. Vercelのプロジェクトページで **Settings** → **Environment Variables**
2. 以下を追加：
   - `NEXT_PUBLIC_SUPABASE_URL`: あなたのSupabaseプロジェクトURL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: あなたのSupabase Anon Key
3. **Save** をクリック
4. **「Redeploy」**をクリック

## ✅ 確認事項

- [ ] GitHubにコードがアップロードされている
- [ ] Vercelでデプロイが完了している
- [ ] アプリが正常に表示される
- [ ] 環境変数が設定されている（Supabase使用時）

## 🔄 今後の更新方法

コードを変更したら：

1. **コミット**（変更を記録）
   ```powershell
   git add .
   git commit -m "変更内容の説明"
   ```

2. **プッシュ**（GitHubにアップロード）
   ```powershell
   git push
   ```

3. **Vercelが自動的に再デプロイ**されます（数分待つ）

## 💡 ヒント

- コミットメッセージは分かりやすく（例：「レビューフォームを修正」）
- 定期的にプッシュしてバックアップを取る
- 問題が起きたら `git status` で状態を確認

## 🆘 困った時は

- **Gitがインストールされていない**: https://git-scm.com/download/win
- **認証エラー**: パーソナルアクセストークンを使用しているか確認
- **コミットエラー**: `git config`でユーザー名とメールを設定
- **プッシュエラー**: GitHubのリポジトリが正しく作成されているか確認

詳細は `GIT_BASICS.md` を参照してください。


