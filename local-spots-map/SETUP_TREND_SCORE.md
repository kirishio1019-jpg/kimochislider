# trend_scoreの設定ガイド

## 概要

`trend_score`は「今きてる度」を表す0-100の数値で、地図上のマーカーのサイズを決定します。
- 0-33: 小さめの丸（20-30px）
- 34-66: 普通サイズの丸（30-40px）
- 67-100: 大きめの丸（40-50px）

## セットアップ手順

### ステップ1: データベースに`trend_score`カラムを追加

1. Supabaseダッシュボードにログイン
2. 左側のメニューから「SQL Editor」をクリック
3. 「New query」をクリック
4. `add-trend-score.sql`の内容をコピーして貼り付け
5. 「Run」ボタン（または`Ctrl+Enter`）で実行

**これで`trend_score`カラムが自動的に追加されます。**  
Table Editorで確認すると、新しいカラムが表示されているはずです。

### ステップ2: 既存データに`trend_score`を設定

既存のサンプルデータがある場合、以下のいずれかの方法で`trend_score`を設定できます：

#### 方法A: すべての既存データにデフォルト値を設定

`update-all-existing-data.sql`を実行すると、すべての既存データに`trend_score = 50`（普通サイズ）が設定されます。

#### 方法B: Table Editorで手動で設定（推奨）

1. Supabaseダッシュボードで「Table Editor」を開く
2. `local_spots`テーブルを選択
3. 各行の`trend_score`列をクリックして値を入力
   - 例: 80（大きめ）、50（普通）、30（小さめ）
4. 変更を保存

#### 方法C: 特定の名前のデータを更新

`update-sample-data-with-trend-score.sql`を実行すると、特定の名前のデータが更新されます。
ただし、このSQLは特定の名前（「サンプルカフェ」「地元レストラン」など）を想定しているため、
既存のデータの名前が違う場合は適用されません。

## 新しいデータを追加する場合

新しいスポットを追加する際は、`trend_score`も一緒に設定してください：

```sql
INSERT INTO local_spots (name, description, category, latitude, longitude, trend_score) 
VALUES ('スポット名', '説明', 'cafe', 140.1025, 39.7186, 75);
```

または、Table Editorで新しい行を追加する際に、`trend_score`列にも値を入力してください。

## よくある質問

**Q: SQL Editorで実行した後、Table Editorに自動的に反映されますか？**  
A: はい、自動的に反映されます。ページをリロードする必要がある場合もあります。

**Q: 既存のデータに`trend_score`を設定しないとどうなりますか？**  
A: デフォルト値の50（普通サイズ）が適用されます。

**Q: `trend_score`の値を後から変更できますか？**  
A: はい、Table Editorでいつでも変更できます。











