# OGP画像の404エラー修正ガイド

## エラー内容

```
404: NOT_FOUND
Code: DEPLOYMENT_NOT_FOUND
ID: hnd1::v2gcg-1767992884163-d1aec0b51409
```

このエラーは、OGP画像のエンドポイント（`/api/og`）が正しくデプロイされていないか、URLの生成に問題がある可能性があります。

## 解決方法

### 1. 環境変数の確認（最重要）

Vercelの環境変数設定で、`NEXT_PUBLIC_APP_URL`が正しく設定されているか確認してください。

**Vercel Dashboardでの確認手順:**

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクトを選択
3. 「**Settings**」→「**Environment Variables**」をクリック
4. `NEXT_PUBLIC_APP_URL`が存在するか確認
5. 値が正しい形式か確認（例: `https://your-app-name.vercel.app`）

**正しい形式:**
- `https://`で始まる
- 末尾にスラッシュ（`/`）がない
- 実際のVercelのデプロイメントURLと一致している

**設定例:**
```
NEXT_PUBLIC_APP_URL=https://kimochislider.vercel.app
```

### 2. デプロイメントの確認

1. Vercel Dashboardで「**Deployments**」タブを確認
2. 最新のデプロイメントが成功しているか確認
3. 失敗している場合は、エラーログを確認

### 3. OGP画像エンドポイントの直接確認

ブラウザで以下のURLに直接アクセスして、画像が表示されるか確認：

```
https://your-app-url.vercel.app/api/og?title=テストイベント&slug=test-event
```

**期待される動作:**
- プレゼントUI風の画像が表示される
- または、エラーメッセージが表示される（デバッグ用）

### 4. メタデータの確認

メッセージ用URLのHTMLソースを確認：

1. メッセージ用URL（`https://your-app-url.vercel.app/m/{slug}`）をブラウザで開く
2. 右クリック → 「ページのソースを表示」
3. `og:image`メタタグのURLを確認：

```html
<meta property="og:image" content="https://your-app-url.vercel.app/api/og?title=..." />
```

**問題がある場合:**
- URLが`localhost`になっている → 環境変数が設定されていない
- URLが`undefined`になっている → 環境変数の値が正しくない
- URLが存在しないドメインになっている → 環境変数の値が間違っている

### 5. 再デプロイ

環境変数を変更した場合は、再デプロイが必要です：

1. GitHubに変更をプッシュ
2. Vercelが自動的にデプロイを開始
3. デプロイログを確認

または、Vercel Dashboardから手動で再デプロイ：

1. 「**Deployments**」タブを開く
2. 最新のデプロイメントの「**...**」メニューをクリック
3. 「**Redeploy**」を選択

### 6. 一時的な回避策

環境変数が設定されていない場合、OGP画像のURLが正しく生成されません。以下の方法で一時的に回避できます：

**方法1: 環境変数を設定**
- Vercel Dashboardで`NEXT_PUBLIC_APP_URL`を設定
- 再デプロイ

**方法2: デフォルト値を確認**
- コード内のデフォルト値（`https://your-app-name.vercel.app`）を実際のVercel URLに変更
- ただし、これは推奨されません（環境ごとに異なるURLが必要なため）

## 確認チェックリスト

- [ ] `NEXT_PUBLIC_APP_URL`環境変数がVercelに設定されている
- [ ] 環境変数の値が正しい形式（`https://your-app-url.vercel.app`）
- [ ] 環境変数の値が実際のVercel URLと一致している
- [ ] Vercelのデプロイメントが成功している
- [ ] OGP画像エンドポイントに直接アクセスできる
- [ ] メタデータの`og:image`URLが正しく生成されている

## トラブルシューティング

### エラーが続く場合

1. **Vercelのログを確認**: 「**Deployments**」→ 最新のデプロイメント → 「**Logs**」を確認
2. **OGP画像エンドポイントのログを確認**: Vercelの関数ログで`[OG Image]`で始まるログを確認
3. **環境変数の再設定**: 環境変数を削除して再設定し、再デプロイ

## 参考リンク

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel OG Image Generation](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)
