# VercelでURLを変更する方法

デプロイ成功後、VercelでURLを変更する方法は2つあります。

## 方法1: プロジェクト名を変更する（推奨）

プロジェクト名を変更すると、URLも自動的に変更されます。

### 手順

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクト `kimochislider` を選択
3. 「Settings」タブをクリック
4. 「General」セクションを開く
5. 「Project Name」のフィールドを見つける
6. プロジェクト名を変更（例: `kimochi-slider`、`kimochislider-app`など）
7. 「Save」をクリック

### 注意事項

- プロジェクト名を変更すると、URLも自動的に変更されます
  - 例: `https://kimochislider-xxxxx.vercel.app` → `https://新しい名前-xxxxx.vercel.app`
- 古いURLは自動的に新しいURLにリダイレクトされます
- プロジェクト名は英数字とハイフン（`-`）のみ使用可能です

## 方法2: カスタムドメインを設定する

独自のドメイン名を使用したい場合、カスタムドメインを設定できます。

### 手順

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクトを選択
3. 「Settings」タブをクリック
4. 「Domains」セクションを開く
5. 「Add Domain」ボタンをクリック
6. ドメイン名を入力（例: `kimochislider.com`、`kimochi-slider.jp`など）
7. DNS設定の指示に従って設定
8. ドメインの検証が完了すると、カスタムドメインでアクセス可能になります

### カスタムドメインの要件

- ドメインを所有している必要があります
- DNS設定を変更する権限が必要です
- ドメインの検証に数時間かかる場合があります

## 推奨されるプロジェクト名の例

- `kimochi-slider`
- `kimochislider-app`
- `kimochi-app`
- `kimochi-slider-app`

## 環境変数の更新

URLを変更した場合、以下の環境変数を更新する必要があります：

1. Vercel Dashboardで「Settings」→「Environment Variables」を開く
2. `NEXT_PUBLIC_APP_URL`を新しいURLに更新
3. 「Save」をクリック
4. 「Deployments」タブで最新のデプロイを選択し、「Redeploy」をクリック

## Supabaseの認証設定の更新

Google認証を使用している場合、SupabaseでリダイレクトURLも更新する必要があります：

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. 「Authentication」→「URL Configuration」を開く
4. 「Redirect URLs」に新しいURLを追加：
   ```
   https://新しいURL/auth/callback
   ```
5. 「Site URL」を更新：
   ```
   https://新しいURL
   ```
6. 「Save」をクリック

## 注意事項

- URLを変更すると、既存のブックマークや共有リンクが無効になる可能性があります
- 古いURLは自動的に新しいURLにリダイレクトされますが、完全に移行するまで時間がかかる場合があります
- カスタムドメインを使用する場合、SSL証明書の設定が自動的に行われます
