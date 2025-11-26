"use client"
import ReviewCard from "@/components/review-card"
import CountryStatsGrid from "@/components/country-stats-grid"

const sampleReviews = [
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
    excerpt:
      "生活費は少し高めですが、キャンパスが綺麗で過ごしやすいです。先生も親切で、わからないことはいつでも聞けました。",
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
    excerpt: "カナダの多文化社会を体験できました。冬は非常に寒いので、防寒対策をしっかりしましょう。",
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
    excerpt: "世界中から来た学生との出会いが最高。授業のレベルは高めですが、刺激的です。",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-card via-background to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <p className="text-sm font-medium text-primary">世界中の留学体験にアクセス</p>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance leading-tight">
              留学先の決定に
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">迷わない</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
              先輩のリアルな留学体験にアクセス。自分に近い条件の声を探して、最適な留学先を見つけよう。
            </p>
          </div>
        </div>
      </section>

      {/* Popular Countries Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-2">
          <h2 className="text-3xl font-bold text-foreground mb-2">人気の留学先</h2>
          <p className="text-muted-foreground">多くの学生が注目している国をチェック</p>
        </div>
        <div className="mt-8">
          <CountryStatsGrid />
        </div>
      </section>

      {/* Recent Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">最新レビュー</h2>
          <p className="text-muted-foreground">新しく投稿された体験談をチェック</p>
        </div>
        <div className="grid gap-6">
          {sampleReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
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



