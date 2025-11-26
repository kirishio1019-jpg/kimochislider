"use client"

import { useState, useEffect, useMemo } from "react"
import { universitiesByRegion } from "@/lib/universities"

// 国が属する地域を取得する関数
function getRegionForCountry(country: string): string | null {
  for (const [region, universities] of Object.entries(universitiesByRegion)) {
    if (universities.some(uni => uni.country === country)) {
      return region
    }
  }
  return null
}

// 国名の日本語表示マッピング
const countryNameMap: Record<string, string> = {
  "Australia": "オーストラリア",
  "Canada": "カナダ",
  "U.K.": "イギリス",
  "U.S.A.": "アメリカ",
  "New Zealand": "ニュージーランド",
  "Korea": "韓国",
  "China": "中国",
  "Taiwan": "台湾",
  "Singapore": "シンガポール",
  "Hong Kong": "香港",
  "Thailand": "タイ",
  "Indonesia": "インドネシア",
  "Malaysia": "マレーシア",
  "Philippines": "フィリピン",
  "Vietnam": "ベトナム",
  "Brunei": "ブルネイ",
  "Macau": "マカオ",
  "Mongolia": "モンゴル",
  "France": "フランス",
  "Germany": "ドイツ",
  "Spain": "スペイン",
  "Italy": "イタリア",
  "Netherlands": "オランダ",
  "Sweden": "スウェーデン",
  "Norway": "ノルウェー",
  "Denmark": "デンマーク",
  "Finland": "フィンランド",
  "Switzerland": "スイス",
  "Austria": "オーストリア",
  "Belgium": "ベルギー",
  "Ireland": "アイルランド",
  "Portugal": "ポルトガル",
  "Poland": "ポーランド",
  "Czech Republic": "チェコ",
  "Hungary": "ハンガリー",
  "Greece": "ギリシャ",
  "Russia": "ロシア",
  "Turkey": "トルコ",
  "Mexico": "メキシコ",
  "The Bahamas": "バハマ",
  "Argentina": "アルゼンチン",
  "Chile": "チリ",
  "Peru": "ペルー",
  "Egypt": "エジプト",
  "Morocco": "モロッコ",
  "Croatia": "クロアチア",
  "Cyprus": "キプロス",
  "Estonia": "エストニア",
  "Latvia": "ラトビア",
  "Lithuania": "リトアニア",
  "Malta": "マルタ",
  "Romania": "ルーマニア",
  "Slovakia": "スロバキア",
  "Slovenia": "スロベニア",
}

export default function CountryStatsGrid() {
  const [reviews, setReviews] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // localStorageからレビューを読み込む
    const savedReviews = localStorage.getItem('reviews')
    if (savedReviews) {
      try {
        const parsedReviews = JSON.parse(savedReviews)
        setReviews(parsedReviews)
      } catch (e) {
        // パースエラー時は空配列
      }
    }
  }, [])

  // レビューが更新されたときのリスナー
  useEffect(() => {
    if (!isClient) return

    const handleStorageChange = () => {
      const savedReviews = localStorage.getItem('reviews')
      if (savedReviews) {
        try {
          const parsedReviews = JSON.parse(savedReviews)
          setReviews(parsedReviews)
        } catch (e) {
          // パースエラー時は無視
        }
      } else {
        setReviews([])
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('reviewUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('reviewUpdated', handleStorageChange)
    }
  }, [isClient])

  // すべての国を取得
  const allCountries = useMemo(() => {
    const countriesSet = new Set<string>()
    Object.values(universitiesByRegion).forEach((universities) => {
      universities.forEach((uni) => {
        countriesSet.add(uni.country)
      })
    })
    return Array.from(countriesSet).sort()
  }, [])

  // 国ごとの統計を計算
  const countryStats = useMemo(() => {
    const stats: Record<string, { reviews: number; totalCost: number; totalSatisfaction: number; costCount: number; satisfactionCount: number }> = {}

    // 初期化
    allCountries.forEach((country) => {
      stats[country] = {
        reviews: 0,
        totalCost: 0,
        totalSatisfaction: 0,
        costCount: 0,
        satisfactionCount: 0,
      }
    })

    // レビューから統計を計算
    reviews.forEach((review) => {
      const country = review.country
      if (stats[country]) {
        stats[country].reviews += 1
        if (review.cost && Number(review.cost) > 0) {
          stats[country].totalCost += Number(review.cost)
          stats[country].costCount += 1
        }
        if (review.satisfaction && Number(review.satisfaction) > 0) {
          stats[country].totalSatisfaction += Number(review.satisfaction)
          stats[country].satisfactionCount += 1
        }
      }
    })

    // 統計を計算して配列に変換
    return allCountries
      .map((country) => {
        const stat = stats[country]
        const avgCost = stat.costCount > 0 ? stat.totalCost / stat.costCount : 0
        const avgRating = stat.satisfactionCount > 0 ? stat.totalSatisfaction / stat.satisfactionCount : 0

        return {
          name: countryNameMap[country] || country,
          country: country,
          reviews: stat.reviews,
          avgCost: avgCost,
          rating: avgRating,
          hasReviews: stat.reviews > 0,
        }
      })
      .sort((a, b) => {
        // レビューがある国を優先、その中で評価の高い順、同じ評価ならレビュー数の多い順
        if (a.hasReviews !== b.hasReviews) {
          return b.hasReviews ? 1 : -1
        }
        if (Math.abs(a.rating - b.rating) < 0.01) {
          return b.reviews - a.reviews
        }
        return b.rating - a.rating
      })
  }, [allCountries, reviews])

  return (
    <div className="overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex gap-4 min-w-max">
        {countryStats.map((country) => (
          <div
            key={country.name}
            onClick={() => {
              // 検索ページに遷移して、その国でフィルタリング
              const region = getRegionForCountry(country.country)
              window.dispatchEvent(new CustomEvent('pageChange', { 
                detail: { 
                  page: 'search',
                  filters: { 
                    country: country.country,
                    region: region || undefined
                  }
                } 
              }))
            }}
            className="group bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/40 transition-all duration-300 cursor-pointer flex-shrink-0 w-64"
          >
          <h3 className="font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
            {country.name}
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs font-medium">レビュー数</span>
              <span className="font-semibold text-foreground bg-muted/40 px-2 py-1 rounded-md">{country.reviews}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs font-medium">平均費用</span>
              <span className="font-semibold text-foreground bg-muted/40 px-2 py-1 rounded-md">
                {country.avgCost > 0 
                  ? `${Math.round(country.avgCost / 1000)}k`
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs font-medium">平均評価</span>
              <span className="font-semibold text-accent">
                {country.rating > 0 ? `${country.rating.toFixed(1)}★` : "-"}
              </span>
            </div>
          </div>
        </div>
        ))}
      </div>
    </div>
  )
}


