# LINEのOGPプレビューキャッシュをクリアする方法

## 問題

LINEでメッセージ用URLを送っても、プレゼントUI風のOGPプレビューカードが表示されない場合、LINEがOGP画像をキャッシュしている可能性があります。

## 解決方法

### 方法1: LINE OGPデバッガーを使用（推奨）

1. [LINE OGPデバッガー](https://developers.line.biz/ja/tools/ogp-debugger/)にアクセス
2. メッセージ用URL（`https://your-app-url.vercel.app/m/[slug]`）を入力
3. 「プレビュー」ボタンをクリック
4. 新しいOGP画像が表示されることを確認
5. LINEアプリで再度URLを送信して確認

### 方法2: URLにクエリパラメータを追加

一時的にURLにクエリパラメータを追加して、LINEに新しいURLとして認識させます：

```
https://your-app-url.vercel.app/m/[slug]?v=2
```

### 方法3: LINEアプリのキャッシュをクリア

1. LINEアプリを完全に終了
2. スマートフォンの設定からLINEアプリのキャッシュをクリア
3. LINEアプリを再起動
4. 再度URLを送信

## 確認方法

### OGP画像が正しく生成されているか確認

ブラウザで以下のURLに直接アクセスして、プレゼントUI風の画像が表示されるか確認してください：

```
https://your-app-url.vercel.app/api/og?title=テストイベント&slug=test-event
```

### メタデータが正しく設定されているか確認

ブラウザの開発者ツールで、メッセージ用URLのHTMLを確認：

1. メッセージ用URLをブラウザで開く
2. 右クリック → 「ページのソースを表示」
3. 以下のメタタグが含まれているか確認：

```html
<meta property="og:title" content="イベント名 - イベントのご招待です" />
<meta property="og:description" content="イベントのご招待です。きもちスライダーで気持ちを共有しましょう" />
<meta property="og:image" content="https://your-app-url.vercel.app/api/og?title=..." />
```

## OGP画像の特徴

- 上部に「ご招待」のリボン
- 中央にプレゼントボックス風のデザインでイベントタイトルを表示
- 下部に「イベントのご招待です」と「きもちスライダーで気持ちを共有しましょう」のメッセージ

## トラブルシューティング

### OGP画像が表示されない

1. **URLが正しいか確認**: `https://your-app-url.vercel.app/m/[slug]`の形式になっているか
2. **環境変数が設定されているか**: `NEXT_PUBLIC_APP_URL`が正しく設定されているか
3. **ビルドが成功しているか**: Vercelのデプロイログを確認

### 古いOGP画像が表示される

1. LINE OGPデバッガーでURLを再スキャン
2. URLにクエリパラメータを追加（`?v=2`など）
3. LINEアプリのキャッシュをクリア

### 「イベントのご招待です」が表示されない

1. メタデータの`description`が正しく設定されているか確認
2. LINE OGPデバッガーで再スキャン
