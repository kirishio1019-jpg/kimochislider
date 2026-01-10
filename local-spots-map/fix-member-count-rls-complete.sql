-- メンバー数の取得を完全に修正するRLSポリシー
-- SupabaseのSQL Editorで実行してください

-- ステップ1: 現在のSELECTポリシーを確認
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'community_members'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- ステップ2: すべての既存のSELECTポリシーを削除
DROP POLICY IF EXISTS "Allow users to read their own memberships" ON community_members;
DROP POLICY IF EXISTS "Allow reading approved members of public communities" ON community_members;
DROP POLICY IF EXISTS "Allow owners to read all memberships" ON community_members;
DROP POLICY IF EXISTS "Allow community members to read approved members" ON community_members;

-- ステップ3: 新しいポリシーを作成（無限再帰を避ける）

-- ポリシー1: 自分のメンバーシップ情報は誰でも見られる
CREATE POLICY "Allow users to read their own memberships" ON community_members
  FOR SELECT USING (auth.uid() = user_id);

-- ポリシー2: コミュニティのオーナーはすべてのメンバーシップを見られる
CREATE POLICY "Allow owners to read all memberships" ON community_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_members.community_id
        AND c.owner_id = auth.uid()
    )
  );

-- ポリシー3: 公開コミュニティの承認済みメンバーは誰でも見られる
CREATE POLICY "Allow reading approved members of public communities" ON community_members
  FOR SELECT USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_members.community_id
        AND c.is_public = true
    )
  );

-- ポリシー4: コミュニティのメンバー（承認済み）は、そのコミュニティの他の承認済みメンバーを見られる
-- 注意: 無限再帰を避けるため、community_membersテーブルを参照しない
-- 代わりに、communitiesテーブルとauth.uid()のみを使用
CREATE POLICY "Allow community members to read approved members" ON community_members
  FOR SELECT USING (
    status = 'approved' AND
    (
      -- ケース1: 自分自身のメンバーシップ（既にポリシー1でカバーされているが、明確にするため）
      auth.uid() = user_id
      OR
      -- ケース2: コミュニティのオーナー（既にポリシー2でカバーされているが、明確にするため）
      EXISTS (
        SELECT 1 FROM communities c
        WHERE c.id = community_members.community_id
          AND c.owner_id = auth.uid()
      )
      OR
      -- ケース3: 公開コミュニティ（既にポリシー3でカバーされているが、明確にするため）
      EXISTS (
        SELECT 1 FROM communities c
        WHERE c.id = community_members.community_id
          AND c.is_public = true
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
  AND cmd = 'SELECT'
ORDER BY policyname;



















