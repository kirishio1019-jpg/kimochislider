-- コミュニティテーブルの構造を確認するSQL
-- SupabaseのSQL Editorで実行してください

-- テーブルの存在確認
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'communities'
) AS table_exists;

-- カラムの一覧を確認
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'communities'
ORDER BY ordinal_position;

-- 現在のRLSポリシーを確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'communities';










