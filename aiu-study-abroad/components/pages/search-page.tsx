"use client"

import { useState } from "react"
import ReviewCard from "@/components/review-card"

const allReviews = [
  {
    id: 1,
    country: "オーストラリア",
    university: "シドニー大学",
    title: "安定して勉強できる環境",
    satisfaction: 4.5,
    cost: 350000,
    language: "中上級",
    languageLevel: "中上級",
    strongFields: ["Business Administration", "Communication & Media", "Sustainability & Environment"],
    author: "さくら",
    date: "2025年1月15日",
    excerpt: "生活費は少し高めですが、キャンパスが綺麗で過ごしやすいです。",
  },
  {
    id: 2,
    country: "カナダ",
    university: "トロント大学",
    title: "リアルな北米経験が得られた",
    satisfaction: 4.2,
    cost: 320000,
    language: "中級",
    languageLevel: "中級",
    strongFields: ["International Relations", "Psychology & Social Sciences", "Education"],
    author: "たけし",
    date: "2025年1月10日",
    excerpt: "カナダの多文化社会を体験できました。",
  },
  {
    id: 3,
    country: "イギリス",
    university: "ロンドン大学",
    title: "アカデミックな雰囲気がすごい",
    satisfaction: 4.7,
    cost: 380000,
    language: "中上級",
    languageLevel: "中上級",
    strongFields: ["Law", "Arts & Humanities", "Economics"],
    author: "ゆり",
    date: "2025年1月5日",
    excerpt: "世界中から来た学生との出会いが最高。",
  },
  {
    id: 4,
    country: "アメリカ",
    university: "スタンフォード大学",
    title: "ハイレベルな教育が受けられる",
    satisfaction: 4.6,
    cost: 400000,
    language: "上級",
    languageLevel: "上級",
    strongFields: ["Technology & Engineering", "Computer Science", "Artificial Intelligence"],
    author: "はな",
    date: "2024年12月28日",
    excerpt: "アメリカのトップ校での留学は本当に貴重です。",
  },
]

export default function SearchPage() {
  const [filters, setFilters] = useState({
    country: "",
    maxCost: 500000,
    language: "",
  })

  const filteredReviews = allReviews.filter((review) => {
    if (filters.country && review.country !== filters.country) return false
    if (review.cost > filters.maxCost) return false
    if (filters.language && review.language !== filters.language) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">レビューを検索</h1>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">国で絞り込む</label>
            <select
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">すべての国</option>
              <option value="オーストラリア">オーストラリア</option>
              <option value="カナダ">カナダ</option>
              <option value="イギリス">イギリス</option>
              <option value="アメリカ">アメリカ</option>
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">語学レベル</label>
            <select
              value={filters.language}
              onChange={(e) => setFilters({ ...filters, language: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">すべてのレベル</option>
              <option value="初級">初級</option>
              <option value="中級">中級</option>
              <option value="中上級">中上級</option>
              <option value="上級">上級</option>
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
              onChange={(e) => setFilters({ ...filters, maxCost: Number.parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <p className="text-muted-foreground mb-4">{filteredReviews.length}件のレビューが見つかりました</p>
        <div className="space-y-6">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => <ReviewCard key={review.id} review={review} />)
          ) : (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground">条件に合うレビューが見つかりません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



