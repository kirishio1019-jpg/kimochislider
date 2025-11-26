# Gitのユーザー名とメールアドレスを設定する方法

## 🔧 Cursorで設定する方法（簡単）

### 方法1: コマンドパレットから設定

1. **コマンドパレットを開く**
   - `Ctrl + Shift + P` を押す

2. **ユーザー名を設定**
   - 「**Git: Set User Name**」と入力して選択
   - ユーザー名を入力（例：あなたのGitHubのユーザー名）
   - Enterキーを押す

3. **メールアドレスを設定**
   - もう一度 `Ctrl + Shift + P` を押す
   - 「**Git: Set User Email**」と入力して選択
   - メールアドレスを入力（例：GitHubに登録しているメールアドレス）
   - Enterキーを押す

---

### 方法2: ターミナルから設定（確実）

1. **ターミナルを開く**
   - Cursor下部のターミナルパネルをクリック
   - または `Ctrl + ~` キーを押す

2. **以下のコマンドを実行**（あなたの情報に置き換えてください）

```bash
git config --global user.name "あなたの名前またはGitHubのユーザー名"
git config --global user.email "あなたのメールアドレス"
```

**例：**
```bash
git config --global user.name "kiris"
git config --global user.email "your-email@example.com"
```

3. **設定を確認**

```bash
git config --global user.name
git config --global user.email
```

正しく表示されればOKです！

---

## 📝 入力する情報

- **user.name**: 
  - GitHubのユーザー名、または任意の名前
  - 例：`kiris`、`John Doe`

- **user.email**: 
  - GitHubに登録しているメールアドレス
  - 例：`your-email@gmail.com`
  - ⚠️ このメールはコミット履歴に表示されます

---

## ✅ 設定後

設定が完了したら、もう一度コミットを試してください：

1. ソース管理パネル（📊）を開く
2. コミットメッセージを入力
3. `Ctrl + Enter` を押す

これでコミットできるはずです！

---

## 💡 補足

- `--global` オプション：このPC上のすべてのGitリポジトリに適用されます
- 特定のプロジェクトだけに設定したい場合：`--global` を外して、プロジェクトフォルダ内で実行

