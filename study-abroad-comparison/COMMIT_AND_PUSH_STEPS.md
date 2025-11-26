# コミットとプッシュの手順

## ✅ ステップ1: ファイルをステージング（完了）
- ✅ ファイルがステージングされました

---

## 📝 ステップ2: コミット（変更を記録）

### 方法1: ソース管理パネルから（簡単）

1. **ソース管理パネルを開く**（📊アイコン、または `Ctrl + Shift + G`）

2. **コミットメッセージを入力**
   - パネルの上部にあるテキストボックスにメッセージを入力
   - 例：`Initial commit: Sappy Study Abroad Platform`
   - または：`初回コミット: Sappy留学プラットフォーム`

3. **コミットを実行**
   - `Ctrl + Enter` キーを押す
   - または、テキストボックスの上にある「✓ Commit」ボタンをクリック

### 方法2: コマンドパレットから

1. `Ctrl + Shift + P` を押す
2. 「**commit**」と入力
3. 「**Git: Commit**」を選択
4. コミットメッセージを入力してEnter

---

## ✅ コミットが成功すると...

- ✅ 「Staged Changes」セクションが空になります
- ✅ 「Changes」も空になります
- ✅ コミット履歴が表示されます
- ✅ 上部に「**Publish Branch**」または「**Sync Changes**」ボタンが表示されます

---

## 🚀 ステップ3: GitHubにプッシュ（公開）

### 方法A: 「Publish Branch」ボタンを使う（初回）

1. **「Publish Branch」ボタンを探す**
   - ソース管理パネルの上部に表示されます
   - クリックしてください

2. **GitHubで認証**
   - 初回の場合、ブラウザが開きます
   - GitHubにログインしてください

3. **リポジトリ設定**
   - **リポジトリ名を入力**（例：`sappy-study-abroad`）
   - **Private** または **Public** を選択
   - 「**Publish**」をクリック

これで完了です！🎉

### 方法B: 既存のリポジトリに接続する場合

既にGitHubでリポジトリを作成済みの場合：

1. **リモートリポジトリを追加**
   - `Ctrl + Shift + P` → 「**Git: Add Remote**」と入力
   - Remote name: `origin` と入力
   - Remote URL: `https://github.com/your-username/repo-name.git` と入力

2. **プッシュ**
   - `Ctrl + Shift + P` → 「**Git: Push**」と入力
   - 「origin」を選択
   - ブランチ（通常は「main」）を選択

---

## 🔐 認証について

初回プッシュ時に認証が求められる場合：

- **ユーザー名**: GitHubのユーザー名
- **パスワード**: GitHubのパスワードではなく、**パーソナルアクセストークン**を使用

### パーソナルアクセストークンの作成

1. GitHub → 右上のアイコン → **Settings**
2. 左下 → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token (classic)**
5. **Note**: 「Cursor Git」など
6. **Expiration**: 90 days または No expiration
7. **Select scopes**: ✅ **repo** にチェック
8. **Generate token** をクリック
9. トークンをコピー（後で見れません！）
10. パスワードとして使用

---

## ✅ 確認方法

プッシュが成功したら：

1. https://github.com/your-username/repo-name を開く
2. アップロードされたファイルが表示されていることを確認

---

## 🎯 現在のステップ

**今は「ステップ2: コミット」を実行してください！**

1. ソース管理パネル（📊）を開く
2. コミットメッセージを入力
3. `Ctrl + Enter` を押す

完了したら教えてください！

