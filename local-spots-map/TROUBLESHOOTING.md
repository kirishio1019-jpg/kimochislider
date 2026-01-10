# トラブルシューティングガイド

## サイトにアクセスできない場合

### 1. 開発サーバーが起動しているか確認

ターミナルで以下のコマンドを実行してください：

```bash
cd C:\Users\kiris\.cursor\local-spots-map
npm run dev
```

正常に起動すると、以下のようなメッセージが表示されます：

```
  ▲ Next.js 16.0.3
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### 2. ポート3000が使用されている場合

別のプロセスがポート3000を使用している可能性があります。以下のコマンドで確認：

```bash
netstat -ano | findstr :3000
```

プロセスを停止するには、タスクマネージャーで該当プロセスを終了するか、以下のコマンドで停止：

```bash
taskkill /PID <プロセスID> /F
```

### 3. 別のポートで起動する

ポート3000が使用されている場合、別のポートで起動できます：

```bash
npm run dev -- -p 3001
```

その後、http://localhost:3001 にアクセスしてください。

### 4. エラーメッセージを確認

開発サーバーを起動した際にエラーメッセージが表示される場合は、その内容を確認してください。

よくあるエラー：
- **Module not found**: 依存関係がインストールされていない → `npm install`を実行
- **Port already in use**: ポートが使用中 → 上記の手順で解決
- **Environment variables**: 環境変数のエラー → `.env.local`ファイルを確認

### 5. キャッシュをクリア

問題が解決しない場合、Next.jsのキャッシュをクリア：

```bash
rm -rf .next
npm run dev
```

Windowsの場合は：

```bash
rmdir /s /q .next
npm run dev
```

### 6. 依存関係を再インストール

```bash
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

Windowsの場合は：

```bash
rmdir /s /q node_modules
del package-lock.json
npm install
npm run dev
```























