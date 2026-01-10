"use client"

import { useState, useMemo, useCallback, memo } from "react"
import { regions, universitiesByRegion, type University } from "@/lib/universities"

// サンプルレビューデータ（実際にはデータベースから取得）
interface ReviewData {
  id: string
  universityId: string
  author: string
  title: string
  major: string
  studyMajor: string
  strongFields: string[]
  startDate: string
  endDate: string
  vacationPeriod: string
  creditsEarned: number | string
  creditsTransferred: number | string
  credits300Level: number | string
  languageCert: string
  languageScore: string
  classLanguage: string
  costOfLiving: string
  costOfLivingNote?: string
  foodCost?: string
  rent: string
  culturalImpression?: string
  safety?: string
  climate?: string
  dailyMeals?: string
  accommodation?: string
  extracurricularActivities?: string
  extracurricularActivitiesNote?: string
  satisfaction: number
  excerpt?: string
  date: string
  // レビュー内容
  positives?: string
  challenges?: string
  selectionReason?: string
}

// サンプルデータ（実際の実装ではデータベースから取得）
const sampleReviews: ReviewData[] = [
  {
    id: "rev-1",
    universityId: "oc-au-09", // The University of Sydney
    author: "さくら",
    title: "安定して勉強できる環境",
    major: "GB (グローバル・ビジネス)",
    studyMajor: "Business Administration",
    strongFields: ["International Business", "Marketing / Management"],
    startDate: "2024-03-01",
    endDate: "2024-12-31",
    vacationPeriod: "6月〜8月（約3ヶ月）",
    creditsEarned: 30,
    creditsTransferred: 28,
    credits300Level: 12,
    languageCert: "IELTS",
    languageScore: "7.0",
    classLanguage: "英語",
    costOfLiving: "average",
    rent: "1200 AUD / 12万円",
    satisfaction: 4.5,
    excerpt: "生活費は少し高めですが、キャンパスが綺麗で過ごしやすいです。先生も親切で、わからないことはいつでも聞けました。",
    date: "2025年1月15日",
  },
  {
    id: "rev-2",
    universityId: "oc-au-09",
    author: "たろう",
    title: "充実したビジネスコース",
    major: "GB (グローバル・ビジネス)",
    studyMajor: "Marketing",
    strongFields: ["Marketing / Management", "International Business"],
    startDate: "2023-03-01",
    endDate: "2023-12-31",
    vacationPeriod: "6月〜8月（約3ヶ月）",
    creditsEarned: 32,
    creditsTransferred: 30,
    credits300Level: 15,
    languageCert: "IELTS",
    languageScore: "7.5",
    classLanguage: "英語",
    costOfLiving: "average",
    rent: "1300 AUD / 13万円",
    satisfaction: 4.7,
    excerpt: "マーケティングの授業が特に充実していて、実践的なスキルが身につきました。",
    date: "2024年12月20日",
  },
  {
    id: "rev-3",
    universityId: "na-ca-05", // University of Toronto
    author: "たけし",
    title: "リアルな北米経験が得られた",
    major: "GS (グローバル・スタディーズ)",
    studyMajor: "International Relations",
    strongFields: ["International Relations", "Political Science"],
    startDate: "2024-09-01",
    endDate: "2025-04-30",
    vacationPeriod: "12月〜1月（約2ヶ月）",
    creditsEarned: 28,
    creditsTransferred: 26,
    credits300Level: 8,
    languageCert: "TOEFL iBT",
    languageScore: "100",
    classLanguage: "英語",
    costOfLiving: "average",
    rent: "800 CAD / 9万円",
    satisfaction: 4.2,
    excerpt: "カナダの多文化社会を体験できました。冬は非常に寒いので、防寒対策をしっかりしましょう。",
    date: "2025年1月10日",
  },
  {
    id: "rev-4",
    universityId: "na-ca-05",
    author: "みほ",
    title: "充実した研究環境",
    major: "GS (グローバル・スタディーズ)",
    studyMajor: "Political Science",
    strongFields: ["Political Science", "International Relations"],
    startDate: "2023-09-01",
    endDate: "2024-04-30",
    vacationPeriod: "12月〜1月（約2ヶ月）",
    creditsEarned: 30,
    creditsTransferred: 28,
    credits300Level: 10,
    languageCert: "TOEFL iBT",
    languageScore: "105",
    classLanguage: "英語",
    costOfLiving: "high",
    rent: "900 CAD / 10万円",
    satisfaction: 4.6,
    excerpt: "教授陣のサポートが手厚く、研究に集中できる環境でした。図書館も充実しています。",
    date: "2024年11月5日",
  },
]

// 地域統計情報（universitiesByRegionから動的に計算）
const regionStats: Record<string, { countries: number; universities: number }> = Object.entries(universitiesByRegion).reduce((acc, [region, universities]) => {
  const countries = Array.from(new Set(universities.map((uni) => uni.country)))
  acc[region] = {
    countries: countries.length,
    universities: universities.length,
  }
  return acc
}, {} as Record<string, { countries: number; universities: number }>)

// 地域ヘッダーコンポーネント
const RegionHeader = memo(({ 
  region, 
  stats, 
  isExpanded, 
  onToggle 
}: { 
  region: string
  stats: { countries: number; universities: number }
  isExpanded: boolean
  onToggle: () => void
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
  >
    <div className="flex items-center gap-2">
      <h2 className="text-sm font-semibold text-foreground">{region}</h2>
      <span className="text-xs text-muted-foreground">
        ({stats.universities}大学, {stats.countries}国)
      </span>
    </div>
    <svg
      className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
))
RegionHeader.displayName = "RegionHeader"

// 国ヘッダーコンポーネント
const CountryHeader = memo(({
  country,
  universityCount,
  isExpanded,
  onToggle
}: {
  country: string
  universityCount: number
  isExpanded: boolean
  onToggle: () => void
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-muted/30 transition-colors text-left bg-muted/20"
  >
    <div className="flex items-center gap-2">
      <h3 className="text-sm font-medium text-foreground">{country}</h3>
      <span className="text-xs text-muted-foreground">({universityCount}大学)</span>
    </div>
    <svg
      className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
))
CountryHeader.displayName = "CountryHeader"

// 大学リストコンポーネント
const UniversityList = memo(({
  universities,
  selectedUniversities,
  onToggle
}: {
  universities: University[]
  selectedUniversities: string[]
  onToggle: (id: string) => void
}) => {
  const maxSelected = selectedUniversities.length >= 3

  return (
    <div className="px-3 py-2 space-y-1 max-h-64 overflow-y-auto">
      {universities.map((university) => {
        const isSelected = selectedUniversities.includes(university.id)
        const isDisabled = !isSelected && maxSelected

        return (
          <label
            key={university.id}
            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
              isSelected
                ? "bg-primary/10 border border-primary/30"
                : isDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-muted/50 border border-border"
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggle(university.id)}
              disabled={isDisabled}
              className="w-3.5 h-3.5"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{university.name}</p>
            </div>
            {isSelected && (
              <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded shrink-0">
                選択中
              </span>
            )}
          </label>
        )
      })}
    </div>
  )
})
UniversityList.displayName = "UniversityList"

const costOfLivingLabels: Record<string, string> = {
  low: "低い（月15万円以下）",
  average: "平均的（月15～25万円）",
  high: "高い（月25～35万円）",
  "very-high": "非常に高い（月35万円以上）",
}

export default function ComparisonPage() {
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set())
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set())
  // 各大学の選択中のレビューID（大学ID -> レビューID）
  const [selectedReviews, setSelectedReviews] = useState<Record<string, string>>({})

  // レビューがない場合の表示ヘルパー
  const renderReviewValue = (value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === "" || (typeof value === 'number' && value === 0)) {
      return <span className="text-muted-foreground">-</span>
    }
    if (typeof value === 'number') {
      return value.toLocaleString('ja-JP')
    }
    return value
  }

  // 地域ごとの国リスト（一度だけ計算）
  const countriesByRegion = useMemo(() => {
    const result: Record<string, string[]> = {}
    for (const [region, universities] of Object.entries(universitiesByRegion)) {
      const countries = Array.from(new Set(universities.map((uni) => uni.country))).sort()
      result[region] = countries
    }
    return result
  }, [])

  // フィルターされた大学データ
  const filteredUniversities = useMemo(() => {
    const result: Record<string, University[]> = {}
    for (const [region, universities] of Object.entries(universitiesByRegion)) {
      if (selectedRegion && region !== selectedRegion) continue
      const filtered = universities.filter((uni) => {
        if (selectedCountry && uni.country !== selectedCountry) return false
        return true
      })
      if (filtered.length > 0) {
        result[region] = filtered
      }
    }
    return result
  }, [selectedRegion, selectedCountry])

  const toggleRegion = useCallback((region: string) => {
    setExpandedRegions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(region)) {
        newSet.delete(region)
        // 地域を閉じる時、その地域の国も閉じる
        setExpandedCountries((prevCountries) => {
          const newCountries = new Set(prevCountries)
          countriesByRegion[region]?.forEach((country) => {
            newCountries.delete(`${region}-${country}`)
          })
          return newCountries
        })
      } else {
        newSet.add(region)
      }
      return newSet
    })
  }, [countriesByRegion])

  const toggleCountry = useCallback((region: string, country: string) => {
    const countryKey = `${region}-${country}`
    setExpandedCountries((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(countryKey)) {
        newSet.delete(countryKey)
      } else {
        newSet.add(countryKey)
      }
      return newSet
    })
  }, [])

  const toggleUniversity = useCallback((id: string) => {
    setSelectedUniversities((prev) => {
      if (prev.includes(id)) {
        // 大学を選択解除する時、選択中のレビューも削除
        setSelectedReviews((prevReviews) => {
          const newReviews = { ...prevReviews }
          delete newReviews[id]
          return newReviews
        })
        return prev.filter((uid) => uid !== id)
      } else if (prev.length < 3) {
        // 大学を選択する時、最初のレビューを自動選択
        const reviews = sampleReviews.filter((r) => r.universityId === id)
        if (reviews.length > 0) {
          setSelectedReviews((prevReviews) => ({
            ...prevReviews,
            [id]: reviews[0].id,
          }))
        }
        return [...prev, id]
      }
      return prev
    })
  }, [])

  // 選択された大学情報とレビューデータを結合
  const comparisonData = useMemo(() => {
    const allUnis = Object.values(universitiesByRegion).flat()
    const selectedUnis = allUnis.filter((uni) => selectedUniversities.includes(uni.id))
    
    return selectedUnis.map((uni) => {
      const reviews = sampleReviews.filter((r) => r.universityId === uni.id)
      const selectedReviewId = selectedReviews[uni.id] || (reviews.length > 0 ? reviews[0].id : null)
      const selectedReview = reviews.find((r) => r.id === selectedReviewId) || reviews[0] || null
      
      return {
        university: uni,
        reviews: reviews,
        selectedReview: selectedReview,
        currentIndex: reviews.findIndex((r) => r.id === selectedReviewId),
      }
    })
  }, [selectedUniversities, selectedReviews])

  // レビューを切り替える関数
  const changeReview = useCallback((universityId: string, direction: 'prev' | 'next') => {
    const reviews = sampleReviews.filter((r) => r.universityId === universityId)
    if (reviews.length === 0) return

    const currentReviewId = selectedReviews[universityId] || reviews[0].id
    const currentIndex = reviews.findIndex((r) => r.id === currentReviewId)
    
    let newIndex: number
    if (direction === 'prev') {
      newIndex = currentIndex <= 0 ? reviews.length - 1 : currentIndex - 1
    } else {
      newIndex = currentIndex >= reviews.length - 1 ? 0 : currentIndex + 1
    }

    setSelectedReviews((prev) => ({
      ...prev,
      [universityId]: reviews[newIndex].id,
    }))
  }, [selectedReviews])

  const filteredRegions = useMemo(() => {
    if (selectedRegion) return [selectedRegion]
    return regions
  }, [selectedRegion])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">留学先を比較</h1>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8">
        <p className="text-sm text-foreground">
          比較したい留学先を選択してください。最大3つまで比較できます。
          <span className="font-semibold ml-2">現在: {selectedUniversities.length}/3選択</span>
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">地域で絞り込む</label>
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value)
                setSelectedCountry("")
                setExpandedRegions(new Set())
                setExpandedCountries(new Set())
              }}
              className="w-full px-3 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">すべての地域</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">国で絞り込む</label>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value)
                setExpandedCountries(new Set())
              }}
              className="w-full px-3 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground"
              disabled={!selectedRegion}
            >
              <option value="">すべての国</option>
              {selectedRegion && countriesByRegion[selectedRegion]?.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* University List */}
      <div className="space-y-2 mb-6">
        {filteredRegions.map((region) => {
          const isRegionExpanded = expandedRegions.has(region)
          const stats = regionStats[region] || { countries: 0, universities: 0 }
          const countries = countriesByRegion[region] || []

          return (
            <div key={region} className="bg-card border border-border rounded-lg overflow-hidden">
              <RegionHeader
                region={region}
                stats={stats}
                isExpanded={isRegionExpanded}
                onToggle={() => toggleRegion(region)}
              />

              {isRegionExpanded && (
                <div className="border-t border-border">
                  {countries.map((country) => {
                    const countryKey = `${region}-${country}`
                    const isCountryExpanded = expandedCountries.has(countryKey)
                    const countryUniversities = filteredUniversities[region]?.filter((uni) => uni.country === country) || []

                    return (
                      <div key={country} className="border-b border-border/30 last:border-b-0">
                        <CountryHeader
                          country={country}
                          universityCount={countryUniversities.length}
                          isExpanded={isCountryExpanded}
                          onToggle={() => toggleCountry(region, country)}
                        />

                        {isCountryExpanded && (
                          <UniversityList
                            universities={countryUniversities}
                            selectedUniversities={selectedUniversities}
                            onToggle={toggleUniversity}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Comparison table */}
      {comparisonData.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground">比較結果</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground sticky left-0 bg-muted z-10">項目</th>
                  {comparisonData.map((item) => (
                    <th key={item.university.id} className="px-6 py-4 text-left text-sm font-semibold text-foreground min-w-[200px]">
                      <div>{item.university.name}</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        {item.university.country}, {item.university.region}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 投稿者 */}
                <tr className="border-b border-border">
                  <td colSpan={comparisonData.length + 1} className="px-6 py-3 bg-muted/30">
                    <span className="font-semibold text-foreground">投稿者</span>
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">レビュー投稿者</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {item.reviews.length > 0 ? (
                        <div className="space-y-3">
                          {/* 投稿者選択ドロップダウン */}
                          <div>
                            <select
                              value={item.selectedReview?.id || ""}
                              onChange={(e) => {
                                setSelectedReviews((prev) => ({
                                  ...prev,
                                  [item.university.id]: e.target.value,
                                }))
                              }}
                              className="w-full px-3 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground"
                            >
                              {item.reviews.map((review) => (
                                <option key={review.id} value={review.id}>
                                  {review.author} ({review.date}) - {review.title}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* 選択されたレビューの内容 */}
                          {item.selectedReview && (
                            <div className="bg-background border border-border rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-medium text-foreground text-sm">{item.selectedReview.author}</p>
                                  <p className="text-xs text-muted-foreground">{item.selectedReview.date}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-lg">⭐</span>
                                  <span className="text-sm font-medium text-foreground">{item.selectedReview.satisfaction.toFixed(1)}</span>
                                </div>
                              </div>
                              <h5 className="font-semibold text-foreground text-sm mb-2 line-clamp-1">
                                {item.selectedReview.title}
                              </h5>
                              {item.selectedReview.excerpt && (
                                <p className="text-xs text-muted-foreground line-clamp-3 mb-2">
                                  {item.selectedReview.excerpt}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                  {item.selectedReview.major}
                                </span>
                                <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded">
                                  {item.selectedReview.studyMajor}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* ナビゲーションボタン（オプション） */}
                          {item.reviews.length > 1 && (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => changeReview(item.university.id, 'prev')}
                                className="flex items-center justify-center w-7 h-7 rounded-full border border-border hover:bg-muted/50 transition-colors"
                                aria-label="前のレビュー"
                              >
                                <svg className="w-3.5 h-3.5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
                                {item.currentIndex + 1} / {item.reviews.length}
                              </span>
                              <button
                                type="button"
                                onClick={() => changeReview(item.university.id, 'next')}
                                className="flex items-center justify-center w-7 h-7 rounded-full border border-border hover:bg-muted/50 transition-colors"
                                aria-label="次のレビュー"
                              >
                                <svg className="w-3.5 h-3.5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 基本情報 */}
                <tr className="border-b border-border">
                  <td colSpan={comparisonData.length + 1} className="px-6 py-3 bg-muted/30">
                    <span className="font-semibold text-foreground">基本情報</span>
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">メジャー</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {item.selectedReview?.major || "-"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">留学先での専攻</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {item.selectedReview?.studyMajor || "-"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">強い分野</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {item.selectedReview?.strongFields && item.selectedReview.strongFields.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.selectedReview.strongFields.map((field, idx) => (
                            <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {field}
                            </span>
                          ))}
                        </div>
                      ) : "-"}
                    </td>
                  ))}
                </tr>

                {/* 留学期間 */}
                <tr className="border-b border-border">
                  <td colSpan={comparisonData.length + 1} className="px-6 py-3 bg-muted/30">
                    <span className="font-semibold text-foreground">留学期間</span>
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">留学開始日</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {item.selectedReview?.startDate ? new Date(item.selectedReview.startDate).toLocaleDateString('ja-JP') : "-"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">留学終了日</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {item.selectedReview?.endDate ? new Date(item.selectedReview.endDate).toLocaleDateString('ja-JP') : "-"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">長期休暇の期間</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {item.selectedReview?.vacationPeriod || "-"}
                    </td>
                  ))}
                </tr>

                {/* 学業成果 */}
                <tr className="border-b border-border">
                  <td colSpan={comparisonData.length + 1} className="px-6 py-3 bg-muted/30">
                    <span className="font-semibold text-foreground">学業成果</span>
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">現地で取得した単位数</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {item.selectedReview?.creditsEarned || "-"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">AIUへ持ち帰った単位数</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {item.selectedReview?.creditsTransferred || "-"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">持ち帰った300番台の単位数</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {item.selectedReview?.credits300Level || "-"}
                    </td>
                  ))}
                </tr>

                {/* 語学・コミュニケーション力 */}
                <tr className="border-b border-border">
                  <td colSpan={comparisonData.length + 1} className="px-6 py-3 bg-muted/30">
                    <span className="font-semibold text-foreground">語学・コミュニケーション力</span>
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">語学資格</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {item.selectedReview?.languageCert || "-"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">スコア</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {item.selectedReview?.languageScore || "-"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">授業言語</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {item.selectedReview?.classLanguage || "-"}
                    </td>
                  ))}
                </tr>

                {/* 生活・文化情報 */}
                <tr className="border-b border-border">
                  <td colSpan={comparisonData.length + 1} className="px-6 py-3 bg-muted/30">
                    <span className="font-semibold text-foreground">生活・文化情報</span>
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">物価レベル</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {item.selectedReview?.costOfLiving ? costOfLivingLabels[item.selectedReview.costOfLiving] || item.selectedReview.costOfLiving : "-"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">食費（月額）</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {renderReviewValue(item.selectedReview?.foodCost)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">家賃（月額）</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {renderReviewValue(item.selectedReview?.rent)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">国民性の印象</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {renderReviewValue(item.selectedReview?.culturalImpression)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">治安</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {renderReviewValue(item.selectedReview?.safety)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">気候</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {renderReviewValue(item.selectedReview?.climate)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">日々の食事</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {renderReviewValue(item.selectedReview?.dailyMeals)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">住んでいた場所</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {renderReviewValue(item.selectedReview?.accommodation)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">課外活動</td>
                  {comparisonData.map((item) => (
                    <td key={item.university.id} className="px-6 py-4 text-foreground">
                      {renderReviewValue(item.selectedReview?.extracurricularActivities)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {comparisonData.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground">比較する留学先を選択してください</p>
          <p className="text-sm text-muted-foreground mt-2">
            上記の地域セクションを展開して、大学を選択してください
          </p>
        </div>
      )}

      {comparisonData.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedUniversities([])}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            選択をクリア
          </button>
        </div>
      )}
    </div>
  )
}
