-- カテゴリのUNIQUE制約を修正するSQL
-- コミュニティごとに同じ名前のカテゴリを作成できるようにする
-- SupabaseのSQL Editorで実行してください

-- ステップ1: 既存のUNIQUE制約を削除
ALTER TABLE categories 
DROP CONSTRAINT IF EXISTS categories_name_key;

ALTER TABLE categories 
DROP CONSTRAINT IF EXISTS categories_slug_key;

-- ステップ2: コミュニティごとのUNIQUE制約を追加
-- nameとcommunity_idの組み合わせでユニークにする
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_name_community 
ON categories(community_id, name);

-- slugとcommunity_idの組み合わせでユニークにする
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug_community 
ON categories(community_id, slug);

-- 確認: インデックスが正しく作成されたか確認
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'categories'
ORDER BY indexname;










