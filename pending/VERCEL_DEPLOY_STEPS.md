# Vercelデプロイ手順（簡易版）

## 前提条件

✅ GitHubリポジトリ: `kirishio1019-jpg/kimochislider` にプッシュ済み
✅ Supabaseプロジェクトが作成済み
✅ ローカルの`.env.local`ファイルに環境変数が設定済み

## ステップ1: Vercelにログイン

1. [Vercel](https://vercel.com)にアクセス
2. 「Sign Up」または「Log In」をクリック
3. GitHubアカウントでログイン（推奨）

## ステップ2: プロジェクトをインポート

1. Vercel Dashboardで「Add New...」→「Project」をクリック
2. 「Import Git Repository」を選択
3. GitHubリポジトリ一覧から `kirishio1019-jpg/kimochislider` を選択
4. 「Import」をクリック

## ステップ3: プロジェクト設定

**重要**: 以下の設定を確認してください。通常は自動検出されますが、念のため確認します。

### Framework Preset
- **Next.js** を選択（自動検出されるはずですが、表示されていることを確認）
- もし表示されていない場合は、ドロップダウンから「Next.js」を選択

### Root Directory
- **`pending`** に変更してください
  - ⚠️ **重要**: Gitリポジトリのルートが`.cursor`ディレクトリのため、`package.json`がある`pending`ディレクトリを指定する必要があります
  - Root Directoryのフィールドに `pending` と入力してください

### Build and Output Settings

「Build and Output Settings」セクションを開いて、以下の設定を確認：

- **Build Command**: `npm run build`
  - もし空欄や異なる値が入っている場合は、`npm run build`と入力
- **Output Directory**: `.next`（変更不要）
  - Next.jsの標準的な出力ディレクトリです
- **Install Command**: `npm install`（デフォルト、変更不要）
- **Node.js Version**: `20.x` または最新のLTSバージョン（自動設定されるはず）

### その他の設定

- **Environment**: `Production`（デフォルト）
- **Override**: 通常はチェックを入れない（デフォルト設定を使用）

### 設定の確認ポイント

✅ Framework Presetが「Next.js」になっているか  
✅ Build Commandが`npm run build`になっているか  
✅ **Root Directoryが`pending`になっているか**（重要！）  
✅ Output Directoryが`.next`になっているか（または空欄）

**注意**: これらの設定が正しくないと、デプロイが失敗する可能性があります。

## ステップ4: 環境変数の設定

**重要**: デプロイ前に環境変数を設定してください。

1. 「Environment Variables」セクションを開く
2. 「Add New」または「Add」ボタンをクリック
3. 以下の3つの環境変数を**1つずつ**追加します：

### 環境変数1: NEXT_PUBLIC_SUPABASE_URL

- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `.env.local`ファイルの`NEXT_PUBLIC_SUPABASE_URL`の値をコピーして貼り付け
  - 例: `https://abcdefghijklmnop.supabase.co`
- 「Save」をクリック

### 環境変数2: NEXT_PUBLIC_SUPABASE_ANON_KEY

- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `.env.local`ファイルの`NEXT_PUBLIC_SUPABASE_ANON_KEY`の値をコピーして貼り付け
  - 例: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMn0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- 「Save」をクリック

### 環境変数3: NEXT_PUBLIC_APP_URL

- **Key**: `NEXT_PUBLIC_APP_URL`
- **Value**: 一時的に `https://your-app-name.vercel.app` と入力（後で実際のURLに更新）
- 「Save」をクリック

⚠️ **注意**:
- `.env.local`ファイルから値をコピーして設定してください
- `NEXT_PUBLIC_APP_URL`は一時的に`https://your-app-name.vercel.app`と設定（後で更新）
- 値の前後に余分なスペースや引用符を入れないでください

### 環境変数の確認方法

ローカルの`.env.local`ファイルを開いて、以下の値を確認してください：

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**重要**: `.env.local`ファイルの`NEXT_PUBLIC_APP_URL`の値（`http://localhost:3000`）は使わず、一時的に`https://your-app-name.vercel.app`と入力してください。デプロイ後に実際のURLに更新します。

## ステップ5: デプロイ

**デプロイ前の最終確認**:

✅ Framework Preset: Next.js  
✅ Build Command: `npm run build`  
✅ **Root Directory: `pending`**（重要！）  
✅ Output Directory: `.next`  
✅ 環境変数が3つすべて設定されているか確認

### デプロイ実行

1. 上記の設定を確認したら、「Deploy」ボタンをクリック
2. ビルドが完了するまで待機（通常1-3分）
   - ビルドログが表示されるので、エラーがないか確認してください
3. デプロイ完了後、Vercelが発行したURLを確認（例: `https://kimochislider-xxxxx.vercel.app`）

### ビルドエラーが発生した場合

ビルドエラーが発生した場合は、以下の手順で確認してください：

1. ビルドログを確認してエラーメッセージを読む
2. ローカルでビルドを実行して確認：
   ```powershell
   cd c:\Users\kiris\.cursor\pending
   npm run build
   ```
3. エラーが解決できない場合は、エラーメッセージをメモしてトラブルシューティングセクションを参照

## ステップ6: 環境変数の更新

デプロイ後、発行されたURLを確認して、環境変数を更新：

1. Vercel Dashboardでプロジェクトを選択
2. 「Settings」→「Environment Variables」を開く
3. `NEXT_PUBLIC_APP_URL`を実際のURLに更新：
   ```
   NEXT_PUBLIC_APP_URL=https://kimochislider-xxxxx.vercel.app
   ```
4. 「Save」をクリック
5. 「Deployments」タブで最新のデプロイを選択し、「Redeploy」をクリック

## ステップ7: Supabaseの認証設定

Google認証を使用している場合、SupabaseでリダイレクトURLを設定：

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. 「Authentication」→「URL Configuration」を開く
4. 「Redirect URLs」に以下を追加：
   ```
   https://your-app-name.vercel.app/auth/callback
   ```
   ⚠️ `your-app-name.vercel.app`を実際のVercel URLに置き換えてください

5. 「Site URL」を更新：
   ```
   https://your-app-name.vercel.app
   ```
6. 「Save」をクリック

## ステップ8: 動作確認

デプロイ後、以下を確認してください：

1. ✅ トップページが表示されるか
2. ✅ Googleログインが動作するか
3. ✅ イベント作成が動作するか
4. ✅ イベントページが表示されるか
5. ✅ スライダーが動作するか
6. ✅ 回答が保存されるか

## トラブルシューティング

### ビルドエラーが発生する場合

1. ローカルでビルドを確認：
   ```powershell
   cd c:\Users\kiris\.cursor\pending
   npm run build
   ```

2. エラーメッセージを確認して修正

3. TypeScriptのエラーがないか確認：
   ```powershell
   npx tsc --noEmit
   ```

### 環境変数が反映されない場合

1. Vercel Dashboardで環境変数が正しく設定されているか確認
2. 環境変数の値に余分なスペースや引用符がないか確認
3. 再デプロイを実行（環境変数変更後は再デプロイが必要）

### Supabase接続エラーが発生する場合

1. `NEXT_PUBLIC_SUPABASE_URL`と`NEXT_PUBLIC_SUPABASE_ANON_KEY`が正しいか確認
2. Supabaseプロジェクトがアクティブか確認
3. RLS（Row Level Security）ポリシーが正しく設定されているか確認

## 継続的なデプロイ

GitHubリポジトリと連携しているため、`main`ブランチへのプッシュで自動的にデプロイされます。

## 次のステップ

デプロイが完了したら：
1. **URLの変更**（オプション）
   - プロジェクト名を変更してURLを変更できます
   - 詳細は`VERCEL_URL_CHANGE.md`を参照してください
2. カスタムドメインの設定（オプション）
3. アナリティクスの設定（オプション）
4. パフォーマンスの最適化
