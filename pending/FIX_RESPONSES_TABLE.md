# レスポンス保存エラーの解決方法

## エラー内容

「気持ちを保存する」ボタンを押すと「送信に失敗しました。もう一度お試しください。」というエラーが発生する場合、データベースに必要なカラムが追加されていない可能性があります。

## 解決方法

### ステップ1: Supabase DashboardでSQLを実行

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. 左側のメニューから「**SQL Editor**」をクリック
4. 「**New query**」をクリック

### ステップ2: 必要なカラムを追加

以下のSQLをコピーして、SQL Editorに貼り付け、実行してください：

**重要**: 以下のSQLは、`user_id`カラムを含むすべての必要なカラムを追加します。

```sql
-- ステップ1: user_idカラムを追加（Googleログイン機能に必要）
ALTER TABLE responses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ステップ2: インデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_responses_user_id ON responses(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_event_user ON responses(event_id, user_id);

-- ステップ3: event_idとuser_idのユニーク制約を追加（一人一イベントにつき一つの回答）
-- ただし、user_idがNULLの場合は複数許可（匿名ユーザー）
CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_event_user_unique 
ON responses(event_id, user_id) 
WHERE user_id IS NOT NULL;

-- ステップ4: is_confirmedカラムを追加
ALTER TABLE responses ADD COLUMN IF NOT EXISTS is_confirmed BOOLEAN DEFAULT false;

-- ステップ5: x_valueとy_valueカラムを追加
ALTER TABLE responses ADD COLUMN IF NOT EXISTS x_value INTEGER CHECK (x_value >= 0 AND x_value <= 100);
ALTER TABLE responses ADD COLUMN IF NOT EXISTS y_value INTEGER CHECK (y_value >= 0 AND y_value <= 100);

-- ステップ6: 既存データの互換性のため、scoreをxValueとyValueに設定
UPDATE responses 
SET x_value = score, y_value = score 
WHERE x_value IS NULL OR y_value IS NULL;

-- ステップ7: RLSポリシーを更新（ユーザーは自分の回答を更新できる）
DROP POLICY IF EXISTS "Users can update their own responses" ON responses;
CREATE POLICY "Users can update their own responses" ON responses
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ステップ8: ユーザーは自分の回答を削除できる
DROP POLICY IF EXISTS "Users can delete their own responses" ON responses;
CREATE POLICY "Users can delete their own responses" ON responses
  FOR DELETE 
  USING (auth.uid() = user_id);
```

**または、個別のSQLファイルを使用する場合：**

1. `add-user-id-to-responses.sql` - `user_id`カラムの追加
2. `fix-responses-rls-policy.sql` - RLSポリシーの修正

### ステップ3: 動作確認

1. SQLを実行後、イベントページにアクセス
2. 「気持ちを保存する」ボタンをクリック
3. エラーが解消されているか確認

## エラーの詳細を確認する方法

エラーが続く場合、ブラウザの開発者ツールで詳細を確認できます：

1. ブラウザの開発者ツール（F12）を開く
2. 「Console」タブを選択
3. 「気持ちを保存する」ボタンをクリック
4. コンソールに表示されるエラーメッセージを確認：
   - `Failed to submit response:` で始まるログ
   - `Error code:` で始まるログ
   - `Error message:` で始まるログ

## よくあるエラー

### エラー: column "is_confirmed" does not exist

**原因**: `is_confirmed`カラムが追加されていない

**解決策**: 上記のSQLを実行してカラムを追加

### エラー: column "x_value" does not exist

**原因**: `x_value`カラムが追加されていない

**解決策**: 上記のSQLを実行してカラムを追加

### エラー: column "y_value" does not exist

**原因**: `y_value`カラムが追加されていない

**解決策**: 上記のSQLを実行してカラムを追加

### エラー: Could not find the 'user_id' column of 'responses' in the schema cache

**原因**: `user_id`カラムが追加されていない（Googleログイン機能に必要）

**解決策**: 上記のSQLを実行して`user_id`カラムを追加。詳細は`ADD_USER_ID_COLUMN.md`を参照してください。

### エラー: new row violates row-level security policy

**原因**: RLSポリシーが正しく設定されていない

**解決策**: 以下のSQLを実行してRLSポリシーを確認・修正：

**方法1: 専用のSQLファイルを使用（推奨）**

`fix-responses-rls-policy.sql`ファイルの内容をSupabase DashboardのSQL Editorで実行してください。

**方法2: 手動でSQLを実行**

```sql
-- 既存のINSERTポリシーを削除
DROP POLICY IF EXISTS "Responses can be created without auth" ON responses;
DROP POLICY IF EXISTS "Allow public insert access" ON responses;
DROP POLICY IF EXISTS "Public insert access" ON responses;

-- 新しいINSERTポリシーを作成（誰でも回答を作成可能）
CREATE POLICY "Responses can be created without auth" ON responses
  FOR INSERT 
  WITH CHECK (true);

-- SELECTポリシーも確認・作成
DROP POLICY IF EXISTS "Responses are publicly readable" ON responses;
CREATE POLICY "Responses are publicly readable" ON responses
  FOR SELECT 
  USING (true);

-- UPDATEポリシーも確認・作成
DROP POLICY IF EXISTS "Responses can be updated with edit_token" ON responses;
CREATE POLICY "Responses can be updated with edit_token" ON responses
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);
```

## 確認チェックリスト

- [ ] Supabase DashboardでSQL Editorを開いた
- [ ] 必要なカラムを追加するSQLを実行した
- [ ] SQLの実行が成功した（エラーが出ていない）
- [ ] イベントページで「気持ちを保存する」を試した
- [ ] エラーが解消された
