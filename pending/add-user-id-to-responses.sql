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
