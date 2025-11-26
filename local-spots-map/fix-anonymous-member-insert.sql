-- 匿名ユーザーでもメンバーシップを作成できるようにRLSポリシーを修正
-- SupabaseのSQL Editorで実行してください

-- ステップ1: 既存のINSERTポリシーをすべて確認
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'community_members' 
  AND cmd = 'INSERT';

-- ステップ2: 既存のポリシーを削除（すべての可能性のあるポリシー名を削除）
DO $$
BEGIN
  -- 既存のINSERTポリシーをすべて削除
  DROP POLICY IF EXISTS "Allow public to create membership requests" ON community_members;
  DROP POLICY IF EXISTS "Allow authenticated users to create memberships" ON community_members;
  DROP POLICY IF EXISTS "Allow public to create membership with nickname" ON community_members;
  
  -- 念のため、すべてのINSERTポリシーを削除（動的に削除）
  FOR r IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'community_members' 
      AND cmd = 'INSERT'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON community_members', r.policyname);
  END LOOP;
END $$;

-- ステップ3: 新しいポリシー: 認証済みユーザー（匿名ユーザー含む）はメンバーシップを作成可能
-- 注意: community_membersテーブル自体を参照しないように注意（無限再帰を避けるため）
CREATE POLICY "Allow authenticated users to create memberships" ON community_members
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = user_id AND
    (
      -- 公開コミュニティの場合は自動承認（status = 'approved'）
      -- コミュニティのis_publicのみをチェックし、community_membersテーブルは参照しない
      EXISTS (
        SELECT 1 FROM communities c
        WHERE c.id = community_members.community_id
          AND c.is_public = true
      )
      AND community_members.status = 'approved'
      OR
      -- 非公開コミュニティの場合は申請（status = 'pending'）
      EXISTS (
        SELECT 1 FROM communities c
        WHERE c.id = community_members.community_id
          AND c.is_public = false
      )
      AND community_members.status = 'pending'
    )
  );

-- 確認: ポリシーが正しく作成されたか確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'community_members'
ORDER BY policyname;

