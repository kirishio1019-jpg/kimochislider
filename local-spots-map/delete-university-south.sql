-- 「大学南一丁目」スポットを削除するSQL
-- SupabaseのSQL Editorで実行してください

-- まず、該当するスポットを確認
SELECT id, name, community_id, description
FROM local_spots 
WHERE name LIKE '%大学南一丁目%' 
   OR name LIKE '%大学南%'
   OR description LIKE '%大学南%'
   OR name LIKE '%南一丁目%';

-- 削除を実行（確認後、上記のSELECTで該当するスポットを確認してから実行してください）
DELETE FROM local_spots 
WHERE name LIKE '%大学南一丁目%' 
   OR name LIKE '%大学南%'
   OR description LIKE '%大学南%'
   OR name LIKE '%南一丁目%';

-- 削除結果を確認（0件になれば成功）
SELECT COUNT(*) as remaining_count 
FROM local_spots 
WHERE name LIKE '%大学南一丁目%' 
   OR name LIKE '%大学南%'
   OR description LIKE '%大学南%'
   OR name LIKE '%南一丁目%';

