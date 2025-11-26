-- コミュニティ機能を追加するSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: communitiesテーブルを作成
CREATE TABLE IF NOT EXISTS communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL, -- URL用のスラッグ（例: "akita-local"）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_communities_slug ON communities(slug);

-- Row Level Security (RLS) を有効化
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- パブリック読み取りアクセスを許可
DROP POLICY IF EXISTS "Allow public read access" ON communities;
CREATE POLICY "Allow public read access" ON communities
  FOR SELECT USING (true);

-- パブリック作成アクセスを許可（誰でもコミュニティを作成可能）
DROP POLICY IF EXISTS "Allow public insert access" ON communities;
CREATE POLICY "Allow public insert access" ON communities
  FOR INSERT WITH CHECK (true);

-- ステップ2: local_spotsテーブルにcommunity_idカラムを追加
ALTER TABLE local_spots 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id) ON DELETE CASCADE;

-- インデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_local_spots_community_id ON local_spots(community_id);

-- ステップ3: デフォルトコミュニティを作成（既存のスポット用）
INSERT INTO communities (id, name, description, slug)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'デフォルトコミュニティ',
  'すべての既存スポットを含むデフォルトコミュニティ',
  'default'
)
ON CONFLICT (id) DO NOTHING;

-- ステップ4: 既存のスポットにデフォルトコミュニティIDを設定
UPDATE local_spots 
SET community_id = '00000000-0000-0000-0000-000000000000'
WHERE community_id IS NULL;

-- 確認: コミュニティとスポットの関連を確認
SELECT 
  c.id as community_id,
  c.name as community_name,
  c.slug,
  COUNT(ls.id) as spot_count
FROM communities c
LEFT JOIN local_spots ls ON c.id = ls.community_id
GROUP BY c.id, c.name, c.slug
ORDER BY c.created_at DESC;










