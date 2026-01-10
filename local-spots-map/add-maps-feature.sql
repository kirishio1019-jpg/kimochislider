-- コミュニティ内で複数の地図を管理する機能を追加するSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: mapsテーブルを作成
CREATE TABLE IF NOT EXISTS maps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_maps_community_id ON maps(community_id);
CREATE INDEX IF NOT EXISTS idx_maps_created_by ON maps(created_by);

-- ステップ2: local_spotsテーブルにmap_idカラムを追加
ALTER TABLE local_spots 
ADD COLUMN IF NOT EXISTS map_id UUID REFERENCES maps(id) ON DELETE SET NULL;

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_local_spots_map_id ON local_spots(map_id);

-- ステップ3: Row Level Security (RLS) を有効化
ALTER TABLE maps ENABLE ROW LEVEL SECURITY;

-- パブリック読み取りアクセス（コミュニティメンバーは地図を見られる）
DROP POLICY IF EXISTS "Allow community members to read maps" ON maps;
CREATE POLICY "Allow community members to read maps" ON maps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = maps.community_id
        AND cm.user_id = auth.uid()
        AND cm.status = 'approved'
    )
  );

-- 認証済みユーザーは地図を作成可能（コミュニティメンバーのみ）
DROP POLICY IF EXISTS "Allow authenticated users to create maps" ON maps;
CREATE POLICY "Allow authenticated users to create maps" ON maps
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = maps.community_id
        AND cm.user_id = auth.uid()
        AND cm.status = 'approved'
    )
  );

-- 地図作成者またはコミュニティオーナーは地図を更新可能
DROP POLICY IF EXISTS "Allow map creators and owners to update maps" ON maps;
CREATE POLICY "Allow map creators and owners to update maps" ON maps
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = maps.community_id
        AND c.owner_id = auth.uid()
    )
  );

-- 地図作成者またはコミュニティオーナーは地図を削除可能
DROP POLICY IF EXISTS "Allow map creators and owners to delete maps" ON maps;
CREATE POLICY "Allow map creators and owners to delete maps" ON maps
  FOR DELETE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = maps.community_id
        AND c.owner_id = auth.uid()
    )
  );

-- 確認: mapsテーブルが作成されたか確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'maps'
ORDER BY ordinal_position;

-- 確認: local_spotsにmap_idカラムが追加されたか確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'local_spots' AND column_name = 'map_id';




















