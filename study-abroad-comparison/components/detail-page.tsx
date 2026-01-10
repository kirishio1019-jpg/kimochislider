"use client"

import { useState } from "react"
import Link from "next/link"

interface DetailPageProps {
  reviewId: number
}

const allReviews = [
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
    excerpt:
      "生活費は少し高めですが、キャンパスが綺麗で過ごしやすいです。先生も親切で、わからないことはいつでも聞けました。",
    duration: "1年",
    accommodation: "学生寮",
    positives: "キャンパスが新しく施設が充実。図書館が24時間開放。国際学生が多く、異文化交流が活発。",
    challenges: "生活費が高い（特に食事）。冬は日が短い。学費のサポートが限定的。",
    fullReview:
      "シドニー大学での1年間の留学は、私の人生で最高の経験の一つでした。最初は環境に適応するのに時間がかかりましたが、プログラムが充実していて、サポートが素晴らしかったです。特に図書館のスタッフは常に親切で、困ったことがあればいつでも助けてくれました。",
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
    excerpt: "カナダの多文化社会を体験できました。冬は非常に寒いので、防寒対策をしっかりしましょう。",
    duration: "1年",
    accommodation: "ホームステイ",
    positives: "留学生へのサポートが充実。キャンパスが広く環境が良い。カナダ人がとてもフレンドリー。",
    challenges: "冬の寒さが想像以上。英語のなまりが強い。物価が少し高い。",
    fullReview:
      "トロント大学でのホームステイ生活は、私に多くの学びをもたらしました。ホストファミリーはとても親切で、カナダの文化を深く理解することができました。大学のキャンパスも広く、様々な施設があり、勉強に集中できる環境が整っていました。",
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
    excerpt: "世界中から来た学生との出会いが最高。授業のレベルは高めですが、刺激的です。",
    duration: "1年半",
    accommodation: "シェアハウス",
    positives: "世界トップレベルの教育が受けられる。ロンドンは文化的に豊か。学生のレベルが高い。",
    challenges: "授業の難度が非常に高い。イギリス英語に慣れるのに時間がかかる。物価が非常に高い。",
    fullReview:
      "ロンドン大学での留学は、アカデミックな刺激に満ちていました。授業のレベルが高く、最初は大変でしたが、世界中から集まった優秀な学生たちとの交流が、私の視野を大きく広げてくれました。",
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
    excerpt: "世界最高レベルの教育環境。学生の質も高く、刺激的な毎日でした。",
    duration: "2年",
    accommodation: "学生寮",
    positives: "世界トップクラスの教育。最新の研究設備。優秀な学生との交流。",
    challenges: "学費が非常に高い。競争が激しい。生活費も高い。",
    fullReview:
      "スタンフォード大学での2年間は、私の人生を変える経験でした。世界最高レベルの教育環境と、優秀な学生たちとの交流は、私の視野を大きく広げてくれました。",
  },
]

export default function DetailPage({ reviewId }: DetailPageProps) {
  const review = allReviews.find((r) => r.id === reviewId)
  const [isComparing, setIsComparing] = useState(false)

  if (!review) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-center text-muted-foreground">レビューが見つかりません</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header with comparison button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/comparison"
              className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              比較ページへ
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              ホームに戻る
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{review.title}</h1>
        </div>
        <button
          onClick={() => setIsComparing(!isComparing)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity ml-4"
        >
          {isComparing ? "比較を閉じる" : "他と比較"}
        </button>
      </div>

      {/* Basic info badges */}
      <div className="flex items-center gap-2 mb-8">
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
          {review.country}
        </span>
        <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary-foreground text-sm font-medium rounded-full">
          {review.university}
        </span>
      </div>

      {/* Main content */}
      <div className="bg-card border border-border rounded-lg p-8 mb-8">
        {/* Rating */}
        <div className="mb-6 pb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-4xl text-accent">★★★★★</span>
            <div>
              <p className="text-2xl font-bold text-foreground">{review.satisfaction}/5.0</p>
              <p className="text-muted-foreground">総合満足度</p>
            </div>
          </div>
        </div>

        {/* Key information grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">月額費用</p>
            <p className="font-semibold text-foreground">¥{review.cost.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">語学レベル</p>
            <p className="font-semibold text-foreground">{review.language}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">留学期間</p>
            <p className="font-semibold text-foreground">{review.duration}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">宿泊形式</p>
            <p className="font-semibold text-foreground">{review.accommodation}</p>
          </div>
        </div>

        {/* Full review */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">レビュー</h2>
          <p className="text-foreground leading-relaxed mb-4">{review.fullReview}</p>
        </div>

        {/* Positives and Challenges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-background rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3 text-green-600">良かった点</h3>
            <p className="text-foreground text-sm leading-relaxed">{review.positives}</p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3 text-orange-600">大変だった点</h3>
            <p className="text-foreground text-sm leading-relaxed">{review.challenges}</p>
          </div>
        </div>

        {/* Author info */}
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            投稿者: {review.author} / {review.date}
          </p>
        </div>
      </div>

      {/* Comparison section */}
      {isComparing && (
        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">他の留学先と比較</h2>
          <div className="space-y-4">
            {allReviews
              .filter((r) => r.id !== reviewId)
              .map((other) => (
                <div
                  key={other.id}
                  className="bg-background rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{other.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {other.country} - {other.university}
                      </p>
                      <div className="text-sm text-foreground">
                        <span>満足度: {other.satisfaction}/5 | </span>
                        <span>費用: ¥{other.cost.toLocaleString()} | </span>
                        <span>語学: {other.language}</span>
                      </div>
                    </div>
                    <Link
                      href={`/detail/${other.id}`}
                      className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
                    >
                      詳細
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}















