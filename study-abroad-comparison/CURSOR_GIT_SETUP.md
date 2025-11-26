# CursorでGitを初期化してGitHubにプッシュする手順

## 📋 事前準備

1. **GitHubアカウントを持っていること**
2. **GitHubでリポジトリを作成済みであること**（後述の手順で作成も可能）

---

## 🚀 手順

### ステップ1: GitHubでリポジトリを作成（まだの場合）

1. ブラウザで https://github.com/new にアクセス
2. **Repository name** を入力（例：`sappy-study-abroad`）
3. **Public** または **Private** を選択
4. ⚠️ **重要**: 以下のチェックボックスは**すべて外す**（チェックしない）
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
5. 「Create repository」をクリック

作成後、リポジトリのURLをコピーしておいてください（例：`https://github.com/your-username/sappy-study-abroad.git`）

---

### ステップ2: CursorでGitを初期化

1. **Cursorでプロジェクトを開く**
   - すでに開いている場合はOK

2. **ソース管理パネルを開く**
   - 左側のメニューバーで **📊（ソース管理）** アイコンをクリック
   - または `Ctrl + Shift + G` キーを押す

3. **リポジトリを初期化**
   - ソース管理パネルの上部に「Initialize Repository」ボタンが表示されます
   - クリックすると、`.git`フォルダーが作成され、Gitが初期化されます

---

### ステップ3: ファイルをステージング（追加）

1. **すべてのファイルを追加**
   - ソース管理パネルの「Changes」セクションに変更されたファイルが表示されます
   - 「+」アイコンの横にある「Stage All Changes」をクリック
   - または、各ファイルの横の「+」をクリックして個別に追加

---

### ステップ4: コミット（変更を記録）

1. **コミットメッセージを入力**
   - ソース管理パネルの上部にあるテキストボックスに、コミットメッセージを入力
   - 例：`Initial commit: Sappy Study Abroad Platform`

2. **コミットを実行**
   - `Ctrl + Enter` キーを押す
   - または、上部の「✓ Commit」ボタンをクリック

---

### ステップ5: GitHubに公開（プッシュ）

#### 方法A: 自動公開機能を使う（簡単）

1. **「Publish Branch」ボタンを探す**
   - コミット後、ソース管理パネルの上部に「Publish Branch」ボタンが表示されます
   - クリックしてください

2. **GitHubで認証**
   - 初回の場合、ブラウザが開いてGitHubでログインを求められます
   - 指示に従って認証してください

3. **リポジトリ名を入力**
   - リポジトリ名を入力（例：`sappy-study-abroad`）
   - 「Private」または「Public」を選択
   - 「Publish」をクリック

これで完了です！

#### 方法B: 既存のリポジトリに接続する場合

1. **リモートリポジトリを追加**
   - コマンドパレットを開く（`Ctrl + Shift + P`）
   - 「Git: Add Remote」と入力して選択
   - Remote name: `origin` と入力
   - Remote URL: 作成したGitHubリポジトリのURLを入力（例：`https://github.com/your-username/sappy-study-abroad.git`）

2. **プッシュ**
   - コマンドパレットを開く（`Ctrl + Shift + P`）
   - 「Git: Push」と入力して選択
   - 「origin」を選択
   - 「main」ブランチを選択

---

## 🔐 認証について

初回プッシュ時、GitHubの認証が求められる場合があります：

- **ユーザー名**: GitHubのユーザー名
- **パスワード**: **通常のパスワードではなく、パーソナルアクセストークン**を使用

### パーソナルアクセストークンの作成方法

1. GitHub → 右上のアイコン → **Settings**
2. 左下の **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token (classic)**
5. **Note**: 「Cursor Git」など
6. **Expiration**: 90 days または No expiration
7. **Select scopes**: ✅ **repo** にチェック
8. **Generate token** をクリック
9. 表示されたトークンを**コピー**（後で見れないので注意！）
10. このトークンをパスワードとして使用

---

## ✅ 確認方法

プッシュが成功したら：

1. GitHubのリポジトリページ（https://github.com/your-username/sappy-study-abroad）を開く
2. アップロードされたファイルが表示されていることを確認

---

## 🔄 今後の更新方法

コードを変更したら：

1. **ファイルをステージング**
   - ソース管理パネルで変更されたファイルの「+」をクリック

2. **コミット**
   - コミットメッセージを入力して `Ctrl + Enter`

3. **プッシュ**
   - 「Sync Changes」ボタンをクリック
   - または `Ctrl + Shift + P` → 「Git: Push」

---

## 🆘 よくある問題

### Q: 「Initialize Repository」ボタンが表示されない
A: すでにGitが初期化されている可能性があります。ソース管理パネルでファイルが表示されていれば、そのままステップ3に進んでください。

### Q: プッシュ時に認証エラーが出る
A: パーソナルアクセストークンを使用しているか確認してください。通常のパスワードでは動作しません。

### Q: 「Publish Branch」ボタンが表示されない
A: まずコミットを実行してください。コミット後、ボタンが表示されます。

---

## 📚 次のステップ

GitHubにプッシュが完了したら、`DEPLOYMENT_GUIDE.md`を参照してVercelにデプロイしてください！


