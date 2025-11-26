-- trend_scoreフィールドを追加するSQL（修正版）
-- SupabaseのSQL Editorで実行してください

-- まず、既存のカラムを削除（エラーが出る場合は無視してください）
-- ALTER TABLE local_spots DROP COLUMN IF EXISTS trend_score;

-- trend_scoreカラムを追加
ALTER TABLE local_spots 
ADD COLUMN trend_score INTEGER DEFAULT 50;

-- CHECK制約を追加
ALTER TABLE local_spots 
ADD CONSTRAINT trend_score_check CHECK (trend_score >= 0 AND trend_score <= 100);

-- 既存のデータにデフォルト値を設定
UPDATE local_spots 
SET trend_score = 50 
WHERE trend_score IS NULL;

-- trend_scoreのインデックスを作成
CREATE INDEX IF NOT EXISTS idx_local_spots_trend_score ON local_spots(trend_score DESC);

-- 確認: カラムが追加されたか確認
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'local_spots'
  AND column_name = 'trend_score';











