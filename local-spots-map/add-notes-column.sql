-- local_spotsテーブルにnotesカラムを追加するSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: notesカラムを追加
ALTER TABLE local_spots 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- ステップ2: notesカラムのコメントを追加（オプション）
COMMENT ON COLUMN local_spots.notes IS 'スポットについての記録・メモ（どんな場所で何がおすすめか）';

-- 確認: カラムが正しく追加されたか確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'local_spots'
  AND column_name = 'notes';





















