import { LocalSpot } from '@/types';

/**
 * trend_scoreを計算する関数
 * likesをベースに、他の指標を少し足して計算します
 * 
 * 計算式:
 * trend_score = Math.min(100, likes * 0.9 + (hotness_score || 0) * 0.05 + (accessibility_score || 0) * 0.05)
 * 
 * - likesの影響を90%にして、いいねが多いスポットが大きく表示されるようにする
 * - hotness_scoreとaccessibility_scoreはそれぞれ5%ずつ補助的に使用
 * - 最大値は100に制限
 */
export function calculateTrendScore(spot: LocalSpot): number {
  const likes = spot.likes ?? 0;
  const hotnessScore = spot.hotness_score ?? 0;
  const accessibilityScore = spot.accessibility_score ?? 0;

  // likesをベースに、他の指標を少し足す
  // likesの影響を90%にして、いいねが多いスポットが大きく表示されるようにする
  const trendScore = Math.min(
    100,
    likes * 0.9 + hotnessScore * 0.05 + accessibilityScore * 0.05
  );

  return Math.round(trendScore);
}

/**
 * スポットの配列に対してtrend_scoreを計算して更新する関数
 */
export function calculateTrendScoresForSpots(spots: LocalSpot[]): LocalSpot[] {
  return spots.map((spot) => ({
    ...spot,
    trend_score: calculateTrendScore(spot),
  }));
}























