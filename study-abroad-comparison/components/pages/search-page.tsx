"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import ReviewCard from "@/components/review-card"
import { universitiesByRegion, regions, type University } from "@/lib/universities"

interface StrongFieldCategory {
  category: string
  fields: string[]
}

const strongFieldCategories: StrongFieldCategory[] = [
  {
    category: "Business & Economics",
    fields: [
      "Business",
      "International Business",
      "Marketing",
      "Management",
      "Economics",
      "Finance",
      "Entrepreneurship",
      "Innovation",
      "Tourism Studies",
    ],
  },
  {
    category: "Politics & Society",
    fields: [
      "International Relations",
      "Political Science",
      "Sociology",
      "Anthropology",
      "Development Studies",
    ],
  },
  {
    category: "Media & Communication",
    fields: [
      "Media Studies",
      "Journalism",
      "Public Relations",
      "Cultural Studies",
      "Communication",
      "Intercultural Communication",
    ],
  },
  {
    category: "Language & Education",
    fields: [
      "Linguistics",
      "Applied Linguistics",
      "TESOL",
      "English Education",
      "Translation",
      "Interpretation",
      "Comparative Education",
    ],
  },
  {
    category: "Environment & Sustainability",
    fields: [
      "Environmental Studies",
      "Sustainability",
      "CSR",
      "Global Health",
      "Public Policy",
    ],
  },
  {
    category: "Technology & Data",
    fields: [
      "Information Technology",
      "ICT",
      "Data Science",
      "Digital Media",
      "Innovation and Society",
    ],
  },
  {
    category: "Arts & Humanities",
    fields: [
      "History",
      "Philosophy",
      "Ethics",
      "Literature",
      "Art",
      "Performing Arts",
      "Area Studies (e.g., Asian, European, American)",
      "Liberal Arts",
    ],
  },
  {
    category: "Psychology & Human Behavior",
    fields: [
      "Psychology",
      "Cross-Cultural Psychology",
      "Human Development",
      "Social Behavior",
    ],
  },
]

interface SearchPageProps {
  initialFilters?: { country?: string; region?: string } | null
}

export default function SearchPage({ initialFilters }: SearchPageProps = {}) {
  const [allReviews, setAllReviews] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)
  // 初期フィルターから地域を取得（国が指定されている場合は地域を自動検出）
  const getInitialRegion = () => {
    if (initialFilters?.region) return initialFilters.region
    if (initialFilters?.country) {
      for (const [region, universities] of Object.entries(universitiesByRegion)) {
        if (universities.some(uni => uni.country === initialFilters.country)) {
          return region
        }
      }
    }
    return ""
  }

  const [filters, setFilters] = useState({
    region: getInitialRegion(),
    country: initialFilters?.country || "",
    universityId: "",
    maxCost: 500000,
    strongFields: [] as string[],
    startYear: "",
  })
  const [expandedRegion, setExpandedRegion] = useState<string | null>(
    initialFilters?.region || (initialFilters?.country ? (() => {
      // 国から地域を自動検出
      for (const [region, universities] of Object.entries(universitiesByRegion)) {
        if (universities.some(uni => uni.country === initialFilters.country)) {
          return region
        }
      }
      return null
    })() : null)
  )
  const [expandedStrongFieldCategory, setExpandedStrongFieldCategory] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    // localStorageから投稿されたレビューを読み込む
    const savedReviews = localStorage.getItem('reviews')
    if (savedReviews) {
      try {
        const parsedReviews = JSON.parse(savedReviews)
        // 最新順（IDの降順）でソート
        parsedReviews.sort((a: any, b: any) => b.id - a.id) // 最新が上
        setAllReviews(parsedReviews)
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
          parsedReviews.sort((a: any, b: any) => b.id - a.id)
          setAllReviews(parsedReviews)
        } catch (e) {
          // パースエラー時は無視
        }
      } else {
        setAllReviews([])
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('reviewUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('reviewUpdated', handleStorageChange)
    }
  }, [isClient])

  // 地域ごとの国リストをメモ化（一度だけ計算）
  const countriesByRegion = useMemo(() => {
    return Object.entries(universitiesByRegion).reduce((acc, [region, universities]) => {
      const countries = Array.from(new Set(universities.map((uni) => uni.country))).sort()
      acc[region] = countries
      return acc
    }, {} as Record<string, string[]>)
  }, [])

  // 選択された地域・国に基づく大学リスト
  const availableUniversities = useMemo(() => {
    if (!filters.region) return []
    const regionUnis = universitiesByRegion[filters.region] || []
    if (!filters.country) return regionUnis
    return regionUnis.filter((uni) => uni.country === filters.country)
  }, [filters.region, filters.country])

  // 利用可能な留学開始年を取得（レビューから抽出）
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>()
    allReviews.forEach((review) => {
      if (review.startDate) {
        const date = new Date(review.startDate)
        if (!isNaN(date.getTime())) {
          yearsSet.add(date.getFullYear())
        }
      }
    })
    return Array.from(yearsSet).sort((a, b) => b - a) // 新しい年から順
  }, [allReviews])

  // フィルターされたレビューをメモ化
  const filteredReviews = useMemo(() => {
    return allReviews.filter((review) => {
      if (filters.region && review.region !== filters.region) return false
      if (filters.country && review.country !== filters.country) return false
      if (filters.universityId) {
        // レビューにuniversityIdがある場合は直接比較
        const reviewUniversityId = (review as any).universityId
        if (reviewUniversityId) {
          if (reviewUniversityId !== filters.universityId) return false
        } else {
          // universityIdがない場合、大学名でマッチング
          const selectedUniversity = availableUniversities.find((u) => u.id === filters.universityId)
          if (selectedUniversity && review.university !== selectedUniversity.name) return false
        }
      }
      if (review.cost > filters.maxCost) return false
      // 強みのある分野でフィルタリング（選択した分野のいずれかを含むレビューを表示）
      if (filters.strongFields.length > 0) {
        const reviewFields = review.strongFields || []
        const hasMatchingField = filters.strongFields.some((field) => reviewFields.includes(field))
        if (!hasMatchingField) return false
      }
      // 留学開始年でフィルタリング
      if (filters.startYear) {
        if (review.startDate) {
          const date = new Date(review.startDate)
          if (!isNaN(date.getTime())) {
            const reviewYear = date.getFullYear().toString()
            if (reviewYear !== filters.startYear) return false
          } else {
            return false // 日付が無効な場合は除外
          }
        } else {
          return false // startDateがない場合は除外
        }
      }
      return true
    })
  }, [allReviews, filters.region, filters.country, filters.universityId, filters.maxCost, filters.strongFields, filters.startYear, availableUniversities])

  const toggleRegionFilter = useCallback((region: string) => {
    if (filters.region === region) {
      setFilters((prev) => ({ ...prev, region: "", country: "", universityId: "" }))
      setExpandedRegion(null)
    } else {
      setFilters((prev) => ({ ...prev, region, country: "", universityId: "" }))
      setExpandedRegion(region)
    }
  }, [filters.region])

  const handleCountrySelect = useCallback((country: string) => {
    setFilters((prev) => ({ ...prev, country, universityId: "" }))
  }, [])

  const handleUniversitySelect = useCallback((universityId: string) => {
    setFilters((prev) => ({ ...prev, universityId }))
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({ region: "", country: "", universityId: "", maxCost: 500000, strongFields: [], startYear: "" })
    setExpandedRegion(null)
    setExpandedStrongFieldCategory(null)
  }, [])

  const toggleStrongField = useCallback((field: string) => {
    setFilters((prev) => ({
      ...prev,
      strongFields: prev.strongFields.includes(field)
        ? prev.strongFields.filter((f) => f !== field)
        : [...prev.strongFields, field],
    }))
  }, [])

  const handleRemoveFilter = useCallback((type: "region" | "country" | "university" | "cost" | "strongField" | "startYear", value?: string) => {
    switch (type) {
      case "region":
        setFilters((prev) => ({ ...prev, region: "", country: "", universityId: "" }))
        setExpandedRegion(null)
        break
      case "country":
        setFilters((prev) => ({ ...prev, country: "", universityId: "" }))
        break
      case "university":
        setFilters((prev) => ({ ...prev, universityId: "" }))
        break
      case "cost":
        setFilters((prev) => ({ ...prev, maxCost: 500000 }))
        break
      case "strongField":
        if (value) {
          setFilters((prev) => ({
            ...prev,
            strongFields: prev.strongFields.filter((f) => f !== value),
          }))
        }
        break
      case "startYear":
        setFilters((prev) => ({ ...prev, startYear: "" }))
        break
    }
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">レビューを検索</h1>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-4">地域・国で絞り込む</label>
          
          {/* Region Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            {regions.map((region) => {
              const isSelected = filters.region === region
              const countryCount = countriesByRegion[region]?.length || 0
              const universityCount = universitiesByRegion[region]?.length || 0

              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => toggleRegionFilter(region)}
                  className={`px-4 py-3 rounded-lg border transition-all text-sm font-medium ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div>{region}</div>
                  <div className={`text-xs mt-1 space-y-0.5 ${isSelected ? "opacity-90" : "text-muted-foreground"}`}>
                    <div>{countryCount}国</div>
                    <div>{universityCount}大学</div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Country Selection (shown when region is selected) */}
          {filters.region && expandedRegion === filters.region && (
            <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  {filters.region}の国を選択
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => handleCountrySelect("")}
                    className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                      !filters.country
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:bg-muted/50"
                    }`}
                  >
                    すべての国
                  </button>
                  {countriesByRegion[filters.region]?.map((country) => {
                    const isSelected = filters.country === country
                    return (
                      <button
                        key={country}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:bg-muted/50"
                        }`}
                      >
                        {country}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* University Selection (shown when country is selected) */}
              {filters.country && availableUniversities.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    {filters.country}の大学を選択
                  </label>
                  <select
                    value={filters.universityId}
                    onChange={(e) => handleUniversitySelect(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="">すべての大学</option>
                    {availableUniversities.map((university) => (
                      <option key={university.id} value={university.id}>
                        {university.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Other Filters */}
        <div className="pt-6 border-t border-border space-y-6">
          {/* Strong Fields Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">強みのある分野で絞り込む</label>
            
            {/* 選択済みフィールド */}
            {filters.strongFields.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {filters.strongFields.map((field) => (
                  <span
                    key={field}
                    className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20"
                  >
                    {field}
                    <button
                      type="button"
                      onClick={() => handleRemoveFilter("strongField", field)}
                      className="ml-1.5 text-primary/80 hover:text-primary text-sm"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* カテゴリーごとのアコーディオン表示 */}
            <div className="border border-border rounded-lg overflow-hidden">
              {strongFieldCategories.map((category) => {
                const isExpanded = expandedStrongFieldCategory === category.category
                const categoryFieldsSelected = filters.strongFields.filter((field) =>
                  category.fields.includes(field)
                ).length

                return (
                  <div key={category.category} className="border-b border-border last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setExpandedStrongFieldCategory(isExpanded ? null : category.category)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-background hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">{category.category}</span>
                        {categoryFieldsSelected > 0 && (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {categoryFieldsSelected}
                          </span>
                        )}
                      </div>
                      <svg
                        className={`w-5 h-5 text-muted-foreground transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="p-4 border-t border-border bg-card">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {category.fields.map((field) => (
                            <label
                              key={field}
                              className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md cursor-pointer hover:bg-muted/50 transition-colors text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={filters.strongFields.includes(field)}
                                onChange={() => toggleStrongField(field)}
                                className="w-4 h-4 flex-shrink-0"
                              />
                              <span className="text-sm text-foreground">{field}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Start Year Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">留学開始年で絞り込む</label>
            <select
              value={filters.startYear}
              onChange={(e) => setFilters((prev) => ({ ...prev, startYear: e.target.value }))}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">すべての年</option>
              {availableYears.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}年
                </option>
              ))}
            </select>
          </div>

          {/* Cost Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              最大月額費用: ¥{filters.maxCost.toLocaleString()}
            </label>
            <input
              type="range"
              min="0"
              max="500000"
              step="10000"
              value={filters.maxCost}
              onChange={(e) => setFilters((prev) => ({ ...prev, maxCost: Number.parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>¥0</span>
              <span>¥500,000</span>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.region || filters.country || filters.universityId || filters.maxCost < 500000 || filters.strongFields.length > 0 || filters.startYear) && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">適用中のフィルター:</span>
              {filters.region && (
                <button
                  type="button"
                  onClick={() => handleRemoveFilter("region")}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 flex items-center gap-2"
                >
                  {filters.region}
                  <span>×</span>
                </button>
              )}
              {filters.country && (
                <button
                  type="button"
                  onClick={() => handleRemoveFilter("country")}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 flex items-center gap-2"
                >
                  {filters.country}
                  <span>×</span>
                </button>
              )}
              {filters.universityId && (
                <button
                  type="button"
                  onClick={() => handleRemoveFilter("university")}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 flex items-center gap-2"
                >
                  {availableUniversities.find((u) => u.id === filters.universityId)?.name || "大学"}
                  <span>×</span>
                </button>
              )}
              {filters.strongFields.map((field) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => handleRemoveFilter("strongField", field)}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 flex items-center gap-2"
                >
                  強み: {field}
                  <span>×</span>
                </button>
              ))}
              {filters.startYear && (
                <button
                  type="button"
                  onClick={() => handleRemoveFilter("startYear")}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 flex items-center gap-2"
                >
                  留学開始年: {filters.startYear}年
                  <span>×</span>
                </button>
              )}
              {filters.maxCost < 500000 && (
                <button
                  type="button"
                  onClick={() => handleRemoveFilter("cost")}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 flex items-center gap-2"
                >
                  費用: ¥{filters.maxCost.toLocaleString()}以下
                  <span>×</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-1 text-muted-foreground hover:text-foreground text-sm font-medium underline"
              >
                すべてクリア
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        <p className="text-muted-foreground mb-4">
          {filteredReviews.length}件のレビューが見つかりました
        </p>
        <div className="space-y-6">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => <ReviewCard key={review.id} review={review} />)
          ) : (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground mb-2">条件に合うレビューが見つかりません</p>
              <p className="text-sm text-muted-foreground">フィルターを変更してお試しください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
