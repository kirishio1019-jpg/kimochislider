# Table Editorでtrend_scoreカラムを見つける方法

## 方法1: 横スクロールで確認

1. Supabaseダッシュボードで「Table Editor」を開く
2. 左側のテーブル一覧から`local_spots`を選択
3. テーブルの列ヘッダー（`id`, `name`, `description`などが表示されている行）を**右にスクロール**してください
4. `trend_score`カラムは右側の方にあります

## 方法2: 列の表示順序を確認

Table Editorでは、カラムは以下の順序で表示されることが多いです：
- `id`
- `name`
- `description`
- `category`
- `latitude`
- `longitude`
- `image_url`
- `opening_hours`
- `is_open_now`
- `hotness_score`
- `accessibility_score`
- **`trend_score`** ← ここにあります！
- `created_at`
- `updated_at`

## 方法3: 検索機能を使う（ブラウザの検索）

1. Table Editorのページで`Ctrl+F`（Windows）または`Cmd+F`（Mac）を押す
2. 「trend_score」と入力して検索
3. ハイライトされた場所を確認

## 方法4: 列のフィルター機能を使う

SupabaseのTable Editorには、表示する列を選択できる機能がある場合があります：
1. Table Editorの右上にある設定アイコンや「Columns」ボタンを探す
2. 表示する列の一覧から`trend_score`を選択

## 確認方法

もし`trend_score`カラムが見つかったら：
- 各行の`trend_score`列をクリックして値を編集できます
- デフォルト値は`50`になっているはずです
- 値を変更すると、地図上のマーカーのサイズが変わります











