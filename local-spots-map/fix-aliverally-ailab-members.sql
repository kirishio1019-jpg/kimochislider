-- ALiveRallyとAilabのメンバーシップを復元するSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: ALiveRallyとAilabのコミュニティ情報を確認
SELECT 
  c.id as community_id,
  c.name as community_name,
  c.owner_id,
  c.is_public,
  c.created_at,
  COUNT(cm.id) as member_count
FROM communities c
LEFT JOIN community_members cm ON cm.community_id = c.id AND cm.status = 'approved'
WHERE c.name LIKE '%ALiveRally%' 
   OR c.name LIKE '%AliveRally%'
   OR c.name LIKE '%aliverally%'
   OR c.slug LIKE '%aliverally%'
   OR c.name LIKE '%Ailab%'
   OR c.name LIKE '%ailab%'
   OR c.slug LIKE '%ailab%'
GROUP BY c.id, c.name, c.owner_id, c.is_public, c.created_at;

-- ステップ2: これらのコミュニティの現在のメンバーシップを確認
SELECT 
  cm.id as membership_id,
  cm.community_id,
  c.name as community_name,
  cm.user_id,
  cm.status,
  cm.role,
  cm.created_at
FROM community_members cm
JOIN communities c ON c.id = cm.community_id
WHERE c.name LIKE '%ALiveRally%' 
   OR c.name LIKE '%AliveRally%'
   OR c.name LIKE '%aliverally%'
   OR c.slug LIKE '%aliverally%'
   OR c.name LIKE '%Ailab%'
   OR c.name LIKE '%ailab%'
   OR c.slug LIKE '%ailab%'
ORDER BY c.name, cm.created_at;

-- ステップ3: オーナーにメンバーシップを追加（存在しない場合のみ）
INSERT INTO community_members (community_id, user_id, status, role)
SELECT 
  c.id as community_id,
  c.owner_id as user_id,
  'approved' as status,
  'owner' as role
FROM communities c
WHERE (c.name LIKE '%ALiveRally%' 
   OR c.name LIKE '%AliveRally%'
   OR c.name LIKE '%aliverally%'
   OR c.slug LIKE '%aliverally%'
   OR c.name LIKE '%Ailab%'
   OR c.name LIKE '%ailab%'
   OR c.slug LIKE '%ailab%')
  AND c.owner_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM community_members cm
    WHERE cm.community_id = c.id
      AND cm.user_id = c.owner_id
  )
ON CONFLICT (community_id, user_id) DO UPDATE
SET status = 'approved',
    role = 'owner';

-- ステップ4: 過去にメンバーシップがあったユーザーを確認（コミュニティ作成者以外）
-- 注意: これは履歴がない場合は復元できません
-- もし過去のメンバーシップデータがあれば、ここで復元できます

-- ステップ5: 確認（メンバーシップが追加されたか確認）
SELECT 
  c.id as community_id,
  c.name as community_name,
  c.owner_id,
  COUNT(cm.id) as member_count,
  STRING_AGG(cm.user_id::text, ', ') as member_user_ids
FROM communities c
LEFT JOIN community_members cm ON cm.community_id = c.id AND cm.status = 'approved'
WHERE c.name LIKE '%ALiveRally%' 
   OR c.name LIKE '%AliveRally%'
   OR c.name LIKE '%aliverally%'
   OR c.slug LIKE '%aliverally%'
   OR c.name LIKE '%Ailab%'
   OR c.name LIKE '%ailab%'
   OR c.slug LIKE '%ailab%'
GROUP BY c.id, c.name, c.owner_id
ORDER BY c.name;




















