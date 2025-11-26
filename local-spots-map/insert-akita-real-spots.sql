-- 秋田県の実際のローカルスポットを登録するSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: 既存のサンプルデータをすべて削除
DELETE FROM local_spots;

-- ステップ2: 実際の秋田県のローカルスポットを登録
-- 座標はおおよその位置です。正確な座標が必要な場合は、Googleマップなどで確認して調整してください
-- カテゴリも適宜変更してください

INSERT INTO local_spots (
  name, 
  description, 
  category, 
  latitude, 
  longitude, 
  opening_hours, 
  is_open_now, 
  trend_score,
  image_url
) VALUES
-- ヤマキウ南倉庫（秋田市）
(
  'ヤマキウ南倉庫',
  '秋田市のローカルスポット',
  'shop',  -- カテゴリは適宜変更してください（shop, restaurant, cafe, farm, culture）
  39.7186,  -- 秋田市の中心座標（Googleマップで正確な座標を確認して変更してください）
  140.1025,
  NULL,  -- 営業時間は不明のためNULL（後でTable Editorで追加できます）
  NULL,  -- 営業中かどうかは不明のためNULL
  50,  -- trend_score（後でTable Editorで調整してください）
  NULL
),

-- マルヒコビルジング（能代市）
(
  'マルヒコビルジング',
  '能代市のローカルスポット',
  'shop',  -- カテゴリは適宜変更してください
  40.2064,  -- 能代市の中心座標（Googleマップで正確な座標を確認して変更してください）
  140.0275,
  NULL,
  NULL,
  50,
  NULL
),

-- すの屋仁井田店（秋田県）
(
  'すの屋仁井田店',
  '秋田県のローカルスポット',
  'restaurant',  -- カテゴリは適宜変更してください
  39.7186,  -- 秋田市周辺の座標（Googleマップで正確な座標を確認して変更してください）
  140.1025,
  NULL,
  NULL,
  50,
  NULL
),

-- 清流の森（五城目町）
(
  '清流の森',
  '五城目町のローカルスポット',
  'culture',  -- カテゴリは適宜変更してください
  39.9333,  -- 五城目町の中心座標（Googleマップで正確な座標を確認して変更してください）
  140.1167,
  NULL,
  NULL,
  50,
  NULL
),

-- 貸し棚おうみや（五城目町）
(
  '貸し棚おうみや',
  '五城目町のローカルスポット',
  'shop',  -- カテゴリは適宜変更してください
  39.9333,  -- 五城目町の中心座標（Googleマップで正確な座標を確認して変更してください）
  140.1167,
  NULL,
  NULL,
  50,
  NULL
);

-- 確認: 登録されたスポットを確認
SELECT 
  id,
  name,
  category,
  latitude,
  longitude,
  trend_score
FROM local_spots
ORDER BY name;

