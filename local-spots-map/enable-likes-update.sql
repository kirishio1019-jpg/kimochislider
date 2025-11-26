-- likesカラムの更新を許可するRLSポリシーを追加
-- SupabaseのSQL Editorで実行してください

-- パブリック更新アクセスを許可（likesカラムのみ）
DROP POLICY IF EXISTS "Allow public update likes" ON local_spots;
CREATE POLICY "Allow public update likes" ON local_spots
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- または、より安全な方法として、likesカラムのみ更新可能にする
-- 注意: この方法はSupabaseのRLSでは直接サポートされていないため、
-- 上記のポリシーを使用するか、関数を作成して使用してください

-- 関数を作成してlikesのみ更新可能にする（推奨）
CREATE OR REPLACE FUNCTION update_spot_likes(spot_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_likes INTEGER;
BEGIN
  UPDATE local_spots
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = spot_id
  RETURNING likes INTO new_likes;
  
  RETURN new_likes;
END;
$$;

-- 関数への実行権限を付与
GRANT EXECUTE ON FUNCTION update_spot_likes(UUID) TO anon;











