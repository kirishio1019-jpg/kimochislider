-- カテゴリ機能を追加するSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: categoriesテーブルを作成
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- カテゴリ名（例: "レストラン"）
  slug TEXT NOT NULL UNIQUE, -- URL用のスラッグ（例: "restaurant"）
  color TEXT NOT NULL DEFAULT '#6B7280', -- カテゴリの色（HEX形式）
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE, -- コミュニティID（nullの場合はグローバルカテゴリ）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_categories_community_id ON categories(community_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Row Level Security (RLS) を有効化
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- パブリック読み取りアクセスを許可
DROP POLICY IF EXISTS "Allow public read access" ON categories;
CREATE POLICY "Allow public read access" ON categories
  FOR SELECT USING (true);

-- パブリック作成アクセスを許可（誰でもカテゴリを作成可能）
DROP POLICY IF EXISTS "Allow public insert access" ON categories;
CREATE POLICY "Allow public insert access" ON categories
  FOR INSERT WITH CHECK (true);

-- パブリック更新アクセスを許可（誰でもカテゴリを更新可能）
DROP POLICY IF EXISTS "Allow public update access" ON categories;
CREATE POLICY "Allow public update access" ON categories
  FOR UPDATE USING (true) WITH CHECK (true);

-- パブリック削除アクセスを許可（誰でもカテゴリを削除可能）
DROP POLICY IF EXISTS "Allow public delete access" ON categories;
CREATE POLICY "Allow public delete access" ON categories
  FOR DELETE USING (true);

-- ステップ2: local_spotsテーブルのcategoryカラムをTEXTに変更（既存のCHECK制約を削除）
ALTER TABLE local_spots 
DROP CONSTRAINT IF EXISTS local_spots_category_check;

ALTER TABLE local_spots 
ALTER COLUMN category TYPE TEXT;

-- ステップ3: デフォルトカテゴリを追加（既存のスポット用）
INSERT INTO categories (id, name, slug, color, community_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'レストラン', 'restaurant', '#EF4444', NULL),
  ('00000000-0000-0000-0000-000000000002', 'ショップ', 'shop', '#F59E0B', NULL),
  ('00000000-0000-0000-0000-000000000003', '文化', 'culture', '#10B981', NULL),
  ('00000000-0000-0000-0000-000000000004', '施設', 'facility', '#3B82F6', NULL)
ON CONFLICT (id) DO NOTHING;

-- 確認: カテゴリが作成されたか確認
SELECT id, name, slug, color FROM categories ORDER BY name;

