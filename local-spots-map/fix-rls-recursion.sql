-- RLSポリシーの無限再帰を修正するSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: 既存のSELECTポリシーを確認（無限再帰の原因になっている可能性がある）
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'community_members'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- ステップ2: 問題のあるSELECTポリシーを削除（community_membersテーブル自体を参照しているもの）
DROP POLICY IF EXISTS "Allow community members to read approved members" ON community_members;

-- ステップ3: 新しいSELECTポリシーを作成（無限再帰を避けるため、community_membersテーブルを参照しない）
-- 自分のメンバーシップ情報は誰でも見られる
DROP POLICY IF EXISTS "Allow users to read their own memberships" ON community_members;
CREATE POLICY "Allow users to read their own memberships" ON community_members
  FOR SELECT USING (auth.uid() = user_id);

-- 公開コミュニティのメンバーは、そのコミュニティの承認済みメンバーを見られる
-- 注意: community_membersテーブル自体を参照せず、communitiesテーブルのみを参照
CREATE POLICY "Allow reading approved members of public communities" ON community_members
  FOR SELECT USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_members.community_id
        AND c.is_public = true
    )
  );

-- コミュニティのオーナーはすべてのメンバーシップ申請を見られる
DROP POLICY IF EXISTS "Allow owners to read all memberships" ON community_members;
CREATE POLICY "Allow owners to read all memberships" ON community_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_members.community_id
        AND c.owner_id = auth.uid()
    )
  );

-- ステップ4: INSERTポリシーを修正（無限再帰を避ける）
-- 既存のINSERTポリシーを削除（すべての可能性のあるポリシー名を直接削除）
DROP POLICY IF EXISTS "Allow public to create membership requests" ON community_members;
DROP POLICY IF EXISTS "Allow authenticated users to create memberships" ON community_members;
DROP POLICY IF EXISTS "Allow public to create membership with nickname" ON community_members;

-- 新しいINSERTポリシー: 認証済みユーザー（匿名ユーザー含む）はメンバーシップを作成可能
CREATE POLICY "Allow authenticated users to create memberships" ON community_members
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = user_id AND
    (
      -- 公開コミュニティの場合は自動承認（status = 'approved'）
      -- コミュニティのis_publicのみをチェックし、community_membersテーブルは参照しない
      (
        EXISTS (
          SELECT 1 FROM communities c
          WHERE c.id = community_members.community_id
            AND c.is_public = true
        )
        AND community_members.status = 'approved'
      )
      OR
      -- 非公開コミュニティの場合は申請（status = 'pending'）
      (
        EXISTS (
          SELECT 1 FROM communities c
          WHERE c.id = community_members.community_id
            AND c.is_public = false
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
ORDER BY cmd, policyname;
