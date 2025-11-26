-- コミュニティ削除を有効にするSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: communitiesテーブルのRLSポリシーを確認
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'communities'
ORDER BY cmd, policyname;

-- ステップ2: オーナーがコミュニティを削除できるポリシーを追加
-- 既存のDELETEポリシーをすべて削除
DROP POLICY IF EXISTS "Allow owners to delete their communities" ON communities;
DROP POLICY IF EXISTS "Allow owners to delete communities" ON communities;

-- 新しいDELETEポリシーを作成
CREATE POLICY "Allow owners to delete communities" ON communities
  FOR DELETE USING (
    owner_id IS NOT NULL AND
    owner_id = auth.uid()
  );

-- 確認: ポリシーが正しく作成されたか確認
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'communities'
  AND cmd = 'DELETE'
ORDER BY policyname;

