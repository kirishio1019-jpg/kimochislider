# 地域の"生きている場所"を可視化する地図アプリ

ローカルスポット（食事、カフェ、農家、小商い、文化スポット）を地図上に表示し、"今行ける場所"や"今ホットな場所"を可視化するNext.jsアプリケーションです。

## 機能

- 🗺️ 地図上にローカルスポットを丸いマーカーで表示
- 📍 "今行ける場所"や"今ホットな場所"ほどマーカーが大きく表示される
- 🎨 カテゴリごとに色分けされたマーカー
- 📱 スポットをタップすると詳細情報（名前、写真、説明、営業時間）を表示
- 🔍 カテゴリごとにフィルター機能
- 🗄️ Supabaseからデータを取得

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mapbox設定
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token
```

#### Supabaseの設定

1. [Supabase](https://supabase.com/)でプロジェクトを作成
2. プロジェクトのURLとAnon Keyを取得
3. 以下のSQLを実行してテーブルを作成：

```sql
-- local_spotsテーブルを作成
CREATE TABLE local_spots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('restaurant', 'cafe', 'farm', 'shop', 'culture')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  image_url TEXT,
  opening_hours TEXT,
  is_open_now BOOLEAN,
  hotness_score INTEGER CHECK (hotness_score >= 0 AND hotness_score <= 100),
  accessibility_score INTEGER CHECK (accessibility_score >= 0 AND accessibility_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security (RLS) を有効化（読み取りのみ許可）
ALTER TABLE local_spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON local_spots
  FOR SELECT USING (true);

-- サンプルデータを挿入（オプション）
INSERT INTO local_spots (name, description, category, latitude, longitude, opening_hours, is_open_now, hotness_score, accessibility_score) VALUES
('サンプルカフェ', '地域に根ざしたコーヒーショップ', 'cafe', 35.6895, 139.6917, '9:00-18:00', true, 85, 90),
('地元レストラン', '新鮮な地元食材を使ったレストラン', 'restaurant', 35.6804, 139.7690, '11:30-22:00', true, 75, 80),
('ファーマーズマーケット', '週末の朝市', 'farm', 35.6762, 139.6503, '土日 7:00-12:00', false, 60, 70);
```

#### Mapboxの設定

1. [Mapbox](https://www.mapbox.com/)でアカウントを作成
2. Access Tokenを取得
3. `.env.local`に設定

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

## プロジェクト構造

```
local-spots-map/
├── app/
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # メインページ
│   └── globals.css         # グローバルスタイル
├── components/
│   ├── Map.tsx             # 地図コンポーネント
│   ├── SpotDetail.tsx      # スポット詳細モーダル
│   └── CategoryFilter.tsx  # カテゴリフィルター
├── lib/
│   └── supabase.ts         # Supabaseクライアント設定
├── types/
│   └── index.ts            # TypeScript型定義
└── package.json
```

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **地図**: Mapbox GL JS
- **データベース**: Supabase (PostgreSQL)
- **UI**: React 19

## カテゴリ

- 🍽️ **restaurant** (食事) - 赤色
- ☕ **cafe** (カフェ) - 青緑色
- 🌾 **farm** (農家) - 緑色
- 🛍️ **shop** (小商い) - 黄色
- 🎭 **culture** (文化スポット) - 薄緑色

## マーカーのサイズ

マーカーのサイズは`hotness_score`と`accessibility_score`の平均値に基づいて決定されます：
- スコアが高いほどマーカーが大きく表示されます
- サイズ範囲: 20px〜50px

## ライセンス

MIT
