-- 特定のコミュニティにスポットを追加するSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: 「国際教養大学」コミュニティのIDを取得
-- このクエリを実行して、コミュニティIDを確認してください
SELECT id, name, slug FROM communities WHERE name = '国際教養大学';

-- ステップ2: 上記で取得したコミュニティIDを使って、スポットを追加
-- 以下の例では、コミュニティIDを 'YOUR_COMMUNITY_ID_HERE' に置き換えてください
-- または、サブクエリを使って直接追加することもできます

-- 方法1: コミュニティIDを直接指定して追加
-- INSERT INTO local_spots (
--   name,
--   description,
--   category,
--   latitude,
--   longitude,
--   community_id,
--   likes,
--   trend_score
-- ) VALUES
-- (
--   '国際教養大学',
--   '秋田県にある国際教養大学のキャンパス',
--   'culture',
--   39.7186,  -- 秋田市の座標（正確な座標に変更してください）
--   140.1025,
--   'YOUR_COMMUNITY_ID_HERE',  -- 上記のSELECTで取得したIDに置き換えてください
--   0,
--   50
-- );

-- 方法2: サブクエリを使って自動的にコミュニティIDを取得して追加
INSERT INTO local_spots (
  name,
  description,
  category,
  latitude,
  longitude,
  community_id,
  likes,
  trend_score
)
SELECT 
  '国際教養大学',
  '秋田県にある国際教養大学のキャンパス',
  'culture',
  39.7186,  -- 国際教養大学の緯度
  140.1256,  -- 国際教養大学の経度
  id,  -- コミュニティIDを自動的に取得
  0,
  50
FROM communities
WHERE name = '国際教養大学'
LIMIT 1;

-- 確認: 追加されたスポットを確認
SELECT 
  ls.id,
  ls.name,
  ls.category,
  ls.latitude,
  ls.longitude,
  c.name as community_name
FROM local_spots ls
LEFT JOIN communities c ON ls.community_id = c.id
WHERE c.name = '国際教養大学';

