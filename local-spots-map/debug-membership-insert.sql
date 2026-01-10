-- メンバーシップ作成時のデバッグ用SQL
-- SupabaseのSQL Editorで実行してください

-- 1. 現在のRLSポリシーを確認
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'community_members'
ORDER BY cmd, policyname;

-- 2. コミュニティの公開設定を確認
SELECT 
  id,
  name,
  is_public,
  owner_id
FROM communities
ORDER BY created_at DESC
LIMIT 10;

-- 3. 既存のメンバーシップを確認
SELECT 
  id,
  community_id,
  user_id,
  status,
  role,
  created_at
FROM community_members
ORDER BY created_at DESC
LIMIT 10;

-- 4. 現在のユーザーIDを確認（認証済みの場合）
SELECT auth.uid() as current_user_id;






















