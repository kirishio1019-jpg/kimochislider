-- trend_scoreカラムが存在するか確認するSQL
-- SupabaseのSQL Editorで実行してください

-- カラムの存在確認
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'local_spots'
  AND column_name = 'trend_score';

-- もし結果が空の場合は、カラムが存在しません
-- その場合は、以下のSQLを実行してください：

-- ALTER TABLE local_spots 
-- ADD COLUMN IF NOT EXISTS trend_score INTEGER DEFAULT 50 CHECK (trend_score >= 0 AND trend_score <= 100);











