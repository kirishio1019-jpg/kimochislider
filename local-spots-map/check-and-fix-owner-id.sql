-- コミュニティのowner_idを確認・修正するSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: 現在のowner_idの状態を確認
SELECT 
  id,
  name,
  slug,
  owner_id,
  created_at
FROM communities
ORDER BY created_at DESC;

-- ステップ2: owner_idがNULLのコミュニティを確認
SELECT 
  id,
  name,
  slug,
  owner_id,
  created_at
FROM communities
WHERE owner_id IS NULL
ORDER BY created_at DESC;

-- ステップ3: 特定のコミュニティのowner_idを手動で設定する場合
-- 以下のSQLを実行して、コミュニティ名とユーザーIDを確認してから更新してください

-- 例: 「秋田観光」コミュニティのowner_idを設定する場合
-- まず、コミュニティIDとユーザーIDを確認
-- SELECT id, name FROM communities WHERE name = '秋田観光';
-- SELECT id, email FROM auth.users; -- または、アプリでユーザーIDを確認

-- その後、以下のように更新（COMMUNITY_IDとUSER_IDを実際の値に置き換える）
-- UPDATE communities 
-- SET owner_id = 'USER_ID_HERE'
-- WHERE id = 'COMMUNITY_ID_HERE';

-- ステップ4: コミュニティ作成者のメンバーシップからowner_idを推測する方法
-- 最初に作成されたメンバーシップのuser_idをowner_idとして設定する
-- （注意: これは推測に基づく方法です）
UPDATE communities c
SET owner_id = (
  SELECT user_id 
  FROM community_members cm
  WHERE cm.community_id = c.id
  ORDER BY cm.created_at ASC
  LIMIT 1
)
WHERE c.owner_id IS NULL
AND EXISTS (
  SELECT 1 
  FROM community_members cm
  WHERE cm.community_id = c.id
);

-- 確認: 更新後の状態を確認
SELECT 
  id,
  name,
  slug,
  owner_id,
  created_at
FROM communities
ORDER BY created_at DESC;










