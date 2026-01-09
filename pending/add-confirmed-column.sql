-- is_confirmedカラムを追加するSQL
-- Supabase DashboardのSQL Editorで実行してください

ALTER TABLE responses ADD COLUMN IF NOT EXISTS is_confirmed BOOLEAN DEFAULT false;
