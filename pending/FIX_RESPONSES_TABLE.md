# レスポンス保存エラーの解決方法

## エラー内容

「気持ちを保存する」ボタンを押すと「送信に失敗しました。もう一度お試しください。」というエラーが発生する場合、データベースに必要なカラムが追加されていない可能性があります。

## 解決方法

### ステップ1: Supabase DashboardでSQLを実行

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. 左側のメニューから「**SQL Editor**」をクリック
4. 「**New query**」をクリック

### ステップ2: 必要なカラムを追加

以下のSQLをコピーして、SQL Editorに貼り付け、実行してください：

```sql
-- is_confirmedカラムを追加
ALTER TABLE responses ADD COLUMN IF NOT EXISTS is_confirmed BOOLEAN DEFAULT false;

-- x_valueとy_valueカラムを追加
ALTER TABLE responses ADD COLUMN IF NOT EXISTS x_value INTEGER CHECK (x_value >= 0 AND x_value <= 100);
ALTER TABLE responses ADD COLUMN IF NOT EXISTS y_value INTEGER CHECK (y_value >= 0 AND y_value <= 100);

-- 既存データの互換性のため、scoreをxValueとyValueに設定
UPDATE responses 
SET x_value = score, y_value = score 
WHERE x_value IS NULL OR y_value IS NULL;
```

### ステップ3: 動作確認

1. SQLを実行後、イベントページにアクセス
2. 「気持ちを保存する」ボタンをクリック
3. エラーが解消されているか確認

## エラーの詳細を確認する方法

エラーが続く場合、ブラウザの開発者ツールで詳細を確認できます：

1. ブラウザの開発者ツール（F12）を開く
2. 「Console」タブを選択
3. 「気持ちを保存する」ボタンをクリック
4. コンソールに表示されるエラーメッセージを確認：
   - `Failed to submit response:` で始まるログ
   - `Error code:` で始まるログ
   - `Error message:` で始まるログ

## よくあるエラー

### エラー: column "is_confirmed" does not exist

**原因**: `is_confirmed`カラムが追加されていない

**解決策**: 上記のSQLを実行してカラムを追加

### エラー: column "x_value" does not exist

**原因**: `x_value`カラムが追加されていない

**解決策**: 上記のSQLを実行してカラムを追加

### エラー: column "y_value" does not exist

**原因**: `y_value`カラムが追加されていない

**解決策**: 上記のSQLを実行してカラムを追加

### エラー: new row violates row-level security policy

**原因**: RLSポリシーが正しく設定されていない

**解決策**: 以下のSQLを実行してRLSポリシーを確認・修正：

```sql
-- ResponsesテーブルのRLSポリシーを確認
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'responses';

-- パブリック作成アクセスを許可（誰でも回答を作成可能）
DROP POLICY IF EXISTS "Responses can be created without auth" ON responses;
CREATE POLICY "Responses can be created without auth" ON responses
  FOR INSERT WITH CHECK (true);
```

## 確認チェックリスト

- [ ] Supabase DashboardでSQL Editorを開いた
- [ ] 必要なカラムを追加するSQLを実行した
- [ ] SQLの実行が成功した（エラーが出ていない）
- [ ] イベントページで「気持ちを保存する」を試した
- [ ] エラーが解消された
