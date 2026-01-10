-- ALiveRallyとAilabのオーナーにメンバーシップを追加（RLSをバイパス）
-- SupabaseのSQL Editorで実行してください
-- 注意: このSQLはサービスロールで実行するか、RLSを一時的に無効化して実行してください

-- ステップ1: ALiveRallyとAilabのコミュニティ情報を確認
SELECT 
  c.id as community_id,
  c.name as community_name,
  c.owner_id,
  c.is_public,
  COUNT(cm.id) as current_member_count
FROM communities c
LEFT JOIN community_members cm ON cm.community_id = c.id AND cm.status = 'approved'
WHERE (c.name LIKE '%ALiveRally%' 
   OR c.name LIKE '%AliveRally%'
   OR c.name LIKE '%aliverally%'
   OR c.slug LIKE '%aliverally%'
   OR c.name LIKE '%Ailab%'
   OR c.name LIKE '%ailab%'
   OR c.slug LIKE '%ailab%')
GROUP BY c.id, c.name, c.owner_id, c.is_public;

-- ステップ2: RLSを一時的に無効化してメンバーシップを追加
-- 注意: この方法はSupabaseのSQL Editorでは動作しない可能性があります
-- 代わりに、サービスロールキーを使用するか、RLSポリシーを修正してください

-- 方法1: 直接INSERT（RLSポリシーが許可している場合）
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
    role = 'owner',
    updated_at = NOW();

-- ステップ3: 確認（メンバーシップが追加されたか確認）
SELECT 
  c.id as community_id,
  c.name as community_name,
  c.owner_id,
  COUNT(cm.id) as member_count,
  STRING_AGG(cm.user_id::text || ' (' || cm.role || ')', ', ') as members
FROM communities c
LEFT JOIN community_members cm ON cm.community_id = c.id AND cm.status = 'approved'
WHERE (c.name LIKE '%ALiveRally%' 
   OR c.name LIKE '%AliveRally%'
   OR c.name LIKE '%aliverally%'
   OR c.slug LIKE '%aliverally%'
   OR c.name LIKE '%Ailab%'
   OR c.name LIKE '%ailab%'
   OR c.slug LIKE '%ailab%')
GROUP BY c.id, c.name, c.owner_id
ORDER BY c.name;



















