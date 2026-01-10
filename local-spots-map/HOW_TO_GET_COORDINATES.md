# 正確な座標を取得する方法

## Googleマップで座標を取得する手順

1. **Googleマップを開く**
   - https://www.google.com/maps にアクセス

2. **スポット名を検索**
   - 検索バーにスポット名を入力（例: 「ヤマキウ南倉庫 秋田市」）
   - Enterキーを押す

3. **座標を取得**
   - スポットの位置が表示されたら、マップ上のピンを**右クリック**（Windows）または**Ctrl+クリック**（Mac）
   - メニューから「この場所について」または「座標をコピー」を選択
   - または、ピンをクリックして、画面下部に表示される座標をコピー

4. **座標の形式**
   - Googleマップでは `39.7186, 140.1025` のような形式で表示されます
   - 最初の数字が**緯度（latitude）**
   - 2番目の数字が**経度（longitude）**

## Table Editorで座標を更新する方法

1. SupabaseのTable Editorで`local_spots`テーブルを開く
2. 各スポットの`latitude`と`longitude`列をクリック
3. Googleマップで取得した座標を入力
4. Enterキーを押して保存

## 座標の確認方法

SQL Editorで以下のクエリを実行すると、現在の座標を確認できます：

```sql
SELECT name, latitude, longitude
FROM local_spots
ORDER BY name;
```























