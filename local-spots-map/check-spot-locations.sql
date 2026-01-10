-- スポットの座標を確認するSQL
-- SupabaseのSQL Editorで実行してください

-- すべてのスポットの名前、座標、trend_scoreを表示
SELECT 
  id,
  name,
  latitude,
  longitude,
  trend_score,
  category
FROM local_spots
ORDER BY latitude, longitude;

-- 同じ座標（または非常に近い座標）のスポットを確認
SELECT 
  latitude,
  longitude,
  COUNT(*) as spot_count,
  STRING_AGG(name, ', ') as spot_names
FROM local_spots
GROUP BY latitude, longitude
HAVING COUNT(*) > 1
ORDER BY spot_count DESC;























