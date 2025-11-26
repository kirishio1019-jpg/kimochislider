# Google Maps Places API統合ガイド

Mapbox Geocoding APIで検索できない場所がある場合、Google Maps Places APIを使用することで、より多くの場所を検索可能にできます。

## Google Maps Places APIの利点

- **より多くの場所データ**: Google Mapsは世界中のより多くの場所を登録しています
- **詳細な情報**: 営業時間、レビュー、写真などの詳細情報が取得可能
- **自動補完**: Places Autocomplete APIでリアルタイムの予測検索が可能

## セットアップ手順

### 1. Google Cloud PlatformでAPIキーを取得

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「ライブラリ」から「Places API」を有効化
4. 「認証情報」→「認証情報を作成」→「APIキー」でキーを作成
5. APIキーの制限を設定（HTTPリファラー制限など）

### 2. 環境変数を設定

`.env.local`ファイルに以下を追加：

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. パッケージのインストール

```bash
npm install @googlemaps/js-api-loader
```

### 4. 実装例

`components/SpotAddForm.tsx`でGoogle Maps Places APIを使用する場合：

```typescript
import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  libraries: ['places'],
});

// Places Autocompleteを使用
const autocompleteService = new google.maps.places.AutocompleteService();
autocompleteService.getPlacePredictions({
  input: query,
  componentRestrictions: { country: 'jp' },
  location: new google.maps.LatLng(39.7186, 140.1025),
  radius: 50000, // 50km
}, (predictions, status) => {
  if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
    setSearchResults(predictions);
  }
});
```

## 料金

Google Maps Places APIは使用量に応じて課金されます：
- Autocomplete (Per Session): セッションごとに課金
- 詳細は[Google Maps Platform 料金](https://mapsplatform.google.com/pricing/)を確認してください

## 注意事項

- MapboxとGoogle Mapsの両方を使用する場合は、両方のAPIキーが必要です
- Google Maps APIは使用量に応じて課金されるため、無料枠を超えると費用が発生します
- 本番環境では、APIキーの制限を適切に設定してください










