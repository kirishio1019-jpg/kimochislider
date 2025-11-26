"use client"
import { useState, useEffect } from "react"
import ReviewCard from "@/components/review-card"
import CountryStatsGrid from "@/components/country-stats-grid"

const sampleReviews: any[] = []

export default function HomePage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // localStorageから投稿されたレビューを読み込む
    const savedReviews = localStorage.getItem('reviews')
    if (savedReviews) {
      try {
        const parsedReviews = JSON.parse(savedReviews)
        // 最新順（IDの降順）でソート
        parsedReviews.sort((a: any, b: any) => b.id - a.id) // 最新が上
        setReviews(parsedReviews)
      } catch (e) {
        // パースエラー時は空配列
      }
    }
  }, [])

  // レビューが更新されたときのリスナー（別のタブやウィンドウでの更新を検知）
  useEffect(() => {
    if (!isClient) return
    
    const handleStorageChange = () => {
      const savedReviews = localStorage.getItem('reviews')
      if (savedReviews) {
        try {
          const parsedReviews = JSON.parse(savedReviews)
          parsedReviews.sort((a: any, b: any) => b.id - a.id)
          setReviews(parsedReviews)
        } catch (e) {
          // パースエラー時は無視
        }
      } else {
        setReviews([])
      }
    }

    window.addEventListener('storage', handleStorageChange)
    // 同じウィンドウ内での更新も検知（カスタムイベント）
    window.addEventListener('reviewUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('reviewUpdated', handleStorageChange)
    }
  }, [isClient])
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-card via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center">
            <div className="inline-block mb-4 px-3 sm:px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <p className="text-responsive-sm font-medium text-primary break-words">世界中の留学体験にアクセス</p>
            </div>
            <h1 className="text-responsive-5xl sm:text-responsive-6xl font-bold text-foreground mb-6 text-balance leading-tight break-words">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">あなたはどこを選ぶ？</span>
            </h1>
            <p className="text-responsive-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance leading-relaxed break-words px-4">
                先輩のリアルな留学体験にアクセス。自分の条件に近い声を探して、最適な留学先を見つけよう。
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-muted/50 border border-border/50 rounded-lg px-6 py-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-responsive-sm text-muted-foreground leading-relaxed break-words">
                <span className="font-medium text-foreground">ご注意：</span>
                本サイトに掲載されている情報は、学生の個人体験談に基づく非公式な情報です。正確な留学情報や最新の情報については、必ず
                <span className="font-medium text-foreground">大学の公式ホームページ</span>
                や
                <span className="font-medium text-foreground">留学担当部署</span>
                にてご確認ください。正式な手続きや要件については、公式の情報源をご参照ください。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Countries Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="mb-2">
          <h2 className="text-responsive-3xl font-bold text-foreground mb-2 break-words">人気の留学先</h2>
          <p className="text-responsive-base text-muted-foreground break-words">多くの学生が注目している国をチェック</p>
        </div>
        <div className="mt-8">
          <CountryStatsGrid />
        </div>
      </section>

      {/* Recent Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-responsive-3xl font-bold text-foreground mb-2 break-words">最新レビュー</h2>
          <p className="text-responsive-base text-muted-foreground break-words">新しく投稿された体験談をチェック</p>
        </div>
        <div className="grid gap-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground mb-2">まだレビューがありません。</p>
              <p className="text-sm text-muted-foreground">最初のレビューを投稿してみましょう！</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer Section */}
      <section className="bg-muted/40 border-t border-border/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">© 2025 AIU Study Abroad Hub. すべての権利を保有しています。</p>
          </div>
        </div>
      </section>
    </div>
  )
}


