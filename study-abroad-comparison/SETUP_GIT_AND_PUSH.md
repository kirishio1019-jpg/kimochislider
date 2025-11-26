# GitのセットアップとGitHubへのプッシュ手順

## ⚠️ 現在の状況

Gitがインストールされていないようです。以下の手順で進めます。

## 方法1: Gitをインストールしてコマンドラインで実行

### ステップ1: Gitをインストール

1. https://git-scm.com/download/win にアクセス
2. 「Download for Windows」をクリック
3. インストーラーを実行
   - インストール中、すべて「Next」で進んで問題ありません
   - 特に変更する必要はありません
4. インストール完了後、**PCを再起動**してください

### ステップ2: Gitの設定

PowerShellを開いて、以下を実行：

```powershell
git config --global user.name "あなたの名前"
git config --global user.email "your.email@example.com"
```

（実際の名前とメールアドレスに置き換えてください）

### ステップ3: GitHubでリポジトリを作成

1. https://github.com/new にアクセス
2. **Repository name**: `sappy-study-abroad`（好きな名前でOK）
3. **Public** または **Private** を選択
4. **「Add a README file」や「Add .gitignore」はチェックしないでください**
5. 「Create repository」をクリック

### ステップ4: プロジェクトをGitHubにプッシュ

PowerShellを開いて、以下を実行：

```powershell
# プロジェクトフォルダーに移動
cd C:\Users\kiris\.cursor\study-abroad-comparison

# Gitを初期化
git init

# すべてのファイルを追加
git add .

# コミット（変更を記録）
git commit -m "Initial commit: Sappy Study Abroad Platform"

# GitHubに接続（YOUR_USERNAMEとREPO_NAMEを実際の値に置き換える）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# メインブランチに設定
git branch -M main

# GitHubにプッシュ
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
5. **Note**: 「Sappy deployment」など
6. **Expiration**: 90 days または No expiration
7. **Select scopes**: ✅ **repo** にチェック
8. **Generate token** をクリック
9. 表示されたトークンを**コピー**（後で見れないので注意！）
10. このトークンを`git push`のパスワードとして使用

---

## 方法2: GitHub Desktopを使う（GUIツール、簡単）

コマンドラインが苦手な場合、GitHub Desktopを使うと簡単です。

### ステップ1: GitHub Desktopをインストール

1. https://desktop.github.com/ にアクセス
2. 「Download for Windows」をクリック
3. インストーラーを実行

### ステップ2: GitHub Desktopでリポジトリを作成

1. GitHub Desktopを開く
2. 「Sign in to GitHub.com」でログイン
3. 「File」→「Add Local Repository」
4. 「Choose...」をクリックして `C:\Users\kiris\.cursor\study-abroad-comparison` を選択
5. 「Create a repository」をクリック
6. 「Publish repository」をクリック
7. リポジトリ名を入力して「Publish Repository」をクリック

これで完了です！

---

## 方法3: Cursor（VS Code）の統合機能を使う

CursorにはGit機能が組み込まれています。

### ステップ1: ソース管理パネルを開く

1. Cursorでプロジェクトを開く
2. 左側のソース管理アイコン（📊）をクリック
3. 「Initialize Repository」をクリック（初回のみ）

### ステップ2: GitHubに公開

1. ソース管理パネルで「Publish to GitHub」ボタンをクリック
2. 指示に従って認証
3. リポジトリ名を入力して公開

---

## どの方法を選ぶべき？

- **コマンドラインが好き**: 方法1（Gitインストール）
- **GUIツールが好き**: 方法2（GitHub Desktop）
- **Cursorを使い慣れている**: 方法3（Cursorの統合機能）

どの方法を選んでも結果は同じです！


