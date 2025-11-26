-- 既存のすべてのデータにtrend_scoreを設定するSQL
-- SupabaseのSQL Editorで実行してください

-- 既存のすべてのデータにデフォルトのtrend_scoreを設定
-- もし既にtrend_scoreが設定されている場合は変更されません
UPDATE local_spots 
SET trend_score = 50  -- デフォルト値（普通サイズ）
WHERE trend_score IS NULL OR trend_score = 50;

-- または、すべての既存データを異なるtrend_scoreに設定したい場合
-- 以下のSQLを使用してください（idに基づいて順番に設定）
-- UPDATE local_spots 
-- SET trend_score = (
--   CASE 
--     WHEN ROW_NUMBER() OVER (ORDER BY created_at) % 5 = 1 THEN 80  -- 大きめ
--     WHEN ROW_NUMBER() OVER (ORDER BY created_at) % 5 = 2 THEN 70  -- 大きめ
--     WHEN ROW_NUMBER() OVER (ORDER BY created_at) % 5 = 3 THEN 50  -- 普通
--     WHEN ROW_NUMBER() OVER (ORDER BY created_at) % 5 = 4 THEN 40  -- 小さめ
--     ELSE 30  -- 小さめ
--   END
-- );











