"use client"

import type React from "react"

import { useState } from "react"

const sampleQuestions = [
  {
    id: 1,
    author: "あおい",
    country: "オーストラリア",
    university: "シドニー大学",
    question: "奨学金は取得しやすいですか？",
    answers: 2,
    points: 50,
    date: "2025年1月12日",
  },
  {
    id: 2,
    author: "りょう",
    country: "カナダ",
    university: "トロント大学",
    question: "冬の過ごし方のコツを教えてください",
    answers: 5,
    points: 120,
    date: "2025年1月8日",
  },
  {
    id: 3,
    author: "ひかり",
    country: "イギリス",
    university: "ロンドン大学",
    question: "アルバイトはできますか？",
    answers: 3,
    points: 80,
    date: "2025年1月1日",
  },
]

export default function QuestionsPage() {
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null)
  const [newQuestion, setNewQuestion] = useState("")

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    alert("質問が送信されました")
    setNewQuestion("")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">質問・回答コーナー</h1>

      {/* New Question Form */}
      <section className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">質問を投稿する（匿名）</h2>
        <form onSubmit={handlePostQuestion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">質問の内容</label>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="留学先の選択や、体験についての質問をしてください。匿名です。"
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            質問を投稿
          </button>
        </form>
      </section>

      {/* Questions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">最近の質問</h2>
        {sampleQuestions.map((q) => (
          <div
            key={q.id}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedQuestion(selectedQuestion === q.id ? null : q.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                    {q.country}
                  </span>
                  <span className="text-xs text-muted-foreground">{q.university}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{q.question}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>質問者: {q.author}</span>
                  <span>{q.date}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-accent mb-1">{q.answers}</p>
                <p className="text-xs text-muted-foreground">回答</p>
              </div>
            </div>

            {/* Answer Section - Expandable */}
            {selectedQuestion === q.id && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-semibold text-foreground mb-4">回答例</h4>
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-background rounded p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-foreground">先輩{i}</span>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">+{q.points}pt</span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {i === 1
                          ? "私の経験では、留学生向けの奨学金制度がいくつかあります。大学のウェブサイトで詳しく確認することをお勧めします。"
                          : "キャンパスの国際学生支援センターに問い合わせるのが一番確実です。スタッフが親切に対応してくれます。"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
