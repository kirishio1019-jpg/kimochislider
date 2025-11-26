# GitHubリポジトリに接続する手順

## ✅ リモートリポジトリを追加

あなたのリポジトリURL: `https://github.com/kirishio1019-jpg/study-abroad-platform.git`

### 方法1: コマンドパレットから（推奨）

1. **コマンドパレットを開く**
   - `Ctrl + Shift + P` を押す

2. **リモートを追加**
   - 「**Git: Add Remote**」と入力して選択
   - Remote name: `origin` と入力してEnter
   - Remote URL: `https://github.com/kirishio1019-jpg/study-abroad-platform.git` を貼り付けてEnter

3. **プッシュ**
   - `Ctrl + Shift + P` → 「**Git: Push**」と入力して選択
   - 「origin」を選択
   - ブランチ（通常は「main」）を選択

---

### 方法2: 設定ファイルを直接編集

もしコマンドパレットからできない場合は、`.git/config`ファイルを直接編集できます。

