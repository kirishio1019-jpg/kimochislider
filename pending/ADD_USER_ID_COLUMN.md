# `user_id`カラム追加手順

## エラー内容

```
送信に失敗しました: Could not find the 'user_id' column of 'responses' in the schema cache
```

このエラーは、`responses`テーブルに`user_id`カラムが存在しないために発生しています。

## 解決方法

Supabase Dashboardで以下のSQLを実行してください。

### ステップ1: Supabase Dashboardにアクセス

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. 左側のメニューから「**SQL Editor**」をクリック
4. 「**New query**」をクリック

### ステップ2: SQLを実行

以下のSQLをコピーして、SQL Editorに貼り付け、実行してください：

```sql
-- responsesテーブルにuser_idカラムを追加し、一人一イベントにつき一つの回答を保持するようにするSQL
-- Supabase DashboardのSQL Editorで実行してください

-- ステップ1: user_idカラムを追加
ALTER TABLE responses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ステップ2: インデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_responses_user_id ON responses(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_event_user ON responses(event_id, user_id);

-- ステップ3: event_idとuser_idのユニーク制約を追加（一人一イベントにつき一つの回答）
-- ただし、user_idがNULLの場合は複数許可（匿名ユーザー）
CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_event_user_unique 
ON responses(event_id, user_id) 
WHERE user_id IS NOT NULL;

-- ステップ4: RLSポリシーを更新（ユーザーは自分の回答を更新できる）
DROP POLICY IF EXISTS "Users can update their own responses" ON responses;
CREATE POLICY "Users can update their own responses" ON responses
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ステップ5: ユーザーは自分の回答を削除できる
DROP POLICY IF EXISTS "Users can delete their own responses" ON responses;
CREATE POLICY "Users can delete their own responses" ON responses
  FOR DELETE 
  USING (auth.uid() = user_id);
```

### ステップ3: 実行結果を確認

SQLを実行後、以下のメッセージが表示されれば成功です：

- `Success. No rows returned`
- または、各ステップごとに成功メッセージが表示される

### ステップ4: 動作確認

1. アプリに戻る
2. イベントページで「気持ちを保存する」をクリック
3. エラーが解消されているか確認

## 確認方法

SQLを実行する前に、現在のテーブル構造を確認できます：

```sql
-- responsesテーブルの構造を確認
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'responses'
ORDER BY ordinal_position;
```

このクエリで、`user_id`カラムが存在するかどうかを確認できます。

## トラブルシューティング

### エラーが続く場合

1. **ブラウザのキャッシュをクリア**して、再度試してください
2. **Supabase Dashboardでテーブル構造を確認**してください：
   - 左側のメニューから「**Table Editor**」をクリック
   - 「**responses**」テーブルを選択
   - 「**View table structure**」をクリック
   - `user_id`カラムが存在するか確認

3. **SQLを再実行**してください（`IF NOT EXISTS`を使用しているので、安全に再実行できます）

## 注意事項

- このSQLは既存のデータを削除しません
- `user_id`がNULLの既存レコードはそのまま残ります（匿名ユーザーの回答）
- ログインしているユーザーの回答は、`user_id`が設定されます
