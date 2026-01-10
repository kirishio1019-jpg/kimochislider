-- スポット削除を有効にするSQL
-- SupabaseのSQL Editorで実行してください

-- パブリック削除アクセスを許可（誰でもスポットを削除可能）
DROP POLICY IF EXISTS "Allow public delete access" ON local_spots;
CREATE POLICY "Allow public delete access" ON local_spots
  FOR DELETE USING (true);






















