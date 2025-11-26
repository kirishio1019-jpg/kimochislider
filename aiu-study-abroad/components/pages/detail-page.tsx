"use client"

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
  languageLevel: string
  author: string
  date: string
  excerpt: string
  strongFields: string[]
  fullReview: string
  positives: string[]
  challenges: string[]
  duration: string
  accommodation: string
}

const sampleReview: Review = {
  id: 1,
  country: "オーストラリア",
  university: "シドニー大学",
  title: "安定して勉強できる環境",
  satisfaction: 4.5,
  cost: 350000,
  language: "中上級",
  languageLevel: "中上級",
  author: "さくら",
  date: "2025年1月15日",
  excerpt: "生活費は少し高めですが、キャンパスが綺麗で過ごしやすいです。先生も親切で、わからないことはいつでも聞けました。",
  strongFields: ["Business Administration", "Communication & Media", "Sustainability & Environment"],
  fullReview:
    "シドニー大学での留学は本当に有意義でした。キャンパスの雰囲気が良く、図書館や施設も充実しています。留学生も多いので、サポートも手厚いです。",
  positives: [
    "キャンパスが綺麗で施設が充実している",
    "留学生向けのサポートが充実",
    "インターンシップの機会が多い",
  ],
  challenges: [
    "生活費が高い",
    "時差があるため家族との連絡が大変",
    "初期段階では言語の壁がある",
  ],
  duration: "1学年",
  accommodation: "大学寮",
}

export default function DetailPage({ reviewId }: DetailPageProps) {
  const review = sampleReview

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 bg-primary/12 text-primary text-xs font-semibold rounded-full border border-primary/20">
              {review.country}
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-secondary/12 text-secondary text-xs font-semibold rounded-full border border-secondary/20">
              {review.university}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{review.title}</h1>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>投稿者: {review.author}</span>
            <span>{review.date}</span>
          </div>
        </div>

        {/* Rating and Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8 bg-card border border-border rounded-lg p-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">満足度</p>
            <p className="text-2xl font-bold text-accent">{review.satisfaction}★</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">月額費用</p>
            <p className="text-xl font-bold text-foreground">¥{review.cost.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">語学レベル</p>
            <p className="text-xl font-bold text-foreground">{review.languageLevel}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">期間</p>
            <p className="text-xl font-bold text-foreground">{review.duration}</p>
          </div>
        </div>

        {/* Full Review */}
        <section className="mb-12 bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">レビュー全文</h2>
          <p className="text-foreground/90 leading-relaxed mb-6">{review.fullReview}</p>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3">良かった点</h3>
              <ul className="space-y-2">
                {review.positives.map((positive, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-accent font-bold mt-1">✓</span>
                    <span className="text-foreground/80">{positive}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">大変だった点</h3>
              <ul className="space-y-2">
                {review.challenges.map((challenge, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-destructive font-bold mt-1">!</span>
                    <span className="text-foreground/80">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Strong Fields */}
        <section className="mb-12 bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">大学の強い分野</h2>
          <div className="flex flex-wrap gap-3">
            {review.strongFields.map((field) => (
              <span
                key={field}
                className="inline-flex items-center px-4 py-2 bg-accent/12 text-accent font-medium rounded-full border border-accent/20"
              >
                {field}
              </span>
            ))}
          </div>
        </section>

        {/* Additional Info */}
        <section className="mb-12 bg-muted/40 border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">その他の情報</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">宿泊形式</p>
              <p className="text-lg font-semibold text-foreground">{review.accommodation}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">使用言語</p>
              <p className="text-lg font-semibold text-foreground">{review.language}</p>
            </div>
          </div>
        </section>

        {/* Comments Section */}
        <section className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">質問・コメント</h2>
          <form className="space-y-4 mb-8">
            <textarea
              placeholder="このレビューについて質問やコメントがあればお願いします。匿名です。"
              rows={4}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground"
            />
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
              送信
            </button>
          </form>

          {/* Sample Comments */}
          <div className="space-y-4">
            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">学生A</span>
                <span className="text-xs text-muted-foreground">3日前</span>
              </div>
              <p className="text-foreground/80">とても参考になりました。来年シドニーに留学するので、もっと詳しく聞きたいです！</p>
            </div>
            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">学生B</span>
                <span className="text-xs text-muted-foreground">1週間前</span>
              </div>
              <p className="text-foreground/80">奨学金についても教えてもらえますか？</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}



