-- オーナーが作成したコミュニティに自動的に参加できるようにRLSポリシーを修正
-- SupabaseのSQL Editorで実行してください

-- ステップ1: 既存のINSERTポリシーを確認
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'community_members' 
  AND cmd = 'INSERT';

-- ステップ2: 既存のINSERTポリシーを削除
DROP POLICY IF EXISTS "Allow authenticated users to create memberships" ON community_members;

-- ステップ3: 新しいINSERTポリシーを作成
-- オーナーが自分で作成したコミュニティに自動的に参加できるようにする
CREATE POLICY "Allow authenticated users to create memberships" ON community_members
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = user_id AND
    (
      -- ケース1: オーナーが自分で作成したコミュニティに自動的に参加（status = 'approved', role = 'owner'）
      (
        EXISTS (
          SELECT 1 FROM communities c
          WHERE c.id = community_members.community_id
            AND c.owner_id = auth.uid()
        )
        AND community_members.status = 'approved'
        AND community_members.role = 'owner'
      )
      OR
      -- ケース2: 公開コミュニティの場合は自動承認（status = 'approved'）
      (
        EXISTS (
          SELECT 1 FROM communities c
          WHERE c.id = community_members.community_id
            AND c.is_public = true
            AND (c.owner_id IS NULL OR c.owner_id != auth.uid()) -- オーナーでない場合のみ
        )
        AND community_members.status = 'approved'
      )
      OR
      -- ケース3: 非公開コミュニティの場合は申請（status = 'pending'）
      (
        EXISTS (
          SELECT 1 FROM communities c
          WHERE c.id = community_members.community_id
            AND c.is_public = false
            AND (c.owner_id IS NULL OR c.owner_id != auth.uid()) -- オーナーでない場合のみ
        )
        AND community_members.status = 'pending'
      )
    )
  );

-- 確認: ポリシーが正しく作成されたか確認
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'community_members'
  AND cmd = 'INSERT'
ORDER BY policyname;




















