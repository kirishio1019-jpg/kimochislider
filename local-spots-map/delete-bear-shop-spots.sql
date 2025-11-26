-- ショップカテゴリで登録されている「熊」スポットを削除するSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: 削除対象のスポットを確認
SELECT 
  id,
  name,
  category,
  description,
  latitude,
  longitude,
  community_id,
  created_at
FROM local_spots
WHERE category = 'shop'
  AND (name LIKE '%熊%' OR name LIKE '%くま%' OR name LIKE '%クマ%')
ORDER BY created_at;

-- ステップ2: 削除対象のスポット数を確認
SELECT COUNT(*) as delete_count
FROM local_spots
WHERE category = 'shop'
  AND (name LIKE '%熊%' OR name LIKE '%くま%' OR name LIKE '%クマ%');

-- ステップ3: スポットを削除
DELETE FROM local_spots
WHERE category = 'shop'
  AND (name LIKE '%熊%' OR name LIKE '%くま%' OR name LIKE '%クマ%');

-- ステップ4: 確認（削除されたか確認）
SELECT COUNT(*) as remaining_count
FROM local_spots
WHERE category = 'shop'
  AND (name LIKE '%熊%' OR name LIKE '%くま%' OR name LIKE '%クマ%');








