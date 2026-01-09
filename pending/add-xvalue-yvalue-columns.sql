-- responsesテーブルにxValueとyValueカラムを追加
ALTER TABLE responses ADD COLUMN IF NOT EXISTS x_value INTEGER CHECK (x_value >= 0 AND x_value <= 100);
ALTER TABLE responses ADD COLUMN IF NOT EXISTS y_value INTEGER CHECK (y_value >= 0 AND y_value <= 100);

-- 既存のscoreからxValueとyValueを逆算（score = (xValue + yValue) / 2）
-- 既存データの互換性のため、scoreをxValueとyValueに設定
UPDATE responses 
SET x_value = score, y_value = score 
WHERE x_value IS NULL OR y_value IS NULL;
