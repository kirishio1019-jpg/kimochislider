/**
 * いいねを押したスポットのIDをlocalStorageに保存・管理する関数
 */

const LIKED_SPOTS_KEY = 'local_spots_liked_ids';

/**
 * ユーザーがいいねを押したスポットのIDを取得
 */
export function getLikedSpotIds(): Set<string> {
  if (typeof window === 'undefined') {
    return new Set();
  }

  try {
    const likedIdsJson = localStorage.getItem(LIKED_SPOTS_KEY);
    if (!likedIdsJson) {
      return new Set();
    }
    const likedIds = JSON.parse(likedIdsJson) as string[];
    return new Set(likedIds);
  } catch (error) {
    console.error('いいね済みスポットの取得に失敗しました:', error);
    return new Set();
  }
}

/**
 * スポットにいいねを押したかどうかを確認
 */
export function hasLikedSpot(spotId: string): boolean {
  const likedIds = getLikedSpotIds();
  return likedIds.has(spotId);
}

/**
 * スポットにいいねを押したことを記録
 */
export function markSpotAsLiked(spotId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const likedIds = getLikedSpotIds();
    likedIds.add(spotId);
    const likedIdsArray = Array.from(likedIds);
    localStorage.setItem(LIKED_SPOTS_KEY, JSON.stringify(likedIdsArray));
  } catch (error) {
    console.error('いいねの記録に失敗しました:', error);
  }
}

/**
 * スポットのいいねを解除（記録を削除）
 */
export function unmarkSpotAsLiked(spotId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const likedIds = getLikedSpotIds();
    likedIds.delete(spotId);
    const likedIdsArray = Array.from(likedIds);
    localStorage.setItem(LIKED_SPOTS_KEY, JSON.stringify(likedIdsArray));
  } catch (error) {
    console.error('いいね解除の記録に失敗しました:', error);
  }
}

/**
 * すべてのいいね記録をクリア（デバッグ用）
 */
export function clearLikedSpots(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(LIKED_SPOTS_KEY);
  } catch (error) {
    console.error('いいね記録のクリアに失敗しました:', error);
  }
}

