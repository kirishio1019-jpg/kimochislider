-- additional_infoカラムを追加するSQL
-- Supabase DashboardのSQL Editorで実行してください

ALTER TABLE events ADD COLUMN IF NOT EXISTS additional_info TEXT;
