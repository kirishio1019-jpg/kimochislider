'use client';

import { LocalSpot, Category } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import { getLikesTrend } from '@/lib/likesHistory';

interface SpotRankingProps {
  spots: LocalSpot[];
  selectedCategory: Category | null;
  onSpotClick: (spot: LocalSpot) => void;
}

export default function SpotRanking({ spots, selectedCategory, onSpotClick }: SpotRankingProps) {
  // trend_score順にソート（降順）し、上位10位までに制限
  const sortedSpots = [...spots]
    .filter((spot) => !selectedCategory || spot.category === selectedCategory)
    .sort((a, b) => {
      const scoreA = a.trend_score ?? 0;
      const scoreB = b.trend_score ?? 0;
      return scoreB - scoreA;
    })
    .slice(0, 10); // 上位10位までに制限

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          今きてるローカルスポット
        </h2>
        
        {sortedSpots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            スポットが見つかりませんでした
          </div>
        ) : (
          <div className="space-y-3">
            {sortedSpots.map((spot, index) => {
              const likes = spot.likes ?? 0;
              const rank = index + 1;
              const trend = getLikesTrend(spot.id, likes);
              
              return (
                <div
                  key={spot.id}
                  onClick={() => onSpotClick(spot)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
                >
                  {/* 順位 */}
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm">
                    {rank}
                  </div>

                  {/* 画像 */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                    {spot.image_url ? (
                      <img
                        src={spot.image_url}
                        alt={spot.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: CATEGORY_COLORS[spot.category] }}
                      >
                        {CATEGORY_LABELS[spot.category].charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* 情報 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {spot.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: CATEGORY_COLORS[spot.category] }}
                      >
                        {CATEGORY_LABELS[spot.category]}
                      </span>
                      <span className="text-xs text-gray-500">
                        ❤️ {likes}
                      </span>
                    </div>
                  </div>

                  {/* トレンド表示（上昇・下降） */}
                  <div className="flex-shrink-0">
                    {trend === 'up' && (
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-6 h-6 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                        <span className="text-xs text-green-600 font-medium mt-0.5">
                          上昇
                        </span>
                      </div>
                    )}
                    {trend === 'down' && (
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-6 h-6 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                          />
                        </svg>
                        <span className="text-xs text-red-600 font-medium mt-0.5">
                          下降
                        </span>
                      </div>
                    )}
                    {trend === 'stable' && (
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 12h14"
                          />
                        </svg>
                        <span className="text-xs text-gray-500 font-medium mt-0.5">
                          安定
                        </span>
                      </div>
                    )}
                    {trend === null && (
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-6 h-6 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 12h14"
                          />
                        </svg>
                        <span className="text-xs text-gray-400 font-medium mt-0.5">
                          -
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

