# GitHub認証エラーの解決方法

## 問題

`git push`を実行すると以下のエラーが発生します：
```
remote: Permission to b2400560-del/kimochislider.git denied to kirishio1019-jpg.
fatal: unable to access 'https://github.com/b2400560-del/kimochislider.git/': The requested URL returned error: 403
```

これは、`kirishio1019-jpg`アカウントで認証されているが、`b2400560-del`のリポジトリにプッシュしようとしているためです。

## 解決方法

### 方法1: GitHub Personal Access Tokenを使用（推奨）

1. [GitHub Settings](https://github.com/settings/tokens)にアクセス
2. 「Developer settings」→「Personal access tokens」→「Tokens (classic)」
3. 「Generate new token (classic)」をクリック
4. 設定：
   - **Note**: `kimochislider-deploy`など
   - **Expiration**: 適切な期間を選択
   - **Scopes**: `repo`にチェック
5. 「Generate token」をクリック
6. トークンをコピー（一度しか表示されません）

7. リモートURLを更新（トークンを含める）：
   ```powershell
   git remote set-url origin https://b2400560-del:YOUR_TOKEN@github.com/b2400560-del/kimochislider.git
   ```
   ⚠️ **重要**: `YOUR_TOKEN`を実際のトークンに置き換えてください

8. プッシュ：
   ```powershell
   git push -u origin main
   ```

### 方法2: GitHub CLIを使用

1. [GitHub CLI](https://cli.github.com/)をインストール
2. 認証：
   ```powershell
   gh auth login
   ```
3. 正しいアカウント（`b2400560-del`）でログイン
4. プッシュ：
   ```powershell
   git push -u origin main
   ```

### 方法3: Windows Credential Managerをクリア

1. Windows Credential Managerを開く：
   - Windowsキー → 「Credential Manager」と入力
2. 「Windows Credentials」を開く
3. `git:https://github.com`を探して削除
4. 再度プッシュを実行（認証情報の入力を求められます）

## 確認

認証が正しく設定されたか確認：

```powershell
git remote -v
```

正しく設定されていれば、以下のように表示されます：
```
origin  https://github.com/b2400560-del/kimochislider.git (fetch)
origin  https://github.com/b2400560-del/kimochislider.git (push)
```
