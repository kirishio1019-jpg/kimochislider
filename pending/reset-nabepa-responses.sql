-- ALR_冬の鍋パ大会の回答数を1にリセットするSQLスクリプト
-- Supabase DashboardのSQL Editorで実行してください

-- ステップ1: イベントIDを確認
-- まず、イベントタイトルに「鍋パ」が含まれるイベントのIDを確認
SELECT id, title, slug
FROM events
WHERE title LIKE '%鍋パ%'
ORDER BY created_at DESC;

-- ステップ2: 該当イベントの現在の回答数を確認
-- 上記で取得したイベントIDを使用して、現在の回答数を確認
-- （例: event_id = 'your-event-id-here'）
SELECT 
  event_id,
  COUNT(*) as total_responses,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) FILTER (WHERE user_id IS NULL) as anonymous_responses
FROM responses
WHERE event_id = (
  SELECT id FROM events WHERE title LIKE '%鍋パ%' ORDER BY created_at DESC LIMIT 1
)
GROUP BY event_id;

-- ステップ3: 最新の回答以外を削除（1つの回答のみ残す）
-- 注意: この操作は不可逆です。実行前に必ずバックアップを取ってください

-- まず、最新の回答のIDを取得
WITH latest_response AS (
  SELECT id
  FROM responses
  WHERE event_id = (
    SELECT id FROM events WHERE title LIKE '%鍋パ%' ORDER BY created_at DESC LIMIT 1
  )
  ORDER BY updated_at DESC, created_at DESC
  LIMIT 1
)
-- 最新の回答以外を削除
DELETE FROM responses
WHERE event_id = (
  SELECT id FROM events WHERE title LIKE '%鍋パ%' ORDER BY created_at DESC LIMIT 1
)
AND id NOT IN (SELECT id FROM latest_response);

-- ステップ4: 確認（削除後、回答数が1になっているか確認）
SELECT 
  event_id,
  COUNT(*) as total_responses,
  COUNT(DISTINCT user_id) as unique_users
FROM responses
WHERE event_id = (
  SELECT id FROM events WHERE title LIKE '%鍋パ%' ORDER BY created_at DESC LIMIT 1
)
GROUP BY event_id;

-- 注意事項:
-- 1. このスクリプトは、最新の回答以外をすべて削除します
-- 2. 実行前に必ずバックアップを取ってください
-- 3. イベントIDが複数ある場合は、適切なIDを指定してください
-- 4. 削除後は、新しいGoogleアカウントで回答が保存されると、回答数が増えていきます
