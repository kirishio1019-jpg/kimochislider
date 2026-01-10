-- 国際教養大学コミュニティを削除するSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: コミュニティIDを確認
SELECT id, name, slug, is_public, owner_id, created_at
FROM communities
WHERE name LIKE '%国際教養大学%' 
   OR name LIKE '%AIU%'
   OR name LIKE '%aiu%'
   OR slug LIKE '%aiu%'
   OR slug LIKE '%international%';

-- ステップ2: 関連するメンバーシップを確認
SELECT cm.id, cm.community_id, cm.user_id, cm.status, cm.role, c.name as community_name
FROM community_members cm
JOIN communities c ON c.id = cm.community_id
WHERE c.name LIKE '%国際教養大学%' 
   OR c.name LIKE '%AIU%'
   OR c.name LIKE '%aiu%'
   OR c.slug LIKE '%aiu%';

-- ステップ3: 関連するスポットを確認
SELECT ls.id, ls.name, ls.community_id, c.name as community_name
FROM local_spots ls
JOIN communities c ON c.id = ls.community_id
WHERE c.name LIKE '%国際教養大学%' 
   OR c.name LIKE '%AIU%'
   OR c.name LIKE '%aiu%'
   OR c.slug LIKE '%aiu%';

-- ステップ4: コミュニティを削除（CASCADEでメンバーシップとスポットも自動削除）
DELETE FROM communities
WHERE name LIKE '%国際教養大学%' 
   OR name LIKE '%AIU%'
   OR name LIKE '%aiu%'
   OR slug LIKE '%aiu%'
   OR slug LIKE '%international%';

-- ステップ5: 確認（削除されたか確認）
SELECT id, name, slug
FROM communities
WHERE name LIKE '%国際教養大学%' 
   OR name LIKE '%AIU%'
   OR name LIKE '%aiu%'
   OR slug LIKE '%aiu%';




















