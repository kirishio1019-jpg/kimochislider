"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import HomePage from "@/components/pages/home-page"
import SearchPage from "@/components/pages/search-page"
import ReviewFormPage from "@/components/pages/review-form-page"
import QuestionsPage from "@/components/pages/questions-page"
import ComparisonPage from "@/components/pages/comparison-page"
import DetailPage from "@/components/pages/detail-page"

export default function App() {
  const [currentPage, setCurrentPage] = useState("home")
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null)

  const renderPage = () => {
    switch (currentPage) {
      case "search":
        return <SearchPage />
      case "post-review":
        return <ReviewFormPage />
      case "questions":
        return <QuestionsPage />
      case "comparison":
        return <ComparisonPage />
      case "detail":
        return selectedReviewId ? <DetailPage reviewId={selectedReviewId} /> : <HomePage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
    </div>
  )
}



