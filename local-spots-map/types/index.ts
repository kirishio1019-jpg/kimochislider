export type Category = string; // 動的なカテゴリ（データベースから取得）

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  color: string;
  community_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  slug: string;
  is_public?: boolean; // 公開/非公開フラグ（デフォルト: true）
  owner_id?: string; // コミュニティ創設者のユーザーID
  created_at?: string;
  updated_at?: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected'; // 申請状態
  role: 'owner' | 'admin' | 'member'; // 役割
  nickname?: string; // コミュニティ内でのニックネーム
  created_at?: string;
  updated_at?: string;
}

export interface Map {
  id: string;
  community_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface SpotComment {
  id: string;
  spot_id: string;
  user_id?: string | null;
  comment: string;
  created_at: string;
  updated_at?: string;
}

export interface LocalSpot {
  id: string;
  name: string;
  description: string;
  category: Category; // カテゴリのslug（例: "restaurant"）
  latitude: number;
  longitude: number;
  image_url?: string;
  opening_hours?: string;
  is_open_now?: boolean;
  hotness_score?: number; // 0-100, 今ホットな場所ほど高い
  accessibility_score?: number; // 0-100, 今行ける場所ほど高い
  likes?: number; // いいね数（0以上）
  trend_score?: number; // 0-100, 今きてる度（likesをベースに計算、大きいほど丸が大きくなる）
  community_id?: string; // コミュニティID
  map_id?: string; // 地図ID
  notes?: string; // 記録・メモ（どんな場所で何がおすすめか）
  comment?: string; // コメント（後方互換性のため残す）
  created_at?: string; // 作成日時
}

// デフォルトカテゴリ（後方互換性のため）
export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  restaurant: '#EF4444', // 鮮やかな赤（地図の背景に負けない）
  shop: '#F59E0B', // 鮮やかなオレンジ（地図の背景に負けない）
  culture: '#10B981', // 鮮やかな緑（地図の背景に負けない）
};

export const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  restaurant: 'レストラン',
  shop: 'ショップ',
  culture: '文化',
};

// 後方互換性のため（既存コード用）
export const CATEGORY_COLORS = DEFAULT_CATEGORY_COLORS;
export const CATEGORY_LABELS = DEFAULT_CATEGORY_LABELS;
