"use client"

import { useState } from "react"
import Link from "next/link"

interface Review {
  id: number
  country: string
  university: string
  title: string
  satisfaction: number
  cost: number
  language: string
  author: string
  date: string
}

const allReviews: Review[] = [
  {
    id: 1,
    country: "オーストラリア",
    university: "シドニー大学",
    title: "安定して勉強できる環境",
    satisfaction: 4.5,
    cost: 350000,
    language: "中上級",
    author: "さくら",
    date: "2025年1月15日",
  },
  {
    id: 2,
    country: "カナダ",
    university: "トロント大学",
    title: "リアルな北米経験が得られた",
    satisfaction: 4.2,
    cost: 320000,
    language: "中級",
    author: "たけし",
    date: "2025年1月10日",
  },
  {
    id: 3,
    country: "イギリス",
    university: "ロンドン大学",
    title: "アカデミックな雰囲気がすごい",
    satisfaction: 4.7,
    cost: 380000,
    language: "中上級",
    author: "ゆり",
    date: "2025年1月5日",
  },
  {
    id: 4,
    country: "アメリカ",
    university: "スタンフォード大学",
    title: "ハイレベルな教育が受けられる",
    satisfaction: 4.6,
    cost: 400000,
    language: "上級",
    author: "はな",
    date: "2024年12月28日",
  },
]

export default function ComparisonPage() {
  const [selectedReviews, setSelectedReviews] = useState<number[]>([])

  const toggleReview = (id: number) => {
    setSelectedReviews((prev) => (prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id].slice(-3)))
  }

  const selectedData = allReviews.filter((r) => selectedReviews.includes(r.id))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">留学先を比較</h1>
        <Link
          href="/"
          className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          ホームに戻る
        </Link>
      </div>

      {/* Selection guide */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
        <p className="text-sm text-foreground">
          比較したい留学先を選択してください。最大3つまで比較できます。
          <span className="font-semibold ml-2">現在: {selectedReviews.length}/3選択</span>
        </p>
      </div>

      {/* Selection checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {allReviews.map((review) => (
          <div
            key={review.id}
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
          >
            <input
              type="checkbox"
              checked={selectedReviews.includes(review.id)}
              onChange={() => toggleReview(review.id)}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <p className="font-semibold text-foreground">{review.university}</p>
              <p className="text-sm text-muted-foreground">{review.country}</p>
            </div>
            <Link
              href={`/detail/${review.id}`}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              詳細
            </Link>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      {selectedData.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">項目</th>
                  {selectedData.map((review) => (
                    <th key={review.id} className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <div>
                          <div>{review.university}</div>
                          <div className="text-xs text-muted-foreground font-normal">{review.country}</div>
                        </div>
                        <Link
                          href={`/detail/${review.id}`}
                          className="ml-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
                        >
                          詳細
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">満足度</td>
                  {selectedData.map((review) => (
                    <td key={review.id} className="px-6 py-4 text-foreground">
                      <span className="text-lg text-accent">★</span> {review.satisfaction}/5.0
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">月額費用</td>
                  {selectedData.map((review) => (
                    <td key={review.id} className="px-6 py-4 text-foreground">
                      ¥{review.cost.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">語学レベル</td>
                  {selectedData.map((review) => (
                    <td key={review.id} className="px-6 py-4 text-foreground">
                      {review.language}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">投稿者</td>
                  {selectedData.map((review) => (
                    <td key={review.id} className="px-6 py-4 text-foreground">
                      {review.author}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cost comparison chart */}
          <div className="p-8 border-t border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">費用比較</h2>
            <div className="flex items-end gap-6 h-48">
              {selectedData.map((review) => {
                const maxCost = Math.max(...selectedData.map((r) => r.cost))
                const percentage = (review.cost / maxCost) * 100

                return (
                  <div key={review.id} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className="w-full bg-primary/20 rounded-t flex items-end justify-center"
                      style={{ height: `${percentage}%` }}
                    >
                      <span className="text-sm font-semibold text-foreground mb-2">
                        ¥{review.cost.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">{review.university}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {selectedData.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground">比較する留学先を選択してください</p>
        </div>
      )}
    </div>
  )
}















