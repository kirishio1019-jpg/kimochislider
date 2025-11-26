-- メンバー数の取得を修正するRLSポリシー
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

-- ステップ2: すべての承認済みメンバーシップを読み取れるようにする
-- 無限再帰を避けるため、community_membersテーブルを参照しない方法を使う

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Allow community members to read approved members" ON community_members;

-- 新しいポリシー: 承認済みメンバーシップを読み取れる条件
-- 注意: community_membersテーブル自体を参照しない（無限再帰を避ける）
CREATE POLICY "Allow community members to read approved members" ON community_members
  FOR SELECT USING (
    status = 'approved' AND
    (
      -- ケース1: 自分自身のメンバーシップ
      auth.uid() = user_id
      OR
      -- ケース2: コミュニティのオーナー（すべてのメンバーシップを見られる）
      EXISTS (
        SELECT 1 FROM communities c
        WHERE c.id = community_members.community_id
          AND c.owner_id = auth.uid()
      )
      OR
      -- ケース3: 公開コミュニティの承認済みメンバーは誰でも見られる
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

