-- likesカラムを追加するSQL
-- SupabaseのSQL Editorで実行してください

-- likesカラムを追加
ALTER TABLE local_spots 
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0 CHECK (likes >= 0);

-- likesのインデックスを作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_local_spots_likes ON local_spots(likes DESC);

-- 既存のデータにデフォルト値を設定
UPDATE local_spots 
SET likes = 0 
WHERE likes IS NULL;























