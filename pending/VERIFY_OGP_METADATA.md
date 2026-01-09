# OGPメタデータの確認方法

## 問題

OGP画像エンドポイント（`/api/og`）に直接アクセスすると画像が表示されるが、メッセージアプリ（LINE、Slack等）でURLを送ったときにOGPプレビューが表示されない。

## 確認方法

### 1. HTMLソースを確認

メッセージ用URLのHTMLソースを確認して、OGPメタタグが正しく含まれているか確認：

1. メッセージ用URL（`https://your-app-url.vercel.app/m/{slug}`）をブラウザで開く
2. 右クリック → 「ページのソースを表示」（または`Ctrl+U`）
3. `<head>`セクション内に以下のメタタグが含まれているか確認：

```html
<meta property="og:title" content="イベント名 - イベントのご招待です" />
<meta property="og:description" content="イベントのご招待です。きもちスライダーで気持ちを共有しましょう" />
<meta property="og:image" content="https://your-app-url.vercel.app/api/og?title=..." />
<meta property="og:image:secure_url" content="https://your-app-url.vercel.app/api/og?title=..." />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
<meta name="twitter:card" content="summary_large_image" />
```

### 2. OGPデバッガーで確認

#### LINE OGPデバッガー

1. [LINE OGPデバッガー](https://developers.line.biz/ja/tools/ogp-debugger/)にアクセス
2. メッセージ用URLを入力
3. 「プレビュー」ボタンをクリック
4. OGPプレビューが表示されるか確認

**表示されない場合:**
- 「URLを再スキャン」ボタンをクリック
- エラーメッセージを確認

#### Open Graph Debugger

1. [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)にアクセス
2. メッセージ用URLを入力
3. 「デバッグ」ボタンをクリック
4. OGPメタデータが正しく読み取られているか確認

### 3. ブラウザの開発者ツールで確認

1. メッセージ用URLをブラウザで開く
2. 開発者ツール（F12）を開く
3. 「Network」タブを選択
4. ページをリロード
5. HTMLドキュメントのレスポンスを確認
6. 「Response」タブでHTMLソースを確認

## よくある問題と解決方法

### 問題1: メタタグが含まれていない

**原因:** `generateMetadata`関数が正しく実行されていない

**解決方法:**
- ビルドログを確認
- サーバーサイドで`generateMetadata`が実行されているか確認
- エラーログを確認

### 問題2: OGP画像のURLが`localhost`になっている

**原因:** `NEXT_PUBLIC_APP_URL`環境変数が設定されていない

**解決方法:**
1. Vercel Dashboardで環境変数を設定
2. 再デプロイ

### 問題3: メタタグは含まれているが、プレビューが表示されない

**原因:** メッセージアプリがOGP画像をキャッシュしている

**解決方法:**
1. LINE OGPデバッガーで「URLを再スキャン」
2. URLにクエリパラメータを追加（`?v=2`など）
3. メッセージアプリのキャッシュをクリア

### 問題4: OGP画像のURLが404エラー

**原因:** OGP画像エンドポイントが正しくデプロイされていない

**解決方法:**
1. OGP画像エンドポイントに直接アクセスして確認
2. Vercelのデプロイメントログを確認
3. Edge Runtimeの設定を確認

## 確認チェックリスト

- [ ] HTMLソースにOGPメタタグが含まれている
- [ ] `og:image`のURLが正しい（`localhost`でない）
- [ ] OGP画像エンドポイントに直接アクセスできる
- [ ] LINE OGPデバッガーでプレビューが表示される
- [ ] メタタグの値が正しい（タイトル、説明、画像URL）

## デバッグ用コマンド

### curlでメタデータを確認

```bash
curl -s https://your-app-url.vercel.app/m/{slug} | grep -i "og:"
```

### メタタグを抽出

```bash
curl -s https://your-app-url.vercel.app/m/{slug} | grep -E "(og:|twitter:)" | head -20
```

## 参考リンク

- [Open Graph Protocol](https://ogp.me/)
- [LINE OGPデバッガー](https://developers.line.biz/ja/tools/ogp-debugger/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
