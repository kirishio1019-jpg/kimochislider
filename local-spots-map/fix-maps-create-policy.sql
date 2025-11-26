-- mapsテーブルの地図作成RLSポリシーを修正するSQL
-- SupabaseのSQL Editorで実行してください
-- 地図の新規作成はコミュニティオーナーのみに制限します

-- 既存のINSERTポリシーを削除
DROP POLICY IF EXISTS "Allow authenticated users to create maps" ON maps;

-- 新しいINSERTポリシー: コミュニティオーナーのみが地図を作成可能
CREATE POLICY "Allow community owners to create maps" ON maps
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = maps.community_id
        AND c.owner_id = auth.uid()
    )
  );

-- SELECTポリシーも確認・修正（コミュニティオーナーや公開コミュニティの場合は、メンバーシップがなくても地図を見られるように）
DROP POLICY IF EXISTS "Allow community members to read maps" ON maps;
CREATE POLICY "Allow community members to read maps" ON maps
  FOR SELECT USING (
    -- コミュニティメンバー（承認済み）
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = maps.community_id
        AND cm.user_id = auth.uid()
        AND cm.status = 'approved'
    )
    OR
    -- コミュニティオーナー（メンバーシップがなくても見られる）
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = maps.community_id
        AND c.owner_id = auth.uid()
    )
    OR
    -- 公開コミュニティの場合は誰でも見られる
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = maps.community_id
        AND c.is_public = true
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
WHERE tablename = 'maps'
  AND cmd = 'INSERT';


