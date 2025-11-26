-- 重複している「施設」カテゴリを1つに統合するSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: 重複している「施設」カテゴリを確認
SELECT id, name, slug, color, community_id, created_at
FROM categories
WHERE name = '施設' OR slug = 'facility'
ORDER BY created_at;

-- ステップ2: 標準の「施設」カテゴリのIDを確認（存在しない場合は作成）
-- 標準カテゴリのID: 00000000-0000-0000-0000-000000000004
INSERT INTO categories (id, name, slug, color, community_id)
VALUES ('00000000-0000-0000-0000-000000000004', '施設', 'facility', '#3B82F6', NULL)
ON CONFLICT (id) DO NOTHING;

-- ステップ3: 重複している「施設」カテゴリを使用しているスポットを標準カテゴリに更新
UPDATE local_spots
SET category = 'facility'
WHERE category IN (
  SELECT slug FROM categories
  WHERE (name = '施設' OR slug = 'facility')
    AND id != '00000000-0000-0000-0000-000000000004'
);

-- ステップ4: 標準以外の「施設」カテゴリを削除
DELETE FROM categories
WHERE (name = '施設' OR slug = 'facility')
  AND id != '00000000-0000-0000-0000-000000000004';

-- ステップ5: 確認 - 「施設」カテゴリが1つだけになっているか確認
SELECT id, name, slug, color, community_id
FROM categories
WHERE name = '施設' OR slug = 'facility';

-- ステップ6: 確認 - 「施設」カテゴリを使用しているスポット数を確認
SELECT COUNT(*) as facility_spots_count
FROM local_spots
WHERE category = 'facility';










