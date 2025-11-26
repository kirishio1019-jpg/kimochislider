-- コミュニティメンバーシップにニックネームカラムを追加するSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: community_membersテーブルにnicknameカラムを追加
ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- ステップ2: インデックスを作成（検索用）
CREATE INDEX IF NOT EXISTS idx_community_members_nickname ON community_members(nickname);

-- ステップ3: 既存のデータがある場合、user_metadataからニックネームを取得して設定（オプション）
-- 注意: これは既存のメンバーシップにニックネームを設定するためのものです
-- UPDATE community_members cm
-- SET nickname = (
--   SELECT raw_user_meta_data->>'nickname'
--   FROM auth.users
--   WHERE id = cm.user_id
-- )
-- WHERE nickname IS NULL;

-- 確認: テーブル構造を確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'community_members'
ORDER BY ordinal_position;










