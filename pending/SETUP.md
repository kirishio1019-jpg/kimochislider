# きもちスライダー セットアップガイド

## 1. プロジェクトのセットアップ

### 依存関係のインストール

```bash
npm install
```

## 2. Supabaseのセットアップ

### 2.1 Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成（またはログイン）
2. 「New Project」をクリックして新しいプロジェクトを作成
3. プロジェクト名、データベースパスワード、リージョンを設定
4. プロジェクトが作成されるまで待機（数分かかります）

### 2.2 データベーススキーマの作成

1. Supabaseダッシュボードで「SQL Editor」を開く
2. `supabase-schema.sql` の内容をコピー＆ペースト
3. 「Run」をクリックして実行
4. エラーがなければ成功です

### 2.3 環境変数の設定

1. Supabaseダッシュボードで「Settings」→「API」を開く
2. 以下の情報をコピー：
   - Project URL（`NEXT_PUBLIC_SUPABASE_URL`）
   - anon public key（`NEXT_PUBLIC_SUPABASE_ANON_KEY`）

3. プロジェクトルートに `.env.local` ファイルを作成：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いて動作確認

## 4. 動作確認

### 4.1 イベント作成

1. `http://localhost:3000/admin/new` にアクセス
2. イベント情報を入力して作成
3. 公開URLと管理URLが表示されることを確認

### 4.2 公開イベントページ

1. 公開URL（`/e/[slug]`）にアクセス
2. スライダーで気持ちを入力
3. 「気持ちを置いておく」ボタンをクリック
4. 更新用リンクが表示されることを確認

### 4.3 更新ページ

1. 更新用リンク（`/r/[edit_token]`）にアクセス
2. スライダーで気持ちを更新できることを確認

### 4.4 ダッシュボード

1. 管理URL（`/admin/[admin_token]/events/[event_id]`）にアクセス
2. 統計情報と回答一覧が表示されることを確認

## 5. トラブルシューティング

### データベース接続エラー

- `.env.local` の環境変数が正しく設定されているか確認
- Supabaseプロジェクトがアクティブか確認

### RLSポリシーエラー

- SupabaseのSQL Editorで `supabase-schema.sql` が正しく実行されたか確認
- RLSポリシーが有効になっているか確認

### ビルドエラー

- `npm install` を再実行
- `node_modules` を削除して再インストール

## 6. デプロイ

### Vercelへのデプロイ

1. GitHubにリポジトリをプッシュ
2. [Vercel](https://vercel.com)でプロジェクトをインポート
3. 環境変数を設定：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`（本番環境のURL）
4. デプロイが完了したら動作確認
