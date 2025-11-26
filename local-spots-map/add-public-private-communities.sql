-- 公開/非公開コミュニティ機能を追加するSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: communitiesテーブルにis_publicカラムを追加
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- インデックスを作成（公開コミュニティの検索を高速化）
CREATE INDEX IF NOT EXISTS idx_communities_is_public ON communities(is_public);

-- ステップ2: デフォルトコミュニティを削除
DELETE FROM communities 
WHERE id = '00000000-0000-0000-0000-000000000000' 
   OR slug = 'default' 
   OR name = 'デフォルトコミュニティ';

-- ステップ3: 「秋田観光」公開コミュニティを作成
INSERT INTO communities (name, description, slug, is_public)
VALUES (
  '秋田観光',
  '秋田県の観光スポットを集めた公開コミュニティ',
  'akita-tourism',
  true
)
ON CONFLICT (slug) DO UPDATE 
SET is_public = true, 
    name = '秋田観光',
    description = '秋田県の観光スポットを集めた公開コミュニティ';

-- ステップ4: 「国際教養大学コミュニティ」を非公開に設定
UPDATE communities 
SET is_public = false 
WHERE name LIKE '%国際教養大学%' 
   OR slug LIKE '%aiu%'
   OR name LIKE '%AIU%';

-- ステップ5: 「Ailab」を非公開に設定
UPDATE communities 
SET is_public = false 
WHERE name LIKE '%Ailab%' 
   OR name LIKE '%ailab%'
   OR slug LIKE '%ailab%';

-- 確認: コミュニティの公開/非公開状態を確認
SELECT 
  id,
  name,
  slug,
  is_public,
  description,
  created_at
FROM communities 
ORDER BY is_public DESC, created_at DESC;










