-- Google認証対応のためのスキーマ更新
-- Supabase DashboardのSQL Editorで実行してください

-- 1. eventsテーブルにuser_idカラムを追加
ALTER TABLE events ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. user_idのインデックスを作成
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);

-- 3. RLSポリシーを更新
-- ユーザーが自分のイベントを管理できるようにする
CREATE POLICY "Users can manage their own events" ON events
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 既存のポリシーは残す（admin_tokenベースの管理も継続）
