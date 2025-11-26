"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Question, Answer } from '@/types'
import { getQuestions, addQuestion, addAnswer } from '@/lib/storage'

const countries = ["オーストラリア", "カナダ", "イギリス", "アメリカ", "その他"]
const universities: Record<string, string[]> = {
  "オーストラリア": ["シドニー大学", "メルボルン大学", "その他"],
  "カナダ": ["トロント大学", "ブリティッシュコロンビア大学", "その他"],
  "イギリス": ["ロンドン大学", "オックスフォード大学", "その他"],
  "アメリカ": ["スタンフォード大学", "ハーバード大学", "その他"],
  "その他": ["その他"]
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null)
  const [newQuestion, setNewQuestion] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedUniversity, setSelectedUniversity] = useState("")
  const [newAnswerText, setNewAnswerText] = useState<Record<number, string>>({})
  const [showAnswerForm, setShowAnswerForm] = useState<Record<number, boolean>>({})

  useEffect(() => {
    setQuestions(getQuestions())
  }, [])

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim() || !selectedCountry || !selectedUniversity) {
      alert("質問内容、国、大学をすべて入力してください")
      return
    }

    const question = addQuestion({
      author: "匿名ユーザー",
      country: selectedCountry,
      university: selectedUniversity,
      question: newQuestion.trim()
    })

    setQuestions(getQuestions())
    setNewQuestion("")
    setSelectedCountry("")
    setSelectedUniversity("")
    alert("質問が投稿されました！")
  }

  const handleAddAnswer = (questionId: number) => {
    const answerText = newAnswerText[questionId]?.trim()
    if (!answerText) {
      alert("回答を入力してください")
      return
    }

    addAnswer(questionId, {
      author: "先輩" + (Math.floor(Math.random() * 100) + 1),
      content: answerText,
      points: Math.floor(Math.random() * 30) + 20 // 20-50ポイント
    })

    setQuestions(getQuestions())
    setNewAnswerText({ ...newAnswerText, [questionId]: "" })
    setShowAnswerForm({ ...showAnswerForm, [questionId]: false })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">質問・回答コーナー</h1>
        <Link
          href="/"
          className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          ホームに戻る
        </Link>
      </div>

      {/* New Question Form */}
      <section className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">質問を投稿する（匿名）</h2>
        <form onSubmit={handlePostQuestion} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">国</label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value)
                  setSelectedUniversity("")
                }}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                required
              >
                <option value="">選択してください</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">大学</label>
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                required
                disabled={!selectedCountry}
              >
                <option value="">選択してください</option>
                {selectedCountry && universities[selectedCountry]?.map((university) => (
                  <option key={university} value={university}>
                    {university}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
        {questions.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">まだ質問がありません。最初の質問を投稿してみましょう！</p>
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
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
                  <p className="text-lg font-bold text-accent mb-1">{q.answers.length}</p>
                  <p className="text-xs text-muted-foreground">回答</p>
                  <p className="text-xs text-muted-foreground mt-1">{q.points}pt</p>
                </div>
              </div>

              {/* Toggle button */}
              <button
                onClick={() => setSelectedQuestion(selectedQuestion === q.id ? null : q.id)}
                className="mt-4 text-sm text-primary hover:underline"
              >
                {selectedQuestion === q.id ? "回答を閉じる" : "回答を見る"}
              </button>

              {/* Answer Section - Expandable */}
              {selectedQuestion === q.id && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-foreground">回答 ({q.answers.length}件)</h4>
                    <button
                      onClick={() => setShowAnswerForm({ ...showAnswerForm, [q.id]: !showAnswerForm[q.id] })}
                      className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      {showAnswerForm[q.id] ? "キャンセル" : "回答を投稿"}
                    </button>
                  </div>

                  {/* Answer Form */}
                  {showAnswerForm[q.id] && (
                    <div className="mb-4 p-4 bg-background rounded-lg border border-border">
                      <textarea
                        value={newAnswerText[q.id] || ""}
                        onChange={(e) => setNewAnswerText({ ...newAnswerText, [q.id]: e.target.value })}
                        placeholder="回答を入力してください..."
                        rows={3}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mb-2"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setShowAnswerForm({ ...showAnswerForm, [q.id]: false })
                            setNewAnswerText({ ...newAnswerText, [q.id]: "" })
                          }}
                          className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={() => handleAddAnswer(q.id)}
                          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                        >
                          投稿
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Answers List */}
                  {q.answers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>まだ回答がありません。最初の回答を投稿してみましょう！</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {q.answers.map((answer) => (
                        <div key={answer.id} className="bg-background rounded p-4">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium text-foreground">{answer.author}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                                +{answer.points}pt
                              </span>
                              <span className="text-xs text-muted-foreground">{answer.date}</span>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">{answer.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
