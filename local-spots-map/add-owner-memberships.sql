-- 既存のコミュニティのオーナーにメンバーシップを追加するSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: オーナーがいるがメンバーシップがないコミュニティを確認
SELECT 
  c.id as community_id,
  c.name as community_name,
  c.owner_id,
  c.is_public,
  cm.id as membership_id
FROM communities c
LEFT JOIN community_members cm ON cm.community_id = c.id AND cm.user_id = c.owner_id
WHERE c.owner_id IS NOT NULL
  AND cm.id IS NULL
ORDER BY c.created_at;

-- ステップ2: オーナーにメンバーシップを追加
INSERT INTO community_members (community_id, user_id, status, role)
SELECT 
  c.id as community_id,
  c.owner_id as user_id,
  'approved' as status,
  'owner' as role
FROM communities c
WHERE c.owner_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM community_members cm
    WHERE cm.community_id = c.id
      AND cm.user_id = c.owner_id
  )
ON CONFLICT (community_id, user_id) DO UPDATE
SET status = 'approved',
    role = 'owner';

-- ステップ3: 確認（オーナーにメンバーシップが追加されたか確認）
SELECT 
  c.id as community_id,
  c.name as community_name,
  c.owner_id,
  cm.id as membership_id,
  cm.status,
  cm.role
FROM communities c
LEFT JOIN community_members cm ON cm.community_id = c.id AND cm.user_id = c.owner_id
WHERE c.owner_id IS NOT NULL
ORDER BY c.created_at;



















