-- クマップ以外のコミュニティで重複しているデフォルト地図を1つにまとめるSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: クマップ以外のコミュニティのデフォルト地図を確認
SELECT 
  c.id as community_id,
  c.name as community_name,
  m.id as map_id,
  m.name as map_name,
  m.created_at,
  COUNT(*) OVER (PARTITION BY c.id) as map_count
FROM communities c
JOIN maps m ON m.community_id = c.id
WHERE m.name = 'デフォルト地図'
  AND c.name != 'クマップ'
ORDER BY c.id, m.created_at;

-- ステップ2: クマップ以外のコミュニティで最も古いデフォルト地図を1つ残し、残りを削除
-- 注意: この操作は不可逆です。実行前に上記のSELECTで確認してください

-- 各コミュニティ（クマップ以外）で最も古いデフォルト地図のIDを取得し、それ以外を削除
WITH default_maps AS (
  SELECT 
    m.id,
    m.community_id,
    m.created_at,
    ROW_NUMBER() OVER (PARTITION BY m.community_id ORDER BY m.created_at ASC) as rn
  FROM maps m
  JOIN communities c ON c.id = m.community_id
  WHERE m.name = 'デフォルト地図'
    AND c.name != 'クマップ'
),
maps_to_delete AS (
  SELECT id
  FROM default_maps
  WHERE rn > 1
)
-- 削除対象の地図に紐づいているスポットを、残す地図に移動
UPDATE local_spots
SET map_id = (
  SELECT dm.id
  FROM default_maps dm
  WHERE dm.community_id = local_spots.community_id
    AND dm.rn = 1
  LIMIT 1
)
WHERE map_id IN (SELECT id FROM maps_to_delete)
  AND EXISTS (
    SELECT 1 FROM communities c
    WHERE c.id = local_spots.community_id
      AND c.name != 'クマップ'
  );

-- 重複しているデフォルト地図を削除（クマップ以外）
DELETE FROM maps
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      m.id,
      ROW_NUMBER() OVER (PARTITION BY m.community_id ORDER BY m.created_at ASC) as rn
    FROM maps m
    JOIN communities c ON c.id = m.community_id
    WHERE m.name = 'デフォルト地図'
      AND c.name != 'クマップ'
  ) ranked
  WHERE rn > 1
);

-- ステップ3: 確認（クマップ以外の各コミュニティにデフォルト地図が1つだけあることを確認）
SELECT 
  c.id as community_id,
  c.name as community_name,
  COUNT(m.id) as default_map_count
FROM communities c
LEFT JOIN maps m ON m.community_id = c.id AND m.name = 'デフォルト地図'
WHERE c.name != 'クマップ'
GROUP BY c.id, c.name
HAVING COUNT(m.id) > 1
ORDER BY c.id;

-- 結果が0行であれば、重複は解消されています







