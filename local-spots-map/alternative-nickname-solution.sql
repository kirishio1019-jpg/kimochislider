-- 匿名認証を使わずにニックネームを保存する代替案
-- 注意: この方法は、user_idをNULL許容にして、ニックネームを直接保存します
-- SupabaseのSQL Editorで実行してください

-- ステップ1: community_membersテーブルにnicknameカラムを追加
ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- ステップ2: user_idをNULL許容にする（既存のNOT NULL制約を削除）
-- 注意: これは既存のデータに影響を与える可能性があります
-- まず、既存のNOT NULL制約を確認
-- SELECT constraint_name, constraint_type 
-- FROM information_schema.table_constraints 
-- WHERE table_name = 'community_members' AND constraint_type = 'NOT NULL';

-- user_idのNOT NULL制約を削除（制約名は環境によって異なる場合があります）
-- ALTER TABLE community_members ALTER COLUMN user_id DROP NOT NULL;

-- ステップ3: RLSポリシーを更新して、nicknameのみの参加を許可
-- 注意: これは既存のRLSポリシーと競合する可能性があります

-- パブリック作成アクセス（user_idがNULLでもnicknameがあれば参加可能）
DROP POLICY IF EXISTS "Allow public to create membership with nickname" ON community_members;
CREATE POLICY "Allow public to create membership with nickname" ON community_members
  FOR INSERT WITH CHECK (
    (auth.uid() = user_id AND status = 'pending') OR
    (user_id IS NULL AND nickname IS NOT NULL AND status = 'approved')
  );

-- ステップ4: nicknameで参加したユーザーも読み取り可能にする
DROP POLICY IF EXISTS "Allow reading members with nickname" ON community_members;
CREATE POLICY "Allow reading members with nickname" ON community_members
  FOR SELECT USING (
    status = 'approved' OR
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_members.community_id
        AND c.owner_id = auth.uid()
    )
  );

-- 確認: テーブル構造を確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'community_members'
ORDER BY ordinal_position;










