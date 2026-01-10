/**
 * 各スポットのいいね数の履歴を追跡する関数
 * localStorageを使って、前回の読み込み時と比較して上昇・下降を判断
 */

const LIKES_HISTORY_KEY = 'local_spots_likes_history';

interface LikesHistory {
  [spotId: string]: {
    likes: number;
    timestamp: number; // 最後に記録した時刻（ミリ秒）
  };
}

/**
 * いいね数の履歴を取得
 */
export function getLikesHistory(): LikesHistory {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const historyJson = localStorage.getItem(LIKES_HISTORY_KEY);
    if (!historyJson) {
      return {};
    }
    return JSON.parse(historyJson) as LikesHistory;
  } catch (error) {
    console.error('いいね履歴の取得に失敗しました:', error);
    return {};
  }
}

/**
 * いいね数の履歴を保存
 */
export function saveLikesHistory(history: LikesHistory): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(LIKES_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('いいね履歴の保存に失敗しました:', error);
  }
}

/**
 * スポットのいいね数の変化傾向を取得
 * @param spotId スポットのID
 * @param currentLikes 現在のいいね数
 * @returns 'up' | 'down' | 'stable' | null（履歴がない場合はnull）
 */
export function getLikesTrend(
  spotId: string,
  currentLikes: number
): 'up' | 'down' | 'stable' | null {
  const history = getLikesHistory();
  const previous = history[spotId];

  if (!previous) {
    return null; // 履歴がない
  }

  const difference = currentLikes - previous.likes;

  if (difference > 0) {
    return 'up'; // 上昇
  } else if (difference < 0) {
    return 'down'; // 下降
  } else {
    return 'stable'; // 変化なし
  }
}

/**
 * すべてのスポットのいいね数を履歴に保存
 * @param spots スポットの配列
 */
export function updateLikesHistory(spots: Array<{ id: string; likes?: number }>): void {
  const history = getLikesHistory();
  const now = Date.now();

  spots.forEach((spot) => {
    const currentLikes = spot.likes ?? 0;
    history[spot.id] = {
      likes: currentLikes,
      timestamp: now,
    };
  });

  saveLikesHistory(history);
}

/**
 * 古い履歴をクリーンアップ（30日以上前のデータを削除）
 */
export function cleanupOldHistory(): void {
  const history = getLikesHistory();
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  let hasChanges = false;

  Object.keys(history).forEach((spotId) => {
    if (history[spotId].timestamp < thirtyDaysAgo) {
      delete history[spotId];
      hasChanges = true;
    }
  });

  if (hasChanges) {
    saveLikesHistory(history);
  }
}























