-- RLSポリシーの無限再帰を修正するSQL（シンプル版）
-- SupabaseのSQL Editorで実行してください

-- ステップ1: 問題のあるSELECTポリシーを削除
DROP POLICY IF EXISTS "Allow community members to read approved members" ON community_members;

-- ステップ2: 自分のメンバーシップ情報は誰でも見られる
DROP POLICY IF EXISTS "Allow users to read their own memberships" ON community_members;
CREATE POLICY "Allow users to read their own memberships" ON community_members
  FOR SELECT USING (auth.uid() = user_id);

-- ステップ3: 公開コミュニティの承認済みメンバーは見られる
CREATE POLICY "Allow reading approved members of public communities" ON community_members
  FOR SELECT USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_members.community_id
        AND c.is_public = true
    )
  );

-- ステップ4: コミュニティのオーナーはすべてのメンバーシップ申請を見られる
DROP POLICY IF EXISTS "Allow owners to read all memberships" ON community_members;
CREATE POLICY "Allow owners to read all memberships" ON community_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_members.community_id
        AND c.owner_id = auth.uid()
    )
  );

-- ステップ5: 既存のINSERTポリシーを削除
DROP POLICY IF EXISTS "Allow public to create membership requests" ON community_members;
DROP POLICY IF EXISTS "Allow authenticated users to create memberships" ON community_members;
DROP POLICY IF EXISTS "Allow public to create membership with nickname" ON community_members;

-- ステップ6: 新しいINSERTポリシーを作成
CREATE POLICY "Allow authenticated users to create memberships" ON community_members
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = user_id AND
    (
      -- 公開コミュニティの場合は自動承認
      (
        EXISTS (
          SELECT 1 FROM communities c
          WHERE c.id = community_members.community_id
            AND c.is_public = true
        )
        AND community_members.status = 'approved'
      )
      OR
      -- 非公開コミュニティの場合は申請
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






















