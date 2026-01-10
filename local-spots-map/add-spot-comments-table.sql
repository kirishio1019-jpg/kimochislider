-- spot_commentsテーブルを作成するSQL
-- SupabaseのSQL Editorで実行してください
-- LINEのようなコメント機能を実現するため、各スポットに複数のコメントを保存できるようにします

-- ステップ1: spot_commentsテーブルを作成
CREATE TABLE IF NOT EXISTS spot_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spot_id UUID NOT NULL REFERENCES local_spots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- インデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_spot_comments_spot_id ON spot_comments(spot_id);
CREATE INDEX IF NOT EXISTS idx_spot_comments_user_id ON spot_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_spot_comments_created_at ON spot_comments(created_at);

-- ステップ2: Row Level Security (RLS) を有効化
ALTER TABLE spot_comments ENABLE ROW LEVEL SECURITY;

-- パブリック読み取りアクセスを許可（誰でもコメントを見られる）
DROP POLICY IF EXISTS "Allow public read access" ON spot_comments;
CREATE POLICY "Allow public read access" ON spot_comments
  FOR SELECT USING (true);

-- パブリック作成アクセスを許可（誰でもコメントを投稿可能）
DROP POLICY IF EXISTS "Allow public insert access" ON spot_comments;
CREATE POLICY "Allow public insert access" ON spot_comments
  FOR INSERT WITH CHECK (true);

-- パブリック更新アクセスを許可（自分のコメントのみ更新可能）
DROP POLICY IF EXISTS "Allow public update own comments" ON spot_comments;
CREATE POLICY "Allow public update own comments" ON spot_comments
  FOR UPDATE USING (
    user_id = auth.uid() OR user_id IS NULL
  )
  WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL
  );

-- パブリック削除アクセスを許可（自分のコメントのみ削除可能）
DROP POLICY IF EXISTS "Allow public delete own comments" ON spot_comments;
CREATE POLICY "Allow public delete own comments" ON spot_comments
  FOR DELETE USING (
    user_id = auth.uid() OR user_id IS NULL
  );

-- 確認: テーブルが正しく作成されたか確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'spot_comments'
ORDER BY ordinal_position;

-- 確認: ポリシーが正しく作成されたか確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'spot_comments';



















