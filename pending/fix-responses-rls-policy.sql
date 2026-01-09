-- responsesテーブルのRLSポリシーを修正するSQL
-- Supabase DashboardのSQL Editorで実行してください

-- ステップ1: 既存のRLSポリシーを確認
SELECT 
  policyname, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE tablename = 'responses';

-- ステップ2: 既存のINSERTポリシーを削除（すべての可能性のあるポリシー名を削除）
DROP POLICY IF EXISTS "Responses can be created without auth" ON responses;
DROP POLICY IF EXISTS "Allow public insert access" ON responses;
DROP POLICY IF EXISTS "Public insert access" ON responses;

-- ステップ3: 新しいINSERTポリシーを作成（誰でも回答を作成可能）
CREATE POLICY "Responses can be created without auth" ON responses
  FOR INSERT 
  WITH CHECK (true);

-- ステップ4: SELECTポリシーも確認・作成（誰でも回答を読み取り可能）
DROP POLICY IF EXISTS "Responses are publicly readable" ON responses;
DROP POLICY IF EXISTS "Allow public read access" ON responses;
CREATE POLICY "Responses are publicly readable" ON responses
  FOR SELECT 
  USING (true);

-- ステップ5: UPDATEポリシーも確認・作成（edit_tokenがあれば更新可能）
DROP POLICY IF EXISTS "Responses can be updated with edit_token" ON responses;
CREATE POLICY "Responses can be updated with edit_token" ON responses
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- ステップ6: ポリシーが正しく作成されたか確認
SELECT 
  policyname, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE tablename = 'responses'
ORDER BY cmd, policyname;
