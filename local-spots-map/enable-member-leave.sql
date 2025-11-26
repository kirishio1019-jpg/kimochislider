-- コミュニティメンバーの脱退を有効にするSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: 現在のDELETEポリシーを確認
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'community_members'
  AND cmd = 'DELETE'
ORDER BY policyname;

-- ステップ2: ユーザーが自分のメンバーシップを削除できるポリシーを追加
DROP POLICY IF EXISTS "Allow users to delete their own memberships" ON community_members;
CREATE POLICY "Allow users to delete their own memberships" ON community_members
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    auth.uid() = user_id
  );

-- 確認: ポリシーが正しく作成されたか確認
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'community_members'
ORDER BY cmd, policyname;










