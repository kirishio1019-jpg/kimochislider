"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface DetailPageProps {
  reviewId: number
}

interface Review {
  id: number
  country: string
  university: string
  title: string
  satisfaction: number
  cost: number
  language: string
  author: string
  userId?: string // ユーザーID
  date: string
  excerpt: string
  strongFields?: string[]
  selectionReason?: string
  positives?: string
  challenges?: string
  major?: string
  studyMajor?: string
  startDate?: string
  startSeason?: string
  startYear?: string
  endDate?: string
  endSeason?: string
  endYear?: string
  vacationPeriod?: string
  creditsEarned?: string | number
  creditsTransferred?: string | number
  credits300Level?: string | number
  languageCert?: string
  languageScore?: string
  classLanguage?: string
  costOfLiving?: string
  costOfLivingNote?: string
  foodCost?: string
  rent?: string
  culturalImpression?: string
  safety?: string
  climate?: string
  dailyMeals?: string
  accommodation?: string
  extracurricularActivities?: string
  extracurricularActivitiesNote?: string
  region?: string
}

const costOfLivingLabels: Record<string, string> = {
  low: "低い（月15万円以下）",
  average: "平均的（月15～25万円）",
  high: "高い（月25～35万円）",
  "very-high": "非常に高い（月35万円以上）",
}

export default function DetailPage({ reviewId }: DetailPageProps) {
  const [review, setReview] = useState<Review | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // ユーザー認証状態を確認
  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
      }).catch((error) => {
        console.error('Failed to get user:', error)
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error)
    }
  }, [])

  useEffect(() => {
    setIsClient(true)
    // localStorageからレビューを読み込む
    const savedReviews = localStorage.getItem('reviews')
    if (savedReviews) {
      try {
        const reviews = JSON.parse(savedReviews)
        const foundReview = reviews.find((r: Review) => r.id === reviewId)
        if (foundReview) {
          setReview(foundReview)
          
          // ユーザーIDで作成者チェック
          if (user && foundReview.userId) {
            // 新しいデータ（userIdがある場合）
            setCanEdit(foundReview.userId === user.id)
            setCanDelete(foundReview.userId === user.id)
          } else if (user && !foundReview.userId) {
            // 古いデータ（userIdがない場合）- 後方互換性のため作成者名でチェック
            const reviewCreators = localStorage.getItem('reviewCreators')
            const creators = reviewCreators ? JSON.parse(reviewCreators) : {}
            const originalAuthor = creators[reviewId]
            // 古いデータは編集・削除不可に設定（セキュリティのため）
            setCanEdit(false)
            setCanDelete(false)
          } else {
            // ログインしていない場合
            setCanEdit(false)
            setCanDelete(false)
          }
        }
      } catch (e) {
        console.error('Failed to load review:', e)
      }
    }
  }, [reviewId, user])

  if (!isClient || !review) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">レビューを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  const handleBack = () => {
    // カスタムイベントを発火してホームページに戻る
    window.dispatchEvent(new CustomEvent('pageChange', { detail: { page: 'home' } }))
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

  const renderValue = (value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === "" || (typeof value === 'number' && value === 0)) {
      return <span className="text-muted-foreground">-</span>
    }
    if (typeof value === 'number') {
      return value.toLocaleString('ja-JP')
    }
    return value
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button and Edit Button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>戻る</span>
          </button>
          {review && (canEdit || canDelete) && (
            <div className="flex gap-3">
              {canEdit && (
                <button
                  onClick={() => {
                    // 編集ページに遷移（reviewIdをパラメータとして渡す）
                    window.dispatchEvent(new CustomEvent('pageChange', { detail: { page: 'edit-review', reviewId: review.id } }))
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
                >
                  編集する
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => {
                    // ログインチェック
                    if (!user) {
                      alert("削除するにはログインしてください。")
                      return
                    }

                    // 削除確認ダイアログ
                    if (confirm("このレビューを削除してもよろしいですか？この操作は取り消せません。")) {
                      // ユーザーIDで作成者チェック
                      if (review.userId && review.userId !== user.id) {
                        alert("このレビューを削除できるのは作成者のみです。")
                        return
                      }
                      
                      // localStorageからレビューを削除
                      const savedReviews = localStorage.getItem('reviews')
                      if (savedReviews) {
                        try {
                          const reviews = JSON.parse(savedReviews)
                          const filteredReviews = reviews.filter((r: Review) => r.id !== review.id)
                          localStorage.setItem('reviews', JSON.stringify(filteredReviews))
                          
                          // 作成者情報も削除（後方互換性のため）
                          const reviewCreators = localStorage.getItem('reviewCreators')
                          if (reviewCreators) {
                            const creators = JSON.parse(reviewCreators)
                            delete creators[review.id]
                            localStorage.setItem('reviewCreators', JSON.stringify(creators))
                          }
                          
                          // レビュー更新イベントを発火
                          window.dispatchEvent(new Event('reviewUpdated'))
                          
                          // ホームページに戻る
                          window.dispatchEvent(new CustomEvent('pageChange', { detail: { page: 'home' } }))
                          
                          alert("レビューを削除しました")
                        } catch (e) {
                          console.error('Failed to delete review:', e)
                          alert("レビューの削除に失敗しました")
                        }
                      }
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
                >
                  削除する
                </button>
              )}
            </div>
          )}
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-baseline gap-3 mb-6 flex-wrap">
            <span className="text-3xl font-extrabold text-foreground">
              {review.university}
            </span>
            <span className="text-lg font-semibold text-foreground">
              {review.country}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{review.title}</h1>
          <div className="flex items-center justify-between text-muted-foreground mb-6">
            <span>投稿者: {review.author}</span>
            <span>{review.date}</span>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl text-accent">{getStars(review.satisfaction)}</span>
            <span className="text-lg font-semibold text-foreground">{review.satisfaction.toFixed(1)}/5.0</span>
          </div>
        </div>

        {/* 1. 学業・専攻情報 */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">1</span>
            <h2 className="text-xl font-semibold text-foreground">学業・専攻情報</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {review.major && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">メジャー</p>
                <p className="text-lg font-semibold text-foreground">{review.major}</p>
              </div>
            )}
            {review.studyMajor && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">留学先での専攻</p>
                <p className="text-lg font-semibold text-foreground">{review.studyMajor}</p>
              </div>
            )}
          </div>

          {review.strongFields && review.strongFields.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">大学の強い分野</p>
              <div className="flex flex-wrap gap-2">
                {review.strongFields.map((field) => (
                  <span
                    key={field}
                    className="inline-flex items-center px-3 py-1 bg-accent/12 text-accent text-sm font-medium rounded-full border border-accent/20"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          {review.selectionReason && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">大学を選んだ理由</p>
              <p className="text-foreground whitespace-pre-wrap">{review.selectionReason}</p>
            </div>
          )}
        </section>

        {/* 2. 留学期間 */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">2</span>
            <h2 className="text-xl font-semibold text-foreground">留学期間</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">留学開始日</p>
              <p className="text-lg font-semibold text-foreground">
                {renderValue(
                  review.startDate || 
                  (review.startYear && review.startSeason ? `${review.startYear}年 ${review.startSeason}` : 
                   review.startYear ? `${review.startYear}年` : 
                   review.startSeason || "")
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">留学終了日</p>
              <p className="text-lg font-semibold text-foreground">
                {renderValue(
                  review.endDate || 
                  (review.endYear && review.endSeason ? `${review.endYear}年 ${review.endSeason}` : 
                   review.endYear ? `${review.endYear}年` : 
                   review.endSeason || "")
                )}
              </p>
            </div>
          </div>

          {review.vacationPeriod && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">長期休暇の期間</p>
              <p className="text-lg font-semibold text-foreground">{review.vacationPeriod}</p>
            </div>
          )}
        </section>

        {/* 3. 学業成果 */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">3</span>
            <h2 className="text-xl font-semibold text-foreground">学業成果</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">現地で取得した単位数</p>
              <p className="text-lg font-semibold text-foreground">{renderValue(review.creditsEarned)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">AIUへ持ち帰った単位数</p>
              <p className="text-lg font-semibold text-foreground">{renderValue(review.creditsTransferred)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">持ち帰った300番台の単位数</p>
              <p className="text-lg font-semibold text-foreground">{renderValue(review.credits300Level)}</p>
            </div>
          </div>
        </section>

        {/* 4. 語学・コミュニケーション力 */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">4</span>
            <h2 className="text-xl font-semibold text-foreground">語学・コミュニケーション力</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">語学資格（留学前）</p>
              <p className="text-lg font-semibold text-foreground">{renderValue(review.languageCert)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">スコア（留学前）</p>
              <p className="text-lg font-semibold text-foreground">{renderValue(review.languageScore)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">授業言語</p>
              <p className="text-lg font-semibold text-foreground">{renderValue(review.classLanguage || review.language)}</p>
            </div>
          </div>
        </section>

        {/* 5. 生活・文化情報 */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">5</span>
            <h2 className="text-xl font-semibold text-foreground">生活・文化情報</h2>
          </div>

          {/* 費用関連 */}
          {(review.costOfLiving || review.foodCost || review.rent) && (
            <div className="space-y-4 pb-6 border-b border-border/50">
              <h3 className="text-base font-semibold text-foreground mb-4">費用</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {review.costOfLiving && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">物価レベル</p>
                    <p className="text-sm text-foreground font-medium">
                      {costOfLivingLabels[review.costOfLiving] || review.costOfLiving}
                    </p>
                    {review.costOfLivingNote && (
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap leading-relaxed">{review.costOfLivingNote}</p>
                    )}
                  </div>
                )}
                {review.foodCost && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">食費（月額）</p>
                    <p className="text-sm text-foreground font-medium">{review.foodCost}</p>
                  </div>
                )}
                {review.rent && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">家賃（月額）</p>
                    <p className="text-sm text-foreground font-medium">{review.rent}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 文化・環境関連 */}
          {(review.culturalImpression || review.safety || review.climate) && (
            <div className="space-y-4 pb-6 border-b border-border/50">
              <h3 className="text-base font-semibold text-foreground mb-4">文化・環境</h3>
              <div className="space-y-4">
                {review.culturalImpression && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">国民性の印象</p>
                    <p className="text-sm text-foreground leading-relaxed">{review.culturalImpression}</p>
                  </div>
                )}
                {review.safety && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">治安</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{review.safety}</p>
                  </div>
                )}
                {review.climate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">気候</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{review.climate}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 日常生活関連 */}
          {(review.dailyMeals || review.accommodation || review.extracurricularActivities) && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground mb-4">日常生活</h3>
              <div className="space-y-4">
                {review.dailyMeals && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">日々の食事</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{review.dailyMeals}</p>
                  </div>
                )}
                {review.accommodation && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">住んでいた場所</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{review.accommodation}</p>
                  </div>
                )}
                {review.extracurricularActivities && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">課外活動</p>
                    <p className="text-sm text-foreground font-medium">{review.extracurricularActivities}</p>
                    {review.extracurricularActivitiesNote && (
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap leading-relaxed">{review.extracurricularActivitiesNote}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 6. 総合レビュー */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">6</span>
            <h2 className="text-xl font-semibold text-foreground">総合レビュー</h2>
          </div>

          <div className="space-y-6">
            {review.positives && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-border/50">良かった点</h3>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">{review.positives}</p>
              </div>
            )}

            {review.challenges && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-border/50">大変だった点</h3>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">{review.challenges}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
