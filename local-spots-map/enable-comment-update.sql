-- local_spotsテーブルのcommentカラムの更新を許可するRLSポリシーを追加
-- SupabaseのSQL Editorで実行してください

-- パブリック更新アクセスを許可（commentカラムを含むすべてのカラムを更新可能）
DROP POLICY IF EXISTS "Allow public update access" ON local_spots;
CREATE POLICY "Allow public update access" ON local_spots
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- または、より安全な方法として、commentカラムのみ更新可能にする関数を作成（推奨）
-- 注意: 上記のポリシーを使用する場合は、この関数は不要です

-- 関数を作成してcommentのみ更新可能にする（オプション）
CREATE OR REPLACE FUNCTION update_spot_comment(spot_id UUID, new_comment TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE local_spots
  SET comment = new_comment
  WHERE id = spot_id;
  
  RETURN FOUND;
END;
$$;

-- 関数への実行権限を付与（オプション）
GRANT EXECUTE ON FUNCTION update_spot_comment(UUID, TEXT) TO anon;

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
WHERE tablename = 'local_spots'
  AND cmd = 'UPDATE';




















