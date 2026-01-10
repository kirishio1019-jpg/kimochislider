"use client"

import { useState } from "react"

interface ReviewCardProps {
  review: {
    id: number
    country: string
    university: string
    title: string
    satisfaction: number
    cost: number
    language: string
    author: string
    date: string
    excerpt: string
    strongFields?: string[]
    costOfLiving?: string
  }
}

const costOfLivingLabels: Record<string, string> = {
  low: "低い（月15万円以下）",
  average: "平均的（月15～25万円）",
  high: "高い（月25～35万円）",
  "very-high": "非常に高い（月35万円以上）",
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [showAllFields, setShowAllFields] = useState(false)

  const handleClick = () => {
    // カスタムイベントを発火して詳細ページに遷移
    window.dispatchEvent(new CustomEvent('reviewDetailClick', { detail: { reviewId: review.id } }))
  }
  const getStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push("★")
      } else if (i === fullStars && hasHalfStar) {
        stars.push("½")
      } else {
        stars.push("☆")
      }
    }
    return stars.join("")
  }

  return (
    <div 
      className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-3 mb-4 flex-wrap">
            <span className="text-3xl font-extrabold text-foreground">
              {review.university}
            </span>
            <span className="text-lg font-semibold text-foreground">
              {review.country}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-foreground leading-relaxed">{review.title}</h3>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl text-accent">{getStars(review.satisfaction)}</span>
          <span className="text-sm font-medium text-foreground">{review.satisfaction}/5.0</span>
        </div>
      </div>

      <p className="text-foreground/90 mb-5 leading-relaxed">{review.excerpt}</p>

      <div className="mb-4 pb-4 border-b border-border/50">
        {review.strongFields && review.strongFields.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">強い分野</p>
            <div className="flex flex-wrap gap-2">
              {(showAllFields ? review.strongFields : review.strongFields.slice(0, 3)).map((field) => (
                <span
                  key={field}
                  className="inline-flex items-center px-2 py-1 bg-accent/12 text-accent text-xs font-medium rounded-full border border-accent/20"
                >
                  {field}
                </span>
              ))}
              {review.strongFields.length > 3 && !showAllFields && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAllFields(true)
                  }}
                  className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  +{review.strongFields.length - 3}
                </button>
              )}
              {showAllFields && review.strongFields.length > 3 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAllFields(false)
                  }}
                  className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  折りたたむ
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5 py-4 border-b border-border/50 bg-muted/30 px-3 rounded-lg">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">物価レベル</p>
          <p className="font-semibold text-foreground">
            {review.costOfLiving ? (costOfLivingLabels[review.costOfLiving] || review.costOfLiving) : "-"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">投稿者</p>
          <p className="font-semibold text-foreground">{review.author}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{review.date}</p>
        <button 
          onClick={(e) => {
            e.stopPropagation()
            handleClick()
          }}
          className="px-3 py-2 text-sm font-medium text-primary hover:text-secondary transition-colors group-hover:translate-x-1 duration-200"
        >
          詳細を見る →
        </button>
      </div>
    </div>
  )
}


