-- responsesテーブルにuser_emailカラムを追加（Googleアカウントのメールアドレス保存用）
-- Supabase DashboardのSQL Editorで実行してください

-- ステップ1: user_emailカラムを追加
ALTER TABLE responses ADD COLUMN IF NOT EXISTS user_email TEXT;

-- ステップ2: インデックスを作成（統計クエリのパフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_responses_user_email ON responses(user_email);
CREATE INDEX IF NOT EXISTS idx_responses_event_user_email ON responses(event_id, user_email);

-- ステップ3: 既存データのuser_idからメールアドレスを取得して設定（オプション）
-- 注意: このステップは、既存の回答データに対して実行されますが、
-- auth.usersテーブルからメールアドレスを取得する必要があるため、
-- アプリケーション層で処理することを推奨します

-- 確認用クエリ（実行後、user_emailカラムが追加されたことを確認）
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'responses'
ORDER BY ordinal_position;
