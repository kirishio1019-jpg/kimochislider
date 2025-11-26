# GitHubにプッシュする手順

## ✅ リモートリポジトリの設定を追加しました

リポジトリURL: `https://github.com/kirishio1019-jpg/study-abroad-platform.git`

---

## 🚀 次のステップ：プッシュする

### 方法1: コマンドパレットから（簡単）

1. **コマンドパレットを開く**
   - `Ctrl + Shift + P` を押す

2. **プッシュを実行**
   - 「**Git: Push**」と入力して選択
   - 「origin」を選択（表示された場合）
   - ブランチ（通常は「main」）を選択

### 方法2: ソース管理パネルから

1. **ソース管理パネル（📊）を開く**
   - 左側のメニューで 📊 アイコンをクリック
   - または `Ctrl + Shift + G`

2. **「Sync Changes」または「Push」ボタンを探す**
   - 上部に表示されるボタンをクリック

3. **もし表示されない場合**
   - 「...」（3つの点）メニューをクリック
   - 「Push」を選択

---

## 🔐 初回プッシュ時の認証

初回プッシュ時に認証が求められる場合：

### GitHubのユーザー名とパスワードを入力

- **ユーザー名**: `kirishio1019-jpg`
- **パスワード**: **パーソナルアクセストークン**を使用
  - ⚠️ 通常のパスワードでは動作しません

### パーソナルアクセストークンの作成（まだの場合）

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

## ✅ プッシュが成功すると...

1. GitHubのリポジトリページにアクセス
   - https://github.com/kirishio1019-jpg/study-abroad-platform
2. アップロードされたファイルが表示されていることを確認

---

## 🆘 問題が発生した場合

### Q: 「Push」コマンドが見つからない
A: コマンドパレットで「**Git: Push**」と入力してください。

### Q: 認証エラーが出る
A: パーソナルアクセストークンを使用しているか確認してください。

### Q: 「remote origin already exists」というエラー
A: すでにリモートが追加されています。そのままプッシュを試してください。

---

**準備完了！プッシュを試してみてください！**

