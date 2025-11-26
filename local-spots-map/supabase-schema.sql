-- Supabaseテーブル作成用SQL
-- SupabaseのSQL Editorで実行してください

-- local_spotsテーブルを作成
CREATE TABLE IF NOT EXISTS local_spots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('restaurant', 'shop', 'culture')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  image_url TEXT,
  opening_hours TEXT,
  is_open_now BOOLEAN,
  hotness_score INTEGER CHECK (hotness_score >= 0 AND hotness_score <= 100),
  accessibility_score INTEGER CHECK (accessibility_score >= 0 AND accessibility_score <= 100),
  trend_score INTEGER DEFAULT 50 CHECK (trend_score >= 0 AND trend_score <= 100), -- 今きてる度（0-100、大きいほど丸が大きくなる）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- インデックスを作成（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_local_spots_category ON local_spots(category);
CREATE INDEX IF NOT EXISTS idx_local_spots_hotness_score ON local_spots(hotness_score DESC);
CREATE INDEX IF NOT EXISTS idx_local_spots_trend_score ON local_spots(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_local_spots_location ON local_spots(latitude, longitude);

-- Row Level Security (RLS) を有効化（読み取りのみ許可）
ALTER TABLE local_spots ENABLE ROW LEVEL SECURITY;

-- パブリック読み取りアクセスを許可
DROP POLICY IF EXISTS "Allow public read access" ON local_spots;
CREATE POLICY "Allow public read access" ON local_spots
  FOR SELECT USING (true);

-- サンプルデータを挿入（オプション）
-- 秋田県周辺のサンプルスポット
INSERT INTO local_spots (name, description, category, latitude, longitude, opening_hours, is_open_now, hotness_score, accessibility_score, trend_score, image_url) VALUES
('秋田の郷土料理店', '秋田の伝統的な郷土料理を提供するレストラン。きりたんぽが自慢です。', 'restaurant', 140.1035, 39.7286, '11:30-22:00', true, 75, 80, 70, NULL),
('秋田の伝統工芸店', '秋田の伝統的な工芸品を販売しています。', 'shop', 140.1045, 39.7386, '10:00-19:00', true, 50, 85, 50, NULL),
('秋田の文化施設', '秋田の文化活動の拠点。展示会やイベントを開催しています。', 'culture', 140.1005, 39.6986, '9:00-21:00', true, 70, 75, 60, NULL)
ON CONFLICT DO NOTHING;

