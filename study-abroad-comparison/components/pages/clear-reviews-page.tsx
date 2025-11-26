"use client"

import { useState } from "react"

export default function ClearReviewsPage() {
  const [isCleared, setIsCleared] = useState(false)

  const handleClear = () => {
    if (confirm("すべてのレビューを削除してもよろしいですか？この操作は取り消せません。")) {
      localStorage.removeItem('reviews')
      localStorage.removeItem('reviewCreators')
      localStorage.removeItem('reviewFormData')
      setIsCleared(true)
      window.dispatchEvent(new Event('reviewUpdated'))
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('pageChange', { detail: { page: 'home' } }))
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          {!isCleared ? (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-4">レビューを削除</h2>
              <p className="text-muted-foreground mb-6">
                すべてのレビューデータを削除します。この操作は取り消せません。
              </p>
              <button
                onClick={handleClear}
                className="px-6 py-3 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                すべてのレビューを削除
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-4">削除完了</h2>
              <p className="text-muted-foreground">
                すべてのレビューが削除されました。ホームページに戻ります...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


