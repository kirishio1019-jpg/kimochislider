# OGP画像の404エラー解決ガイド

## エラー内容

```
404: NOT_FOUND
Code: DEPLOYMENT_NOT_FOUND
ID: hnd1::v2gcg-1767992884163-d1aec0b51409
```

このエラーは、OGP画像のエンドポイント（`/api/og`）が正しくデプロイされていないか、Edge Runtimeの設定に問題がある可能性があります。

## 解決方法

### 1. Vercelのデプロイメントを確認

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクトを選択
3. 「**Deployments**」タブを確認
4. 最新のデプロイメントが成功しているか確認
5. 失敗している場合は、エラーログを確認

### 2. Edge Runtimeの設定を確認

`/api/og`エンドポイントはEdge Runtimeを使用しています。VercelでEdge Runtimeが正しく動作することを確認してください。

**確認項目:**
- `export const runtime = 'edge'`が設定されているか
- `@vercel/og`パッケージがインストールされているか

### 3. パッケージのインストール確認

`package.json`に`@vercel/og`が含まれているか確認：

```json
{
  "dependencies": {
    "@vercel/og": "^0.5.0"
  }
}
```

含まれていない場合は、インストール：

```bash
npm install @vercel/og
```

### 4. ビルドログを確認

Vercelのデプロイメントログで、以下のエラーがないか確認：

- `Module not found: @vercel/og`
- `Edge Runtime is not supported`
- `Failed to compile`

### 5. 環境変数の確認

Vercelの環境変数設定を確認：

- `NEXT_PUBLIC_APP_URL`が正しく設定されているか
- 値が`https://your-app-url.vercel.app`の形式になっているか（末尾にスラッシュなし）

### 6. OGP画像エンドポイントの直接確認

ブラウザで以下のURLに直接アクセスして、エラーの詳細を確認：

```
https://your-app-url.vercel.app/api/og?title=テストイベント&slug=test-event
```

**期待される動作:**
- 画像が表示される
- または、エラーメッセージが表示される（デバッグ用）

### 7. 再デプロイ

問題が解決しない場合、以下の手順で再デプロイ：

1. GitHubに変更をプッシュ
2. Vercelが自動的にデプロイを開始
3. デプロイログを確認

または、Vercel Dashboardから手動で再デプロイ：

1. 「**Deployments**」タブを開く
2. 最新のデプロイメントの「**...**」メニューをクリック
3. 「**Redeploy**」を選択

### 8. Edge Runtimeの代替案

Edge Runtimeで問題が続く場合、Node.js Runtimeに変更することも可能です：

```typescript
// app/api/og/route.tsx
// export const runtime = 'edge' を削除またはコメントアウト
```

ただし、Edge Runtimeの方が高速で、OGP画像生成には推奨されます。

## 確認チェックリスト

- [ ] Vercelのデプロイメントが成功している
- [ ] `@vercel/og`パッケージがインストールされている
- [ ] `export const runtime = 'edge'`が設定されている
- [ ] `NEXT_PUBLIC_APP_URL`環境変数が設定されている
- [ ] OGP画像エンドポイントに直接アクセスできる
- [ ] ビルドログにエラーがない

## トラブルシューティング

### エラーが続く場合

1. **Vercelのサポートに問い合わせ**: [Vercel Support](https://vercel.com/support)
2. **GitHub Issuesで報告**: エラーログと再現手順を共有
3. **一時的な回避策**: OGP画像を静的ファイルとして提供（推奨されません）

## 参考リンク

- [Vercel OG Image Generation](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)
- [Next.js Edge Runtime](https://nextjs.org/docs/app/api-reference/route-segment-config#runtime)
- [Vercel Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions)
