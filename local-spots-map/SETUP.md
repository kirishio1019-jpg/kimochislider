# セットアップガイド

このガイドでは、アプリを動かすための環境変数設定とSupabaseのセットアップ方法を説明します。

## 1. 環境変数の設定

### ステップ1: `.env.local`ファイルを作成

`local-spots-map`ディレクトリの直下に`.env.local`というファイルを作成してください。

### ステップ2: 環境変数を設定

`.env.local`ファイルに以下の内容をコピーして、実際の値を設定してください：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mapbox設定
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token
```

### ステップ3: Supabaseの認証情報を取得

1. [Supabase](https://supabase.com/)にアクセスしてアカウントを作成（無料）
2. 新しいプロジェクトを作成
3. プロジェクトの設定画面（Settings → API）で以下を取得：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`に設定
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`に設定

### ステップ4: Mapboxの認証情報を取得

1. [Mapbox](https://www.mapbox.com/)にアクセスしてアカウントを作成（無料）
2. [Account page](https://account.mapbox.com/)にアクセス
3. **Access tokens**セクションで**Default public token**をコピー
4. → `NEXT_PUBLIC_MAPBOX_TOKEN`に設定

## 2. SupabaseスキーマSQLの実行

### SupabaseスキーマSQLとは？

`supabase-schema.sql`ファイルには、データベースのテーブル構造を定義するSQLコードが書かれています。これをSupabaseで実行することで、アプリが使うデータベーステーブルが作成されます。

### 実行手順

1. Supabaseのダッシュボードにログイン
2. 左側のメニューから**SQL Editor**をクリック
3. **New query**ボタンをクリック
4. `supabase-schema.sql`ファイルの内容をすべてコピー
5. SQL Editorのテキストエリアに貼り付け
6. **Run**ボタン（または`Ctrl+Enter`）をクリック
7. 成功メッセージが表示されれば完了！

### 確認方法

SQL Editorの実行後、左側のメニューから**Table Editor**をクリックして、`local_spots`テーブルが作成されているか確認してください。サンプルデータも5件挿入されているはずです。

## 3. 開発サーバーの起動

環境変数とSupabaseの設定が完了したら、開発サーバーを起動します：

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いて、地図アプリが表示されることを確認してください！

## トラブルシューティング

### 地図が表示されない場合
- `.env.local`ファイルに`NEXT_PUBLIC_MAPBOX_TOKEN`が正しく設定されているか確認
- ブラウザのコンソール（F12）でエラーメッセージを確認

### スポットが表示されない場合
- `.env.local`ファイルにSupabaseの認証情報が正しく設定されているか確認
- SupabaseのSQL Editorで`local_spots`テーブルが作成されているか確認
- SupabaseのTable Editorでデータが存在するか確認

### エラーが出る場合
- `.env.local`ファイルは`local-spots-map`ディレクトリの直下に配置されているか確認
- 開発サーバーを再起動してみてください（`Ctrl+C`で停止してから`npm run dev`で再起動）











