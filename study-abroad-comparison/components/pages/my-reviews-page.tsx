"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import ReviewCard from "@/components/review-card"

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // ユーザー認証状態を確認
    try {
      const supabase = createClient()
      
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
        
        // ログインしていない場合は空配列を設定
        if (!user) {
          setReviews([])
          setIsLoading(false)
          return
        }
        
        // 自分のレビューを読み込む
        loadMyReviews(user.id)
      }).catch((error) => {
        console.error('Failed to get user:', error)
        setIsLoading(false)
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          loadMyReviews(session.user.id)
        } else {
          setReviews([])
        }
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error)
      setIsLoading(false)
    }
  }, [])

  const loadMyReviews = (userId: string) => {
    const savedReviews = localStorage.getItem('reviews')
    if (savedReviews) {
      try {
        const allReviews = JSON.parse(savedReviews)
        // 自分のレビューのみをフィルタリング
        const myReviews = allReviews.filter((review: any) => {
          // userIdで一致を確認
          if (review.userId && review.userId === userId) {
            return true
          }
          // 後方互換性: reviewCreatorsも確認
          const reviewCreators = localStorage.getItem('reviewCreators')
          if (reviewCreators) {
            const creators = JSON.parse(reviewCreators)
            return creators[review.id] === userId
          }
          return false
        })
        
        // 最新順でソート
        myReviews.sort((a: any, b: any) => b.id - a.id)
        setReviews(myReviews)
      } catch (e) {
        console.error('Failed to load reviews:', e)
        setReviews([])
      }
    } else {
      setReviews([])
    }
    setIsLoading(false)
  }

  // レビューが更新されたときのリスナー
  useEffect(() => {
    if (!isClient || !user) return
    
    const handleStorageChange = () => {
      loadMyReviews(user.id)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('reviewUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('reviewUpdated', handleStorageChange)
    }
  }, [isClient, user])

  const handleEdit = (reviewId: number) => {
    window.dispatchEvent(new CustomEvent('pageChange', { detail: { page: 'edit-review', reviewId } }))
  }

  const handleDelete = async (reviewId: number) => {
    if (!user) return
    
    if (!confirm("このレビューを削除してもよろしいですか？この操作は取り消せません。")) {
      return
    }

    const savedReviews = localStorage.getItem('reviews')
    if (savedReviews) {
      try {
        const allReviews = JSON.parse(savedReviews)
        const reviewToDelete = allReviews.find((r: any) => r.id === reviewId)
        
        // 作成者チェック
        if (reviewToDelete && reviewToDelete.userId !== user.id) {
          alert("このレビューを削除できるのは作成者のみです。")
          return
        }
        
        const filteredReviews = allReviews.filter((r: any) => r.id !== reviewId)
        localStorage.setItem('reviews', JSON.stringify(filteredReviews))
        
        // 作成者情報も削除
        const reviewCreators = localStorage.getItem('reviewCreators')
        if (reviewCreators) {
          const creators = JSON.parse(reviewCreators)
          delete creators[reviewId]
          localStorage.setItem('reviewCreators', JSON.stringify(creators))
        }

        alert("レビューを削除しました。")
        window.dispatchEvent(new Event('reviewUpdated'))
        loadMyReviews(user.id)
      } catch (e) {
        console.error('Failed to delete review:', e)
        alert('レビューの削除中にエラーが発生しました。')
      }
    }
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">レビューを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <h2 className="text-2xl font-bold text-foreground mb-4">ログインが必要です</h2>
            <p className="text-muted-foreground mb-6">
              マイレビューを表示するには、Googleでログインしてください。
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">マイレビュー</h1>
          <p className="text-muted-foreground">
            あなたが投稿したレビューの一覧です。編集や削除ができます。
          </p>
        </div>

        {/* レビュー一覧 */}
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="relative group">
                <ReviewCard review={review} />
                {/* アクションボタン */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(review.id)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm shadow-lg"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm shadow-lg"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
            <div className="text-center text-sm text-muted-foreground mt-8">
              {reviews.length}件のレビューを投稿しています
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground mb-2">まだレビューを投稿していません。</p>
            <p className="text-sm text-muted-foreground mb-6">
              最初のレビューを投稿してみましょう！
            </p>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('pageChange', { detail: { page: 'post-review' } }))
              }}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 font-medium"
            >
              レビューを投稿する
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

