# GitHubにプッシュする方法

## 🔍 「Publish Branch」ボタンが表示されない場合

通常、「Publish Branch」ボタンが表示されない理由：
- リモートリポジトリ（GitHub）がまだ接続されていない
- 既存のリモートリポジトリがある場合、代わりに「Sync Changes」ボタンが表示される

---

## 🚀 手順：GitHubにプッシュする

### ステップ1: GitHubでリポジトリを作成

1. **ブラウザで GitHub を開く**
   - https://github.com/new にアクセス

2. **リポジトリを作成**
   - **Repository name**: `sappy-study-abroad` など（好きな名前）
   - **Description**: （オプション）「Sappy Study Abroad Platform」
   - **Public** または **Private** を選択
   - ⚠️ **重要**: 以下のチェックボックスは**すべて外す**
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license
   - 「**Create repository**」をクリック

3. **リポジトリのURLをコピー**
   - 作成後、ページに表示されるURLをコピー
   - 例：`https://github.com/your-username/sappy-study-abroad.git`

---

### ステップ2: Cursorでリモートリポジトリを追加

#### 方法A: コマンドパレットから（推奨）

1. **コマンドパレットを開く**
   - `Ctrl + Shift + P` を押す

2. **リモートを追加**
   - 「**Git: Add Remote**」と入力して選択
   - Remote name: `origin` と入力してEnter
   - Remote URL: ステップ1でコピーしたURLを貼り付けてEnter
     - 例：`https://github.com/your-username/sappy-study-abroad.git`

3. **プッシュ**
   - `Ctrl + Shift + P` → 「**Git: Push**」と入力して選択
   - 「origin」を選択
   - ブランチ（通常は「main」）を選択

#### 方法B: ソース管理パネルから

1. **ソース管理パネル（📊）を開く**
2. **「...」（3つの点）メニューをクリック**
3. **「Remote」→ 「Add Remote...」を選択**
4. **名前**: `origin`
5. **URL**: GitHubのリポジトリURL
6. **「Sync Changes」ボタンが表示されるのでクリック**

---

### ステップ3: 認証

初回プッシュ時に認証が求められる場合：

- **ユーザー名**: GitHubのユーザー名
- **パスワード**: **パーソナルアクセストークン**を使用
  - 通常のパスワードでは動作しません

#### パーソナルアクセストークンの作成方法

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

1. GitHubのリポジトリページを開く
   - https://github.com/your-username/sappy-study-abroad
2. アップロードされたファイルが表示されていることを確認

---

## 🆘 よくある問題

### Q: 「Publish Branch」ボタンが表示されない
A: リモートリポジトリを追加すると、「Sync Changes」ボタンが表示されます。これを使ってプッシュできます。

### Q: プッシュ時に認証エラーが出る
A: パーソナルアクセストークンを使用しているか確認してください。

### Q: リモートが追加できない
A: GitHubリポジトリが作成済みか確認してください。URLが正しいか確認してください。

---

## 📝 次のステップ

GitHubにプッシュが完了したら、`DEPLOYMENT_GUIDE.md`を参照してVercelにデプロイできます！

