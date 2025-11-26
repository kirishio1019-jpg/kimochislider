-- サンプルデータにtrend_scoreを追加・更新するSQL
-- SupabaseのSQL Editorで実行してください

-- 既存のサンプルデータにtrend_scoreを設定
-- 例として、異なるtrend_scoreの値を設定（大きいほど丸が大きくなる）
UPDATE local_spots 
SET trend_score = CASE 
  WHEN name = 'サンプルカフェ' THEN 80  -- 大きめ
  WHEN name = '地元レストラン' THEN 60  -- 普通
  WHEN name = 'ファーマーズマーケット' THEN 40  -- 小さめ
  WHEN name = '手作り雑貨店' THEN 50  -- 普通
  WHEN name = '地域文化センター' THEN 70  -- 大きめ
  ELSE 50  -- デフォルト
END
WHERE name IN ('サンプルカフェ', '地元レストラン', 'ファーマーズマーケット', '手作り雑貨店', '地域文化センター');

-- 秋田県のサンプルスポットを追加（オプション）
-- 既にデータがある場合はスキップされます
INSERT INTO local_spots (name, description, category, latitude, longitude, opening_hours, is_open_now, trend_score, image_url) VALUES
('秋田の地元カフェ', '秋田県の地元に愛されるコーヒーショップ。地元の豆を使用しています。', 'cafe', 140.1025, 39.7186, '9:00-18:00', true, 85, NULL),
('秋田の郷土料理店', '秋田の伝統的な郷土料理を提供するレストラン。きりたんぽが自慢です。', 'restaurant', 140.1035, 39.7286, '11:30-22:00', true, 75, NULL),
('秋田の農産物直売所', '地元の新鮮な野菜や果物を販売しています。', 'farm', 140.1015, 39.7086, '土日 7:00-12:00', false, 55, NULL),
('秋田の伝統工芸店', '秋田の伝統的な工芸品を販売しています。', 'shop', 140.1045, 39.7386, '10:00-19:00', true, 45, NULL),
('秋田の文化施設', '秋田の文化活動の拠点。展示会やイベントを開催しています。', 'culture', 140.1005, 39.6986, '9:00-21:00', true, 65, NULL)
ON CONFLICT DO NOTHING;











