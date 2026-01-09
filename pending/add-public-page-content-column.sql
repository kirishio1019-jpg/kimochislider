-- public_page_contentカラムを追加
ALTER TABLE events ADD COLUMN IF NOT EXISTS public_page_content TEXT;
