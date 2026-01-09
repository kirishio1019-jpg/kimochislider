# 環境変数の設定方法

## 1. Supabaseの認証情報を取得

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択（または新規作成）
3. 左メニューから「Settings」→「API」をクリック
4. 以下の情報をコピー：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`に設定
   - **anon public** キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`に設定

## 2. `.env.local`ファイルを編集

`c:\Users\kiris\.cursor\pending\.env.local`ファイルを開いて、以下のように編集してください：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**重要**: 
- `your_supabase_url`を実際のProject URLに置き換えてください
- `your_supabase_anon_key`を実際のanonキーに置き換えてください
- 値の前後に余分なスペースや引用符を入れないでください

## 3. 開発サーバーを再起動

環境変数を反映するため、開発サーバーを停止して再起動してください：

```bash
# Ctrl+C でサーバーを停止
# その後、再度起動
npm run dev
```

## 4. 動作確認

ブラウザで `http://localhost:3000` にアクセスして、イベント作成が正常に動作するか確認してください。

## トラブルシューティング

### エラーが続く場合

1. `.env.local`ファイルのパスが正しいか確認
   - ファイルは `pending` フォルダのルートに配置されている必要があります
2. 環境変数の値が正しいか確認
   - Supabase Dashboardから再度コピーして貼り付け
3. 開発サーバーを完全に再起動
   - ターミナルで `Ctrl+C` で停止し、`npm run dev` で再起動
4. `.env.local`ファイルの文字コードを確認
   - UTF-8で保存されていることを確認
