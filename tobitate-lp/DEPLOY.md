# 公開手順 - Netlify

## Netlifyで公開する方法

### 1. Netlifyにサインアップ
https://www.netlify.com でアカウントを作成（GitHubアカウントで連携可能）

### 2. GitHubリポジトリを作成（まだの場合）
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
git push -u origin main
```

### 3. Netlifyでデプロイ
1. Netlifyのダッシュボードで「Add new site」→「Import an existing project」をクリック
2. GitHubを選択してリポジトリを連携
3. リポジトリを選択
4. ビルド設定：
   - **Publish directory**: `docs`
   - **Build command**: （空欄のまま）
5. 「Deploy site」をクリック

### 4. 公開URL
数秒でデプロイが完了し、以下のようなURLが自動生成されます：
`https://ランダムな名前.netlify.app`

### 5. カスタムドメイン（オプション）
- Site settings > Domain management からカスタムドメインを設定可能

---

## ファイル更新方法

説明書を更新する場合：
1. `guide.html` を編集
2. 編集内容を `docs/index.html` にコピー
3. GitHubにプッシュすると、Netlifyが自動的に再デプロイします

```bash
# guide.htmlを編集後
cp guide.html docs/index.html
git add docs/index.html
git commit -m "Update guide"
git push
```

---

## 注意事項
- `docs/index.html` が公開されるファイルです
- Netlifyは自動的にGitHubの変更を検知して再デプロイします
- 初回デプロイ後、数秒でサイトが公開されます
