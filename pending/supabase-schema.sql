-- Pending: 未確定の参加気持ちを置くイベント告知アプリのデータベーススキーマ

-- Events テーブル（イベント情報）
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- URL用のスラッグ
  title TEXT NOT NULL,
  description_short TEXT,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE,
  location_text TEXT,
  location_type TEXT CHECK (location_type IN ('online', 'offline')) DEFAULT 'offline',
  fee_text TEXT,
  organizer_name TEXT,
  additional_info TEXT, -- 追加情報
  public_page_content TEXT, -- 公開ページに表示するカスタムコンテンツ（HTML可）
  admin_token TEXT UNIQUE NOT NULL, -- 管理用トークン
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Responses テーブル（参加者の気持ち）
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100), -- 0-100の内部値
  email TEXT, -- リマインド用メール（任意）
  edit_token TEXT UNIQUE NOT NULL, -- 更新用トークン
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_admin_token ON events(admin_token);
CREATE INDEX IF NOT EXISTS idx_responses_event_id ON responses(event_id);
CREATE INDEX IF NOT EXISTS idx_responses_edit_token ON responses(edit_token);
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at DESC);

-- Row Level Security (RLS) を有効化
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー
-- Events: 公開イベントは誰でも読み取り可能、作成は認証不要（admin_tokenで管理）
CREATE POLICY "Events are publicly readable" ON events
  FOR SELECT USING (true);

CREATE POLICY "Events can be created without auth" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Events can be updated with admin_token" ON events
  FOR UPDATE USING (true); -- admin_tokenはアプリケーション層で検証

-- Responses: イベントへの回答は誰でも作成可能、edit_tokenがあれば更新可能
-- ただし、他の人の回答は見えない（主催者のみダッシュボードで見る）
CREATE POLICY "Responses can be created without auth" ON responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Responses can be updated with edit_token" ON responses
  FOR UPDATE USING (true); -- edit_tokenはアプリケーション層で検証

-- 主催者はadmin_tokenでイベントとその回答を管理できる
-- これはアプリケーション層で実装（admin_tokenを検証してからデータ取得）
