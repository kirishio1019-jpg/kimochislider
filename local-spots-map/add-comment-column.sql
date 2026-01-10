-- local_spotsテーブルにcommentカラムを追加するSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: commentカラムを追加
ALTER TABLE local_spots 
ADD COLUMN IF NOT EXISTS comment TEXT;

-- ステップ2: commentカラムのコメントを追加（オプション）
COMMENT ON COLUMN local_spots.comment IS 'スポットへのコメント';

-- 確認: カラムが正しく追加されたか確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'local_spots'
  AND column_name = 'comment';




















