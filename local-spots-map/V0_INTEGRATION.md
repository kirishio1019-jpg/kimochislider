# v0 UI統合ガイド

v0で生成したUIをこのプロジェクトに統合する手順です。

## プロジェクト情報



- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **地図ライブラリ**: Mapbox GL JS
- **バックエンド**: Supabase

## 統合手順

### 1. v0でUIを生成

v0.devで以下のようなプロンプトを使用してUIを生成してください：

```
秋田県のローカルスポットを表示する地図アプリのUIを作成してください。
- ヘッダーにタイトル「めぐる | Local Trend Map」
- 左側にランキングリスト（上位10位）
- 右側に地図表示エリア
- カテゴリフィルター（レストラン、ショップ、文化）
- 表示モード切り替えボタン（分割表示/地図のみ）
```

### 2. 生成されたコードを確認

v0で生成されたコードをコピーします。通常は以下のような構造になっています：

```tsx
// v0で生成されたコンポーネント例
export default function V0GeneratedUI() {
  return (
    <div>
      {/* UIコンテンツ */}
    </div>
  );
}
```

### 3. コンポーネントをプロジェクトに追加

生成されたコンポーネントを `components/` ディレクトリに保存します：

```bash
# 例: components/V0UI.tsx として保存
```

### 4. 既存の機能と接続

`app/page.tsx` を更新して、v0で生成されたUIコンポーネントを統合します。

#### 必要なprops

v0で生成されたコンポーネントに以下のpropsを渡す必要があります：

```typescript
interface V0UIProps {
  spots: LocalSpot[];              // スポットデータ
  selectedCategory: Category | null; // 選択されたカテゴリ
  onCategoryChange: (category: Category | null) => void; // カテゴリ変更ハンドラ
  onSpotClick: (spot: LocalSpot) => void; // スポットクリックハンドラ
  viewMode: 'split' | 'fullscreen'; // 表示モード
  onViewModeChange: (mode: 'split' | 'fullscreen') => void; // 表示モード変更ハンドラ
  loading: boolean; // ローディング状態
}
```

### 5. 統合例

`app/page.tsx` の更新例：

```typescript
import V0UI from '@/components/V0UI';

export default function Home() {
  // ... 既存のstateと関数 ...

  return (
    <V0UI
      spots={spots}
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
      onSpotClick={setSelectedSpot}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      loading={loading}
    />
  );
}
```

### 6. 地図コンポーネントの統合

v0で生成されたUIに地図を統合する場合：

```typescript
// V0UI.tsx内で
import Map from '@/components/Map';

// 地図エリアに既存のMapコンポーネントを配置
<Map
  spots={spots}
  selectedCategory={selectedCategory}
  onSpotClick={onSpotClick}
  onSpotUpdate={updateSpot}
  selectedSpotFromOutside={selectedSpot}
/>
```

### 7. ランキングコンポーネントの統合

v0で生成されたUIにランキングを統合する場合：

```typescript
// V0UI.tsx内で
import SpotRanking from '@/components/SpotRanking';

// ランキングエリアに既存のSpotRankingコンポーネントを配置
<SpotRanking
  spots={spots}
  selectedCategory={selectedCategory}
  onSpotClick={onSpotClick}
/>
```

## 重要なポイント

1. **型の互換性**: v0で生成されたコードがTypeScriptの場合、型定義を確認してください
2. **Tailwind CSS**: プロジェクトはTailwind CSS 4を使用しています
3. **既存コンポーネント**: `Map.tsx` と `SpotRanking.tsx` は既に実装済みです
4. **データ構造**: `LocalSpot` 型を確認して、v0のUIが正しくデータを受け取れるようにしてください

## トラブルシューティング

### エラー: モジュールが見つからない
- `@/components/...` のパスエイリアスが正しく設定されているか確認
- `tsconfig.json` の `paths` 設定を確認

### スタイルが適用されない
- Tailwind CSSの設定を確認
- `globals.css` に必要なスタイルが含まれているか確認

### 地図が表示されない
- Mapboxトークンが正しく設定されているか確認
- `.env.local` ファイルに `NEXT_PUBLIC_MAPBOX_TOKEN` が設定されているか確認

## 次のステップ

v0で生成されたコードを共有していただければ、具体的な統合方法を提案できます。











