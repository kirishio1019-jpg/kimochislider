# Gitの基本とアップロード方法

「Gitにコミットしてプッシュ」とは、簡単に言うと**あなたのコードを保存して、オンライン（GitHub）にアップロードする**ことです。

## 📚 Gitとは？

Gitは、プログラムのコードを管理するためのツールです。以下のような機能があります：

- **バージョン管理**: 変更履歴を保存できる
- **バックアップ**: コードを安全に保存できる
- **共同作業**: 他の人と一緒に開発できる
- **公開**: インターネット上に公開できる

## 🔄 基本的な流れ

```
1. コードを書く（あなたのPC上）
   ↓
2. コミット（変更を記録）
   ↓
3. プッシュ（GitHubにアップロード）
   ↓
4. Vercelが自動的にデプロイ
```

## 📝 用語の説明

### コミット（Commit）
- **意味**: コードの変更を「保存」すること
- **例**: 「今日はレビュー機能を追加した」という変更を記録する
- **イメージ**: 写真を撮るような感じ（スナップショット）

### プッシュ（Push）
- **意味**: コミットした変更をGitHubに「アップロード」すること
- **例**: ローカルの変更をインターネット上のGitHubに送る
- **イメージ**: 写真をクラウドにアップロードする感じ

### リポジトリ（Repository / Repo）
- **意味**: プロジェクトのコードが保存される場所
- **例**: GitHub上に「sappy-study-abroad」というリポジトリを作る
- **イメージ**: プロジェクトのフォルダーのようなもの

## 🚀 実際の手順（簡単版）

### ステップ1: GitHubでリポジトリを作成

1. https://github.com/new にアクセス
2. リポジトリ名を入力（例：`sappy-study-abroad`）
3. 「Public」または「Private」を選択
4. **「Initialize this repository with a README」はチェックしないでください**（既にファイルがあるため）
5. 「Create repository」をクリック

### ステップ2: あなたのPCでGitを初期化（初回のみ）

ターミナル（PowerShell）で以下のコマンドを実行：

```powershell
# プロジェクトフォルダーに移動
cd C:\Users\kiris\.cursor\study-abroad-comparison

# Gitを初期化
git init

# すべてのファイルを追加
git add .

# 最初のコミット（変更を記録）
git commit -m "Initial commit: Sappy - Study Abroad Platform"

# GitHubに接続（YOUR_USERNAMEとYOUR_REPO_NAMEを実際の値に置き換える）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# メインブランチに設定
git branch -M main

# GitHubにプッシュ（アップロード）
git push -u origin main
```

### ステップ3: 認証

GitHubにプッシュする際、ユーザー名とパスワード（またはトークン）の入力を求められます。

- **ユーザー名**: GitHubのユーザー名
- **パスワード**: GitHubのパーソナルアクセストークン（通常のパスワードでは動作しません）

パーソナルアクセストークンの作成方法：
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 「Generate new token (classic)」をクリック
3. 「repo」にチェックを入れる
4. トークンをコピー（後で見れないので注意！）
5. このトークンをパスワードとして使用

## 💡 コマンドの説明

| コマンド | 意味 | いつ使う |
|---------|------|---------|
| `git init` | Gitを初期化 | 初回のみ |
| `git add .` | すべてのファイルを追加 | 変更をコミットする前 |
| `git commit -m "メッセージ"` | 変更を記録 | 変更を保存したい時 |
| `git push` | GitHubにアップロード | 変更を公開したい時 |
| `git status` | 現在の状態を確認 | いつでも |

## 🔍 確認方法

```powershell
# Gitの状態を確認
git status

# コミット履歴を見る
git log

# リモート（GitHub）の接続を確認
git remote -v
```

## 🆘 よくある問題

### Q: "git is not recognized" というエラーが出る
A: Gitがインストールされていません。https://git-scm.com/download/win からインストールしてください。

### Q: コミットしようとしたら "Please tell me who you are" と出る
A: 以下のコマンドでGitにあなたの情報を設定してください：
```powershell
git config --global user.name "あなたの名前"
git config --global user.email "your.email@example.com"
```

### Q: プッシュするときに認証エラーが出る
A: パーソナルアクセストークンを使用しているか確認してください。通常のパスワードでは動作しません。

## 🎯 まとめ

1. **コミット** = 変更を記録（ローカル）
2. **プッシュ** = 変更をアップロード（GitHubへ）
3. 一度プッシュすれば、Vercelが自動的にデプロイします

最初は少し難しいかもしれませんが、何度かやると慣れます！


