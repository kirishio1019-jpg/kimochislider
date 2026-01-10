# Networkタブで404エラーを診断する方法

## 問題の症状

- すべての設定が完璧にセットされている
- しかし、まだ404エラーが発生する

## 診断方法：Networkタブで確認

### ステップ1: ブラウザの開発者ツールを開く

1. 本番環境のURLにアクセス
2. F12キーで開発者ツールを開く
3. 「Network」タブを選択
4. 「Clear」ボタンをクリックして既存のリクエストをクリア

### ステップ2: Googleログインボタンをクリック

1. Googleログインボタンをクリック
2. Networkタブでリクエストを確認

### ステップ3: 404エラーが発生しているリクエストを特定

Networkタブで以下のリクエストを確認：

#### 1. `auth/v1/authorize`へのリクエスト

- **Name**: `authorize` または `auth/v1/authorize`
- **Status**: 200（成功）または 404（エラー）
- **Type**: `xhr` または `fetch`
- **URL**: `https://qrypddarrakhckzifaqe.supabase.co/auth/v1/authorize?...`

**404エラーが発生している場合：**
- Status: `404`
- Response: `{"error":"NOT_FOUND",...}`

#### 2. その他のリクエスト

- Google OAuthへのリダイレクト
- その他のSupabase APIリクエスト

### ステップ4: エラーの詳細を確認

404エラーが発生しているリクエストをクリックして、以下を確認：

1. **Headersタブ**
   - Request URL: 実際にリクエストされたURL
   - Request Method: GET または POST
   - Status Code: 404

2. **Responseタブ**
   - エラーメッセージの内容
   - エラーコード
   - エラーの詳細

3. **Previewタブ**
   - エラーレスポンスの構造化された表示

## 考えられる原因と解決方法

### 原因1: Supabase認証エンドポイントが404を返している

**症状：**
- Networkタブで`auth/v1/authorize`へのリクエストが404を返している

**解決方法：**
1. Supabase Dashboardでプロジェクトの状態を確認
2. Supabaseのサポートに問い合わせ
3. プロジェクトを再作成する（最後の手段）

### 原因2: リクエストURLが間違っている

**症状：**
- NetworkタブでリクエストURLが期待と異なる

**解決方法：**
1. コンソールログで`🔵 [Network Debug] Will request:`のURLを確認
2. 実際のリクエストURLと比較
3. 不一致がある場合は、Supabase URLの設定を確認

### 原因3: CORSエラー

**症状：**
- NetworkタブでCORSエラーが表示される

**解決方法：**
1. Supabase DashboardでCORS設定を確認
2. リクエストのOriginヘッダーを確認

### 原因4: ブラウザのセキュリティ設定

**症状：**
- 特定のブラウザでのみエラーが発生する

**解決方法：**
1. 別のブラウザで試す
2. ブラウザのセキュリティ設定を確認
3. シークレットモードで試す

## 確認すべき情報

Networkタブで以下の情報を確認してください：

1. **404エラーが発生しているリクエストのURL**
   - 例: `https://qrypddarrakhckzifaqe.supabase.co/auth/v1/authorize?provider=google&...`

2. **リクエストのステータスコード**
   - 200: 成功
   - 404: エラー

3. **レスポンスの内容**
   - エラーメッセージ
   - エラーコード

4. **リクエストヘッダー**
   - Origin
   - Referer
   - User-Agent

## 次のステップ

Networkタブで確認した情報を共有してください：

1. 404エラーが発生しているリクエストのURL
2. ステータスコード
3. レスポンスの内容
4. リクエストヘッダー（特にOriginとReferer）

これらの情報から、原因を特定できます。
