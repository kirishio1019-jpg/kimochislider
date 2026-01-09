# Vercel環境変数設定ガイド

## 問題

デプロイ後、Googleログインや公開URL・埋め込み用URLがlocalhostになってしまう問題を解決するためのガイドです。

## 原因

Next.jsでは、`NEXT_PUBLIC_`プレフィックスの環境変数はビルド時に静的に置き換えられます。Vercelで環境変数が設定されていない場合、クライアントサイドで`process.env.NEXT_PUBLIC_APP_URL`が`undefined`になり、フォールバック処理が正しく動作しない可能性があります。

## 解決方法

### 1. Vercelで環境変数を設定

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクトを選択
3. 「Settings」→「Environment Variables」を開く
4. 以下の環境変数を追加：

   **Key**: `NEXT_PUBLIC_APP_URL`
   
   **Value**: 実際のVercel URL（例: `https://kimochislider-xxxxx.vercel.app`）
   
   **Environment**: Production, Preview, Development すべてにチェック

5. 「Save」をクリック

### 2. 再デプロイ

環境変数を追加・変更した後は、必ず再デプロイが必要です：

1. 「Deployments」タブを開く
2. 最新のデプロイを選択
3. 「Redeploy」をクリック
4. または、GitHubにプッシュして自動デプロイをトリガー

### 3. 動作確認

デプロイ後、以下を確認：

1. ブラウザの開発者ツール（F12）→「Console」タブを開く
2. 各ページで以下を確認：
   - ホーム画面でGoogleログイン → リダイレクトURLが本番URLになっているか
   - イベント作成後のURL表示 → 本番URLが表示されているか
   - 公開URLや埋め込み用URL → 本番URLが表示されているか
   - イベント管理画面のURL → 本番URLが表示されているか

### 4. トラブルシューティング

#### まだlocalhostになっている場合

1. **環境変数の確認**
   - Vercel Dashboardで`NEXT_PUBLIC_APP_URL`が正しく設定されているか確認
   - 値に`https://`が含まれているか確認
   - 末尾にスラッシュ（`/`）がないか確認

2. **再デプロイの確認**
   - 環境変数を変更した後、必ず再デプロイを実行
   - デプロイログで環境変数が読み込まれているか確認

3. **ブラウザのキャッシュをクリア**
   - ブラウザのキャッシュをクリアして再試行
   - シークレットモードで確認

4. **コンソールログの確認**
   - 開発環境では、`[getAppUrl]`で始まるログが表示されます
   - どのURLが使用されているか確認できます

## 技術的な詳細

### `getAppUrl()`関数の動作

```typescript
export function getAppUrl(): string {
  if (typeof window === 'undefined') {
    // サーバーサイド: 環境変数を使用
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
  
  // クライアントサイド
  const envUrl = process.env.NEXT_PUBLIC_APP_URL
  const currentOrigin = window.location.origin
  
  // 環境変数が設定されていて、かつlocalhostでない場合
  if (envUrl && envUrl !== 'undefined' && !envUrl.includes('localhost')) {
    return envUrl
  }
  
  // それ以外: 現在のoriginを使用（本番環境では本番URL）
  return currentOrigin
}
```

### 重要なポイント

- **本番環境では`window.location.origin`が本番URLになる**
  - ユーザーが`https://your-app.vercel.app`にアクセスしている場合、`window.location.origin`は`https://your-app.vercel.app`になります
  - そのため、環境変数が設定されていなくても、本番環境では正しく動作するはずです

- **環境変数はビルド時に置き換えられる**
  - `NEXT_PUBLIC_APP_URL`はビルド時に静的に置き換えられます
  - 実行時に動的に変更することはできません

## 確認チェックリスト

- [ ] Vercel Dashboardで`NEXT_PUBLIC_APP_URL`が設定されている
- [ ] 環境変数の値が正しい（`https://your-app.vercel.app`形式）
- [ ] 環境変数がProduction, Preview, Developmentすべてに設定されている
- [ ] 環境変数設定後に再デプロイを実行した
- [ ] デプロイログで環境変数が読み込まれている
- [ ] ブラウザのコンソールでURLが正しく表示されている
- [ ] 各ページでURLが本番URLになっている
