-- スポット作成を有効にするSQL
-- SupabaseのSQL Editorで実行してください

-- パブリック作成アクセスを許可（誰でもスポットを作成可能）
DROP POLICY IF EXISTS "Allow public insert access" ON local_spots;
CREATE POLICY "Allow public insert access" ON local_spots
  FOR INSERT WITH CHECK (true);










