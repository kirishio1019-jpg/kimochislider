-- コミュニティメンバーシップ機能を追加するSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: communitiesテーブルにowner_idカラムを追加（創設者）
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_communities_owner_id ON communities(owner_id);

-- ステップ2: community_membersテーブルを作成
CREATE TABLE IF NOT EXISTS community_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(community_id, user_id)
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_status ON community_members(status);

-- ステップ3: Row Level Security (RLS) を有効化
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- パブリック読み取りアクセス（自分のメンバーシップ情報は誰でも見られる）
DROP POLICY IF EXISTS "Allow users to read their own memberships" ON community_members;
CREATE POLICY "Allow users to read their own memberships" ON community_members
  FOR SELECT USING (auth.uid() = user_id);

-- コミュニティのメンバーは他のメンバーの情報を見られる（承認済みのみ）
DROP POLICY IF EXISTS "Allow community members to read approved members" ON community_members;
CREATE POLICY "Allow community members to read approved members" ON community_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
        AND cm.user_id = auth.uid()
        AND cm.status = 'approved'
    )
    AND community_members.status = 'approved'
  );

-- コミュニティのオーナーはすべてのメンバーシップ申請を見られる
DROP POLICY IF EXISTS "Allow owners to read all memberships" ON community_members;
CREATE POLICY "Allow owners to read all memberships" ON community_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_members.community_id
        AND c.owner_id = auth.uid()
    )
  );

-- パブリック作成アクセス（誰でも申請できる）
DROP POLICY IF EXISTS "Allow public to create membership requests" ON community_members;
CREATE POLICY "Allow public to create membership requests" ON community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- オーナーはメンバーシップのステータスを更新できる（承認/非承認）
DROP POLICY IF EXISTS "Allow owners to update membership status" ON community_members;
CREATE POLICY "Allow owners to update membership status" ON community_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_members.community_id
        AND c.owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_members.community_id
        AND c.owner_id = auth.uid()
    )
  );

-- ステップ4: 既存のコミュニティのオーナーを設定（最初に作成したユーザーをオーナーにする）
-- 注意: これは既存データがある場合の移行用です。実際のオーナーIDに置き換えてください。
-- UPDATE communities SET owner_id = 'YOUR_USER_ID' WHERE owner_id IS NULL;

-- 確認: テーブル構造を確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'community_members'
ORDER BY ordinal_position;










