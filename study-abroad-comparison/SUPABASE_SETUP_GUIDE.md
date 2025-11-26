# Supabase セットアップガイド（詳細版）

このガイドでは、Googleログイン機能を使用するためにSupabaseを設定する方法を詳しく説明します。

## 目次
1. [Supabaseアカウント作成とプロジェクト作成](#1-supabaseアカウント作成とプロジェクト作成)
2. [Supabase認証情報の取得](#2-supabase認証情報の取得)
3. [Google認証の設定](#3-google認証の設定)
4. [環境変数の設定](#4-環境変数の設定)
5. [動作確認](#5-動作確認)

---

## 1. Supabaseアカウント作成とプロジェクト作成

### ステップ1-1: Supabaseアカウントを作成

1. [Supabase公式サイト](https://supabase.com/)にアクセス
2. 右上の「Start your project」または「Sign in」をクリック
3. GitHubアカウントでサインアップ（推奨）またはメールアドレスでサインアップ

### ステップ1-2: 新しいプロジェクトを作成

1. ダッシュボードにログイン後、「New Project」をクリック
2. 以下の情報を入力：
   - **Name**: プロジェクト名（例: `study-abroad-app`）
   - **Database Password**: 強力なパスワードを設定（必ずメモしてください）
   - **Region**: 日本なら `Northeast Asia (Tokyo)` を選択（または最寄りのリージョン）
   - **Pricing Plan**: 無料プラン（Free）を選択

3. 「Create new project」をクリック
4. プロジェクトの作成には2-3分かかります。完了するまで待ちましょう。

---

## 2. Supabase認証情報の取得

プロジェクトが作成されたら、アプリで使用する認証情報を取得します。

### ステップ2-1: プロジェクト設定を開く

1. 左サイドバーの「⚙️ Settings」（歯車アイコン）をクリック
2. 「API」をクリック

### ステップ2-2: 認証情報をコピー

「Project API keys」セクションで、以下の2つをコピーします：

1. **Project URL**
   - 「Project URL」の下にあるURLをコピー
   - 例: `https://xxxxxxxxxxxxx.supabase.co`

2. **anon public key**
   - 「Project API keys」セクションの「anon public」の右側にある「👁️ Reveal」をクリック
   - 表示された長い文字列をコピー
   - 例: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（長い文字列）

⚠️ **重要**: これらの情報は後で使用するので、メモ帳などに保存しておいてください。

---

## 3. Google認証の設定

Googleログインを使用するには、Google Cloud ConsoleでOAuth認証情報を作成し、Supabaseに設定する必要があります。

### 💰 料金について

**重要**: Google OAuth認証（Googleログイン機能）は**完全に無料**で使用できます！

- ✅ Google Cloud Consoleのアカウント作成：**無料**
- ✅ OAuth 2.0認証情報の作成：**無料**
- ✅ Googleログイン機能の使用：**無料**（個人・小規模アプリの場合）
- ✅ プロジェクトの作成：**無料**

料金が発生するのは、以下のような場合のみです：
- 非常に大量のAPI呼び出し（通常の個人アプリでは発生しません）
- 高度なIdentity Platformの機能を使用する場合

**このアプリでは、Googleログイン機能だけを使うので、完全に無料です！** 安心してセットアップを進めてください。

### ステップ3-1: Google Cloud Consoleでプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. アカウントでログイン
3. 上部のプロジェクト選択ドロップダウンをクリック
4. 「New Project」をクリック
5. プロジェクト名を入力（例: `Study Abroad App`）
6. 「Create」をクリック
7. 作成したプロジェクトを選択

### ステップ3-2: OAuth同意画面を設定

1. 左サイドメニューから「APIとサービス」→「OAuth同意画面」を選択
2. ユーザータイプを選択：
   - **外部**を選択（個人アカウントの場合は外部で問題ありません）
   - 「作成」をクリック

3. アプリ情報を入力：
   - **アプリ名**: アプリの名前（例: `Study Abroad Platform`）
   - **ユーザーサポートメール**: 自分のメールアドレス
   - **アプリのロゴ**: （任意）アプリのロゴをアップロード
   - **アプリのホームページ**: （任意）アプリのURL

4. 「保存して次へ」をクリック
5. スコープの設定はデフォルトのままで「保存して次へ」
6. テストユーザーは後で追加できるので、今は「保存して次へ」
7. 概要を確認して「ダッシュボードに戻る」をクリック

### ステップ3-3: OAuth 2.0認証情報を作成

1. 左サイドメニューから「APIとサービス」→「認証情報」を選択
2. 上部の「+ 認証情報を作成」をクリック
3. 「OAuth 2.0 クライアント ID」を選択

4. アプリケーションの種類を選択：
   - **ウェブアプリケーション**を選択

5. 認証情報の詳細を入力：
   - **名前**: `Study Abroad App Web Client`（任意の名前）
   
   - **承認済みの JavaScript 生成元**:
     - `http://localhost:3000` を追加（開発環境用）
     - 本番環境がある場合は、そのURLも追加（例: `https://your-domain.com`）

   - **承認済みのリダイレクト URI**:
     - まず、SupabaseのプロジェクトURLを確認
       - Supabaseダッシュボード → Settings → API → Project URL
       - 例: `https://xxxxxxxxxxxxx.supabase.co`
     
     - 以下の形式でリダイレクトURIを追加：
       ```
       https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback
       ```
       ※ `xxxxxxxxxxxxx` の部分をあなたのSupabaseプロジェクトURLに置き換えてください
     
     - 開発環境用にも追加（任意）:
       ```
       http://localhost:3000/auth/callback
       ```

6. 「作成」をクリック
7. **Client ID**と**Client Secret**が表示されます
   - これらをコピーしてメモ帳に保存してください
   - ⚠️ **Client Secretは今しか表示されません**。必ずコピーしてください！

### ステップ3-4: SupabaseでGoogle認証を有効化

1. Supabaseダッシュボードに戻る
2. 左サイドバーの「🔐 Authentication」をクリック
3. 「Providers」タブをクリック
4. 「Google」を探して、その行をクリック
5. 「Enable Google provider」をクリック
6. 以下の情報を入力：
   - **Client ID (for OAuth)**: ステップ3-3でコピーしたGoogle Client ID
   - **Client Secret (for OAuth)**: ステップ3-3でコピーしたGoogle Client Secret

7. 「Save」をクリック

---

## 4. 環境変数の設定

プロジェクトに環境変数を設定します。

### ステップ4-1: .env.localファイルを作成

1. プロジェクトのルートディレクトリ（`study-abroad-comparison`フォルダ）を開く
2. 新しいファイルを作成し、名前を `.env.local` に設定
   - ⚠️ 先頭のドット（`.`）を忘れずに！

### ステップ4-2: 環境変数を記述

`.env.local`ファイルに以下の内容を貼り付け、実際の値を入力してください：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**置き換え方法**:
- `https://xxxxxxxxxxxxx.supabase.co` → ステップ2-2でコピーした**Project URL**
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` → ステップ2-2でコピーした**anon public key**

**完成例**:
```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### ステップ4-3: ファイルを保存

`.env.local`ファイルを保存します。

⚠️ **重要**: 
- `.env.local`ファイルは`.gitignore`に含まれているため、Gitにコミットされません（セキュリティ上安全です）
- このファイルには機密情報が含まれているため、他の人と共有しないでください

---

## 5. 動作確認

### ステップ5-1: 開発サーバーを再起動

環境変数を変更したので、開発サーバーを再起動する必要があります。

1. 現在実行中の開発サーバーを停止（ターミナルで `Ctrl + C`）
2. 開発サーバーを再起動：

```bash
npm run dev
```

### ステップ5-2: ログイン機能を確認

1. ブラウザで [http://localhost:3000](http://localhost:3000) を開く
2. ナビゲーションバーの右上に「Googleでログイン」ボタンが表示されていることを確認
3. 「Googleでログイン」をクリック
4. Googleアカウント選択画面が表示されることを確認
5. Googleアカウントを選択してログイン
6. ログイン後、ナビゲーションバーに自分のGoogleアカウント名が表示されることを確認

### ステップ5-3: レビュー投稿を確認

1. 「レビュー投稿」ボタンをクリック
2. フォームに情報を入力して投稿
3. レビューが正常に投稿されることを確認
4. 投稿したレビューの詳細ページを開く
5. 「編集する」ボタンが表示されることを確認（自分のレビューなので）

---

## トラブルシューティング

### 問題1: ログインボタンが表示されない

**原因**: 環境変数が正しく設定されていない、または開発サーバーが再起動されていない

**解決方法**:
1. `.env.local`ファイルの内容を確認
2. 環境変数名が正しいか確認（`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`）
3. 開発サーバーを再起動
4. ブラウザのコンソール（F12）でエラーがないか確認

### 問題2: Googleログイン時にエラーが発生する

**原因**: Google OAuth認証情報が正しく設定されていない

**解決方法**:
1. Supabaseダッシュボード → Authentication → Providers → Google で設定を確認
2. Client IDとClient Secretが正しく入力されているか確認
3. Google Cloud Console → 認証情報 で、リダイレクトURIが正しく設定されているか確認
   - `https://your-project-ref.supabase.co/auth/v1/callback` の形式であることを確認

### 問題3: 環境変数が読み込まれない

**原因**: `.env.local`ファイルの場所が間違っている、またはフォーマットが間違っている

**解決方法**:
1. `.env.local`ファイルがプロジェクトのルートディレクトリ（`package.json`がある場所）にあることを確認
2. ファイル名が正確に `.env.local` であることを確認（`.env.local.txt` などではない）
3. 環境変数の値に余分なスペースや引用符がないか確認
4. 開発サーバーを再起動

---

## 完了！

これでSupabaseのセットアップが完了しました。Googleログイン機能を使用して、レビューの投稿・編集・削除ができるようになりました。

質問や問題がある場合は、上記のトラブルシューティングを参照するか、エラーメッセージを確認してください。

