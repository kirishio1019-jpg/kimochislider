# GitHubへのプッシュ手順

## 現在の状況

- リモートリポジトリは既に設定されています: `https://github.com/kirishio1019-jpg/study-abroad-sappy.git`
- ただし、`pending`ディレクトリのファイルはまだGitに追加されていません

## 手順

**PowerShellまたはコマンドプロンプトで以下のコマンドを実行してください：**

### 1. プロジェクトディレクトリに移動

```powershell
cd c:\Users\kiris\.cursor\pending
```

### 2. 変更をステージング（pendingディレクトリ内のファイルのみ）

```powershell
git add .
```

### 3. コミット

```powershell
git commit -m "Add: きもちスライダーアプリ"
```

### 4. GitHubにプッシュ

```powershell
git push origin main
```

## 注意事項

- `#`で始まる行はコメントなので実行する必要はありません
- 既存のリポジトリ（`study-abroad-sappy`）に追加されます
- 別のリポジトリとして公開したい場合は、新しいリポジトリを作成してリモートを変更してください

## 新しいリポジトリとして公開する場合（推奨）

### 1. GitHubで新しいリポジトリを作成

1. [GitHub](https://github.com/new)にアクセス
2. **Repository name**を入力: `kimochislider`
3. **Visibility**を選択：
   - `Public`（公開）または `Private`（非公開）
4. **その他の設定**：
   - ✅ **Add README**: `Off`（既にREADME.mdがあるため）
   - ✅ **Add .gitignore**: `No .gitignore`（既に.gitignoreがあるため）
   - ✅ **Add license**: `No license`（必要に応じて後で追加可能）
5. **「Create repository」**をクリック

### 2. リモートURLを新しいリポジトリに変更

PowerShellまたはコマンドプロンプトで実行：

```powershell
# プロジェクトディレクトリに移動
cd c:\Users\kiris\.cursor\pending

# リモートURLを新しいリポジトリに変更
git remote set-url origin https://github.com/b2400560-del/kimochislider.git
```

### 3. 変更をコミットしてプッシュ

```powershell
# 変更をステージング
git add .

# コミット
git commit -m "Initial commit: きもちスライダーアプリ"

# 新しいリポジトリにプッシュ
git push -u origin main
```
