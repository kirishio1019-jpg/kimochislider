-- 重なっているスポットを修正するSQL
-- SupabaseのSQL Editorで実行してください

-- 方法1: 同じ座標のスポットを少しずつずらす
-- 注意: このSQLは既存のデータを変更します

-- 同じ座標のスポットを見つけて、少しずつずらす
WITH ranked_spots AS (
  SELECT 
    id,
    name,
    latitude,
    longitude,
    ROW_NUMBER() OVER (PARTITION BY latitude, longitude ORDER BY created_at) as rn
  FROM local_spots
)
UPDATE local_spots ls
SET 
  latitude = rs.latitude + (rs.rn - 1) * 0.001,  -- 約100mずつずらす
  longitude = rs.longitude + (rs.rn - 1) * 0.001
FROM ranked_spots rs
WHERE ls.id = rs.id AND rs.rn > 1;

-- または、手動で座標を変更したい場合は、以下のSQLで確認してから
-- Table Editorで個別に座標を変更してください

-- 重なっているスポットを確認
SELECT 
  id,
  name,
  latitude,
  longitude,
  trend_score
FROM local_spots
WHERE (latitude, longitude) IN (
  SELECT latitude, longitude
  FROM local_spots
  GROUP BY latitude, longitude
  HAVING COUNT(*) > 1
)
ORDER BY latitude, longitude, name;











