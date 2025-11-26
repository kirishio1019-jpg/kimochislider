-- trend_scoreフィールドを追加するSQL
-- SupabaseのSQL Editorで実行してください

-- trend_scoreカラムを追加（既存のテーブルに追加する場合）
ALTER TABLE local_spots 
ADD COLUMN IF NOT EXISTS trend_score INTEGER DEFAULT 50 CHECK (trend_score >= 0 AND trend_score <= 100);

-- trend_scoreのインデックスを作成（オプション、パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_local_spots_trend_score ON local_spots(trend_score DESC);

-- 既存のデータにデフォルト値を設定（trend_scoreがNULLの場合）
UPDATE local_spots 
SET trend_score = 50 
WHERE trend_score IS NULL;











