-- 現在のデータを確認するSQL
-- SupabaseのSQL Editorで実行してください

-- すべてのスポットを確認
SELECT 
  id,
  name,
  category,
  latitude,
  longitude,
  trend_score,
  created_at
FROM local_spots
ORDER BY created_at DESC;

-- データの件数を確認
SELECT COUNT(*) as total_spots FROM local_spots;























