-- 初期カテゴリをすべてのコミュニティで使用できるようにするSQL
-- SupabaseのSQL Editorで実行してください
-- 注意: これらのカテゴリは編集・削除可能です

-- 初期カテゴリを追加（community_id = NULLでグローバルカテゴリとして作成）
-- 既に存在する場合はスキップ（ON CONFLICT DO NOTHING）
INSERT INTO categories (id, name, slug, color, community_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'レストラン', 'restaurant', '#EF4444', NULL),
  ('00000000-0000-0000-0000-000000000002', 'ショップ', 'shop', '#F59E0B', NULL),
  ('00000000-0000-0000-0000-000000000003', '文化', 'culture', '#10B981', NULL),
  ('00000000-0000-0000-0000-000000000004', '施設', 'facility', '#3B82F6', NULL)
ON CONFLICT (id) DO NOTHING;

-- slugが重複している場合は、既存のレコードを更新（community_idをNULLに設定）
-- ただし、UNIQUE制約がコミュニティごとになっている場合は、この処理は不要
UPDATE categories 
SET community_id = NULL
WHERE slug IN ('restaurant', 'shop', 'culture', 'facility')
  AND community_id IS NOT NULL
  AND id NOT IN (
    SELECT id FROM categories 
    WHERE slug IN ('restaurant', 'shop', 'culture', 'facility') 
      AND community_id IS NULL
    LIMIT 1
  );

-- 確認: 標準カテゴリが正しく作成されたか確認
SELECT id, name, slug, color, community_id 
FROM categories 
WHERE community_id IS NULL
ORDER BY name;

