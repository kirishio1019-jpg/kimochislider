# `.env.local`ファイルについて

## `.env.local`ファイルとは？

`.env.local`ファイルは、アプリケーションの環境変数を保存するファイルです。このファイルには、Supabaseの認証情報などの機密情報が含まれます。

**重要**: このファイルは`.gitignore`で除外されているため、GitHubにはプッシュされません。安全のため、機密情報をこのファイルに保存します。

## ファイルの場所

`.env.local`ファイルは、プロジェクトのルートディレクトリ（`pending`フォルダ）に配置する必要があります：

```
c:\Users\kiris\.cursor\pending\.env.local
```

## ファイルの作成方法

### 方法1: VS Codeで作成

1. VS Codeで`pending`フォルダを開く
2. 左側のファイルエクスプローラーで`pending`フォルダを右クリック
3. 「新しいファイル」を選択
4. ファイル名を`.env.local`と入力（先頭のドット`.`を忘れずに）

### 方法2: エクスプローラーで作成

1. エクスプローラーで`c:\Users\kiris\.cursor\pending`フォルダを開く
2. 右クリック → 「新規作成」→ 「テキスト ドキュメント」
3. ファイル名を`.env.local`に変更
   - ⚠️ 注意: Windowsでは、ファイル名の先頭にドット（`.`）を付けると警告が出る場合があります
   - その場合は、`.env.local.txt`として作成し、後で拡張子を削除してください

### 方法3: コマンドで作成

PowerShellで以下のコマンドを実行：

```powershell
cd c:\Users\kiris\.cursor\pending
New-Item -Path .env.local -ItemType File
```

## ファイルの内容

`.env.local`ファイルに以下の内容をコピーして、実際の値を設定してください：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# アプリケーションURL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Supabaseの認証情報を取得する方法

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択（または新規作成）
3. 左メニューから「Settings」→「API」をクリック
4. 以下の情報をコピー：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`に設定
   - **anon public** キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`に設定

## 設定例

実際の値に置き換えると、以下のようになります：

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMn0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 注意事項

- ⚠️ 値の前後に余分なスペースや引用符を入れないでください
- ⚠️ ファイル名は必ず`.env.local`（先頭にドット）にしてください
- ⚠️ このファイルはGitHubにプッシュされません（`.gitignore`で除外されています）
- ⚠️ 環境変数を変更した後は、開発サーバーを再起動してください

## 動作確認

環境変数を設定した後：

1. 開発サーバーを再起動：
   ```powershell
   cd c:\Users\kiris\.cursor\pending
   npm run dev
   ```

2. ブラウザで `http://localhost:3000` にアクセスして動作確認

## Vercelデプロイ時の注意

Vercelにデプロイする際は、Vercel Dashboardで環境変数を再度設定する必要があります。`.env.local`ファイルの値は自動的にはVercelに反映されません。

詳しくは`VERCEL_DEPLOY_STEPS.md`を参照してください。
