# OGPプレビュー設定ガイド

## 概要

メッセージアプリ（LINE / Slack / X / Discord等）でURLを送ったときに、画像付きカード（OGPプレビュー）が表示されるように設定します。

## 実装内容

### 1. OGPメタデータの設定

`/m/[slug]`ルートで以下のメタデータを設定しています：

- **タイトル**: `{イベント名} - イベントのご招待です`
- **説明**: `イベントのご招待です。きもちスライダーで気持ちを共有しましょう`
- **画像**: `/api/og`エンドポイントで生成されるプレゼントUI風の画像（1200x630px）
- **URL**: `https://your-app-url.vercel.app/m/{slug}`

### 2. OGP画像の生成

`/api/og`エンドポイントで、Vercelの`@vercel/og`を使用して動的にOGP画像を生成します。

**特徴:**
- プレゼントボックス風のデザイン
- 上部に「ご招待」のリボン
- 中央にイベントタイトル
- 下部に「イベントのご招待です」のメッセージ

**サイズ:** 1200x630px（推奨サイズ）

### 3. 対応しているメッセージアプリ

- **LINE**: Open Graphプロトコルに対応
- **Slack**: Open Graphプロトコルに対応
- **X (Twitter)**: Twitter Card (`summary_large_image`)に対応
- **Discord**: Open Graphプロトコルに対応

## 確認方法

### 1. OGP画像が正しく生成されているか確認

ブラウザで以下のURLに直接アクセスして、画像が表示されるか確認：

```
https://your-app-url.vercel.app/api/og?title=テストイベント&slug=test-event
```

### 2. メタデータが正しく設定されているか確認

ブラウザの開発者ツールで、メッセージ用URLのHTMLを確認：

1. メッセージ用URL（`https://your-app-url.vercel.app/m/{slug}`）をブラウザで開く
2. 右クリック → 「ページのソースを表示」
3. 以下のメタタグが含まれているか確認：

```html
<meta property="og:title" content="イベント名 - イベントのご招待です" />
<meta property="og:description" content="イベントのご招待です。きもちスライダーで気持ちを共有しましょう" />
<meta property="og:image" content="https://your-app-url.vercel.app/api/og?title=..." />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
<meta name="twitter:card" content="summary_large_image" />
```

### 3. 各メッセージアプリで確認

#### LINE

1. [LINE OGPデバッガー](https://developers.line.biz/ja/tools/ogp-debugger/)にアクセス
2. メッセージ用URLを入力
3. 「プレビュー」ボタンをクリック
4. OGPプレビューが表示されることを確認

#### Slack

1. SlackのワークスペースでURLを送信
2. リンクプレビューが表示されることを確認

#### X (Twitter)

1. [Twitter Card Validator](https://cards-dev.twitter.com/validator)にアクセス
2. メッセージ用URLを入力
3. プレビューが表示されることを確認

#### Discord

1. DiscordのチャンネルでURLを送信
2. リンクプレビューが表示されることを確認

## 環境変数の設定

Vercel本番環境で正しく動作するために、以下の環境変数を設定してください：

```
NEXT_PUBLIC_APP_URL=https://your-app-url.vercel.app
```

**重要:** 
- `https://`で始まる完全なURLを設定してください
- 末尾にスラッシュ（`/`）は不要です

## トラブルシューティング

### OGP画像が表示されない

1. **URLが正しいか確認**: `https://your-app-url.vercel.app/api/og?title=...`に直接アクセスして画像が表示されるか確認
2. **環境変数が設定されているか**: Vercelの環境変数設定を確認
3. **ビルドが成功しているか**: Vercelのデプロイログを確認

### 古いOGP画像が表示される

各メッセージアプリはOGP画像をキャッシュします。以下の方法でキャッシュをクリア：

1. **LINE**: [LINE OGPデバッガー](https://developers.line.biz/ja/tools/ogp-debugger/)でURLを再スキャン
2. **Slack**: URLにクエリパラメータを追加（`?v=2`など）
3. **X (Twitter)**: [Twitter Card Validator](https://cards-dev.twitter.com/validator)で再検証
4. **Discord**: URLにクエリパラメータを追加

### メタデータが正しく設定されていない

1. **ビルドエラーを確認**: Vercelのデプロイログでエラーがないか確認
2. **メタデータの生成を確認**: `generateMetadata`関数が正しく実行されているか確認
3. **HTMLソースを確認**: ブラウザでHTMLソースを確認してメタタグが含まれているか確認

## 技術的な詳細

### OGP画像の生成

`@vercel/og`を使用して、Edge Runtimeで動的にOGP画像を生成します。

**メリット:**
- サーバーレスで動作
- 高速な画像生成
- 動的なコンテンツに対応

### メタデータの生成

Next.jsの`generateMetadata`関数を使用して、サーバーサイドでメタデータを生成します。

**メリット:**
- SEO最適化
- 動的なメタデータ生成
- サーバーサイドレンダリング対応

## 参考リンク

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [LINE OGPデバッガー](https://developers.line.biz/ja/tools/ogp-debugger/)
- [Vercel OG Image Generation](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)
