-- local_spotsテーブルのUPDATE操作を完全に有効にするSQL
-- SupabaseのSQL Editorで実行してください
-- このスクリプトは既存のUPDATEポリシーを統合し、すべてのカラムの更新を許可します

-- ステップ1: commentカラムが存在するか確認（存在しない場合は追加）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'local_spots' 
    AND column_name = 'comment'
  ) THEN
    ALTER TABLE local_spots ADD COLUMN comment TEXT;
    RAISE NOTICE 'commentカラムを追加しました';
  ELSE
    RAISE NOTICE 'commentカラムは既に存在します';
  END IF;
END $$;

-- ステップ2: 既存のUPDATEポリシーをすべて削除
DROP POLICY IF EXISTS "Allow public update access" ON local_spots;
DROP POLICY IF EXISTS "Allow public update likes" ON local_spots;

-- ステップ3: 包括的なUPDATEポリシーを作成（すべてのカラムの更新を許可）
CREATE POLICY "Allow public update access" ON local_spots
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- ステップ4: 関数を作成してcommentのみ更新可能にする（より安全な方法）
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

-- 関数への実行権限を付与
GRANT EXECUTE ON FUNCTION update_spot_comment(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION update_spot_comment(UUID, TEXT) TO authenticated;

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

-- 確認: commentカラムが存在するか確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'local_spots'
  AND column_name = 'comment';

