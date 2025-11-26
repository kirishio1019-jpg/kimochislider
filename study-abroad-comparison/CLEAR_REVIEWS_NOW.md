# レビューを今すぐ削除する方法

## 最も簡単な方法

1. **ブラウザでアプリを開く**
   - http://localhost:3000 を開いてください

2. **開発者ツールを開く**
   - **F12キー**を押すか、右クリック→「検証」を選択

3. **Consoleタブを開く**
   - 開発者ツールの上部にある「Console」タブをクリック

4. **以下のコマンドを1行ずつ入力してEnterキーを押す**

```javascript
localStorage.removeItem('reviews');
localStorage.removeItem('reviewCreators');
location.reload();
```

これで、すべてのレビューが削除され、ページが自動的にリロードされます！

## 確認方法

削除後、ホームページに「まだレビューがありません」と表示されれば成功です。


