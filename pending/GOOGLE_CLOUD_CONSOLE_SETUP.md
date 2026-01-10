# Google Cloud Console設定ガイド

## 問題の症状

- Supabase Dashboardでワイルドカードパターンを設定しても404エラーが発生する
- 一度エラーが出ても戻ると正常にログインされている

## 根本原因

Google Cloud ConsoleでOAuth 2.0 Client IDの「承認済みのリダイレクト URI」にSupabaseの認証エンドポイントが登録されていない可能性があります。

## SupabaseプロジェクトIDとは？

SupabaseプロジェクトIDは、Supabaseプロジェクトを識別する一意の文字列です。

**あなたのSupabaseプロジェクトID: `qrypddarrakhckzifaqe`**

このIDは、Supabase Dashboardの「Settings」→「API」→「Project URL」から確認できます：
- Project URL: `https://qrypddarrakhckzifaqe.supabase.co`
- プロジェクトID: `qrypddarrakhckzifaqe`（URLの`https://`と`.supabase.co`の間の部分）

## なぜGoogle Cloud Consoleに登録する必要があるのか？

Google OAuth認証の流れ：
1. ユーザーがGoogleログインボタンをクリック
2. アプリがSupabaseの認証エンドポイント（`https://qrypddarrakhckzifaqe.supabase.co/auth/v1/authorize`）にリクエスト
3. SupabaseがGoogleにリダイレクト
4. ユーザーがGoogleで認証
5. GoogleがSupabaseの認証エンドポイント（`https://qrypddarrakhckzifaqe.supabase.co/auth/v1/callback`）にリダイレクト
6. Supabaseが認証を完了してアプリにリダイレクト

**ステップ5で、GoogleがSupabaseの認証エンドポイントにリダイレクトするため、Google Cloud ConsoleにそのURLを登録する必要があります。**

## 解決方法

### ステップ1: Google Cloud ConsoleでOAuth 2.0 Client IDを確認

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを選択
3. 「APIとサービス」→「認証情報」を開く
4. 「OAuth 2.0 クライアント ID」セクションで、Supabaseで使用しているClient IDを探す
5. Client IDをクリックして詳細を開く

### ステップ2: SupabaseプロジェクトIDを確認

まず、あなたのSupabaseプロジェクトIDを確認します：

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. 「Settings」（歯車アイコン）→「API」を開く
4. 「Project URL」を確認
   - 例: `https://qrypddarrakhckzifaqe.supabase.co`
   - この場合、`qrypddarrakhckzifaqe`がプロジェクトIDです

**あなたの場合、プロジェクトIDは `qrypddarrakhckzifaqe` です。**

### ステップ3: Google Cloud Consoleで承認済みのリダイレクト URIを確認・追加

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを選択
3. 「APIとサービス」→「認証情報」を開く
4. 「OAuth 2.0 クライアント ID」セクションで、Supabaseで使用しているClient IDを探す
5. Client IDをクリックして詳細を開く
6. 「承認済みのリダイレクト URI」セクションを確認
7. 以下が登録されているか確認：
   ```
   https://qrypddarrakhckzifaqe.supabase.co/auth/v1/callback
   ```
   ⚠️ **重要**：
   - `qrypddarrakhckzifaqe`はあなたのSupabaseプロジェクトIDです（上記で確認した値）
   - `https://`で始まる
   - 末尾が`/auth/v1/callback`になっている（`/v1/`を含む）

8. 登録されていない場合は「URIを追加」をクリック
9. 上記のURLを入力
10. 「保存」をクリック

### ステップ4: Supabase DashboardでClient IDとClient Secretを確認

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. 「Authentication」→「Providers」→「Google」を開く
4. 「Client ID」と「Client Secret」が設定されているか確認
5. 設定されていない場合は、Google Cloud Consoleで取得した値を設定

### ステップ5: 動作確認

1. ブラウザのキャッシュをクリア（Ctrl+Shift+Delete）
2. 本番環境のURLにアクセス
3. Googleログインボタンをクリック
4. エラーが解消されているか確認

## 確認チェックリスト

- [ ] Google Cloud ConsoleでOAuth 2.0 Client IDが作成されている
- [ ] 「承認済みのリダイレクト URI」にSupabaseの認証エンドポイントが登録されている
- [ ] Supabase DashboardでGoogle Providerが有効化されている
- [ ] Supabase DashboardでClient IDとClient Secretが設定されている
- [ ] Supabase Dashboardで「Redirect URLs」にワイルドカードパターンが登録されている
- [ ] Supabase Dashboardで「Site URL」が設定されている

## よくある間違い

### ❌ 間違った設定例

1. **リダイレクトURIが登録されていない**
   - Google Cloud ConsoleにSupabaseの認証エンドポイントが登録されていない

2. **間違ったリダイレクトURI**
   ```
   https://qrypddarrakhckzifaqe.supabase.co/auth/callback  ← /v1/がない
   http://qrypddarrakhckzifaqe.supabase.co/auth/v1/callback  ← httpではなくhttps
   ```

3. **Client IDとClient Secretが一致していない**
   - Supabase DashboardのClient IDとGoogle Cloud ConsoleのClient IDが一致していない

### ✅ 正しい設定例

1. **Google Cloud ConsoleのリダイレクトURI**
   ```
   https://qrypddarrakhckzifaqe.supabase.co/auth/v1/callback
   ```

2. **Supabase DashboardのRedirect URLs**
   ```
   https://kimochislider.vercel.app/**
   ```

3. **Supabase DashboardのSite URL**
   ```
   https://kimochislider.vercel.app
   ```

## まだ解決しない場合

1. **Google Cloud Consoleの設定を再確認**
   - OAuth 2.0 Client IDの「承認済みのリダイレクト URI」を確認
   - Supabaseの認証エンドポイントが正確に登録されているか確認

2. **Supabase Dashboardの設定を再確認**
   - Google Providerの設定を確認
   - Client IDとClient Secretが正しいか確認

3. **ブラウザのキャッシュをクリア**
   - シークレットモードで試す
   - または、ブラウザのキャッシュを完全にクリア

4. **別のブラウザで試す**
   - Chrome、Firefox、Edgeなどで試す
