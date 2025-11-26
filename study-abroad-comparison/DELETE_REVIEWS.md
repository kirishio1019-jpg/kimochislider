# レビューデータの削除方法

## 方法1: ブラウザの開発者ツールを使用（推奨）

1. ブラウザでアプリを開く（http://localhost:3000）
2. **F12キー**を押して開発者ツールを開く
3. **Console**タブをクリック
4. 以下のコマンドを入力してEnterキーを押す：

```javascript
localStorage.removeItem('reviews');
localStorage.removeItem('reviewCreators');
localStorage.removeItem('reviewFormData');
location.reload();
```

これで、すべてのレビューデータが削除され、ページがリロードされます。

## 方法2: Applicationタブから削除

1. ブラウザでアプリを開く（http://localhost:3000）
2. **F12キー**を押して開発者ツールを開く
3. **Application**タブ（Chrome）または**Storage**タブ（Firefox）をクリック
4. 左側のメニューから**Local Storage** → **http://localhost:3000**を選択
5. 以下のキーを探して削除：
   - `reviews`
   - `reviewCreators`
   - `reviewFormData`（もしあれば）
6. ページをリロード（F5）

## 方法3: すべてのLocalStorageをクリア

1. ブラウザでアプリを開く（http://localhost:3000）
2. **F12キー**を押して開発者ツールを開く
3. **Application**タブをクリック
4. **Storage**セクションの**Clear site data**をクリック
5. **Clear site data**ボタンをクリック
6. ページをリロード（F5）

⚠️ **注意**: この方法では、アプリのすべてのローカルストレージデータ（ページ設定など）も削除されます。


