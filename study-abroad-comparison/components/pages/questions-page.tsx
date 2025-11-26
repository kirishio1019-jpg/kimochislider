"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface Question {
  id: number
  author: string
  country: string
  university: string
  question: string
  answers: number
  date: string
  comments: Comment[]
}

interface Comment {
  id: number
  author: string
  content: string
  date: string
}

const initialQuestions: Question[] = []

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null)
  const [newQuestion, setNewQuestion] = useState("")
  const [newComment, setNewComment] = useState<Record<number, string>>({})
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  const [isClient, setIsClient] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [questionIsAnonymous, setQuestionIsAnonymous] = useState(false)
  const [commentIsAnonymous, setCommentIsAnonymous] = useState<Record<number, boolean>>({})

  // ユーザー情報を取得
  useEffect(() => {
    if (isSupabaseConfigured()) {
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
    }
  }, [])

  // クライアントサイドでのみlocalStorageから復元
  useEffect(() => {
    setIsClient(true)
    const savedQuestions = localStorage.getItem('questions')
    if (savedQuestions) {
      try {
        setQuestions(JSON.parse(savedQuestions))
      } catch (e) {
        // パースエラー時は初期値を使用
      }
    }
    const savedNewQuestion = localStorage.getItem('newQuestion')
    if (savedNewQuestion) {
      setNewQuestion(savedNewQuestion)
    }
    const savedComments = localStorage.getItem('newComments')
    if (savedComments) {
      try {
        setNewComment(JSON.parse(savedComments))
      } catch (e) {
        // パースエラー時は初期値を使用
      }
    }
    const savedExpanded = localStorage.getItem('expandedQuestions')
    if (savedExpanded) {
      try {
        const ids = JSON.parse(savedExpanded)
        setExpandedQuestions(new Set(ids))
      } catch (e) {
        // パースエラー時は初期値を使用
      }
    }
    const savedQuestionIsAnonymous = localStorage.getItem('questionIsAnonymous')
    if (savedQuestionIsAnonymous !== null) {
      setQuestionIsAnonymous(savedQuestionIsAnonymous === 'true')
    }
    const savedCommentIsAnonymous = localStorage.getItem('commentIsAnonymous')
    if (savedCommentIsAnonymous) {
      try {
        setCommentIsAnonymous(JSON.parse(savedCommentIsAnonymous))
      } catch (e) {
        // パースエラー時は初期値を使用
      }
    }
  }, [])

  // 質問データをlocalStorageに保存
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('questions', JSON.stringify(questions))
    }
  }, [questions, isClient])

  // 新規質問入力をlocalStorageに保存
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('newQuestion', newQuestion)
    }
  }, [newQuestion, isClient])

  // コメント入力をlocalStorageに保存
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('newComments', JSON.stringify(newComment))
    }
  }, [newComment, isClient])

  // 展開状態をlocalStorageに保存
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('expandedQuestions', JSON.stringify(Array.from(expandedQuestions)))
    }
  }, [expandedQuestions, isClient])

  // 匿名設定をlocalStorageに保存
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('questionIsAnonymous', questionIsAnonymous.toString())
    }
  }, [questionIsAnonymous, isClient])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('commentIsAnonymous', JSON.stringify(commentIsAnonymous))
    }
  }, [commentIsAnonymous, isClient])

  // ユーザー名を取得する関数
  const getUserDisplayName = (): string => {
    if (!user) return "匿名"
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split('@')[0] || 
           "ユーザー"
  }

  // 質問を投稿する
  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim()) return

    // ログインしていない場合は匿名で投稿
    const isAnonymous = !user || questionIsAnonymous
    const authorName = isAnonymous ? "匿名" : getUserDisplayName()

    const newQuestionData: Question = {
      id: Date.now(),
      author: authorName,
      country: "",
      university: "",
      question: newQuestion,
      answers: 0,
      date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
      comments: [],
    }

    // 最新のものが上に来るように先頭に追加
    setQuestions((prev) => [newQuestionData, ...prev])
    setNewQuestion("")
    // localStorageもクリア（useEffectで自動的にクリアされる）
    setExpandedQuestions((prev) => new Set([...prev, newQuestionData.id]))
  }

  // コメントを投稿する
  const handlePostComment = (questionId: number, e: React.FormEvent) => {
    e.preventDefault()
    const commentText = newComment[questionId]
    if (!commentText?.trim()) return

    // ログインしていない場合は匿名で投稿
    const isAnonymous = !user || commentIsAnonymous[questionId] === true // デフォルトは名前
    const authorName = isAnonymous ? "匿名" : getUserDisplayName()

    const newCommentData: Comment = {
      id: Date.now(),
      author: authorName,
      content: commentText,
      date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
    }

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            comments: [...q.comments, newCommentData],
            answers: q.comments.length + 1,
          }
        }
        return q
      })
    )

    setNewComment((prev) => ({
      ...prev,
      [questionId]: "",
    }))
  }

  // 質問の展開/折りたたみ
  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">質問・回答コーナー</h1>

      {/* New Question Form */}
      <section className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">質問を投稿する</h2>
        <form onSubmit={handlePostQuestion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">質問の内容</label>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="留学先の選択や、体験についての質問をしてください。"
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              required
            />
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="question-anonymous"
                checked={questionIsAnonymous}
                onChange={(e) => setQuestionIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="question-anonymous" className="text-sm text-foreground cursor-pointer">
                匿名で投稿する
              </label>
              {!questionIsAnonymous && (
                <span className="text-xs text-muted-foreground ml-2">
                  （{getUserDisplayName()}として投稿されます）
                </span>
              )}
              {questionIsAnonymous && (
                <span className="text-xs text-muted-foreground ml-2">
                  （匿名として投稿されます）
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              （ログインすると名前で投稿できます。現在は匿名で投稿されます）
            </div>
          )}
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
        <h2 className="text-lg font-semibold text-foreground mb-4">質問一覧</h2>
        {questions.map((q) => {
          const isExpanded = expandedQuestions.has(q.id)

          return (
            <div
              key={q.id}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              {/* Question Header */}
              <div
                className="p-6 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => toggleQuestion(q.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {q.country && q.university && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                          {q.country}
                        </span>
                        <span className="text-xs text-muted-foreground">{q.university}</span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-foreground mb-2">{q.question}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>質問者: {q.author}</span>
                      <span>{q.date}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-accent mb-1">{q.answers}</p>
                    <p className="text-xs text-muted-foreground">回答</p>
                  </div>
                </div>

                {/* Expand/Collapse Indicator */}
                <div className="flex items-center justify-center mt-4">
                  <svg
                    className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded Comments Section */}
              {isExpanded && (
                <div className="border-t border-border bg-background">
                  {/* Existing Comments */}
                  <div className="p-6 space-y-4">
                    {q.comments.length > 0 ? (
                      <>
                        <h4 className="font-semibold text-foreground mb-4">回答 ({q.comments.length}件)</h4>
                        {q.comments.map((comment) => (
                          <div key={comment.id} className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span className="font-medium text-foreground">{comment.author}</span>
                                <span className="text-xs text-muted-foreground ml-2">{comment.date}</span>
                              </div>
                            </div>
                            <p className="text-foreground/80 text-sm">{comment.content}</p>
                          </div>
                        ))}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">まだ回答がありません。最初の回答者になりましょう！</p>
                    )}

                    {/* Comment Form */}
                    <div className="border-t border-border pt-4 mt-4">
                      <h4 className="font-semibold text-foreground mb-3">回答を投稿する</h4>
                      <form onSubmit={(e) => handlePostComment(q.id, e)} className="space-y-3">
                        <textarea
                          value={newComment[q.id] || ""}
                          onChange={(e) =>
                            setNewComment((prev) => ({
                              ...prev,
                              [q.id]: e.target.value,
                            }))
                          }
                          placeholder="この質問への回答を入力してください..."
                          rows={3}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                          required
                        />
                        {user ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`comment-anonymous-${q.id}`}
                              checked={commentIsAnonymous[q.id] === true}
                              onChange={(e) =>
                                setCommentIsAnonymous((prev) => ({
                                  ...prev,
                                  [q.id]: e.target.checked,
                                }))
                              }
                              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <label htmlFor={`comment-anonymous-${q.id}`} className="text-sm text-foreground cursor-pointer">
                              匿名で投稿する
                            </label>
                            {commentIsAnonymous[q.id] !== true && (
                              <span className="text-xs text-muted-foreground ml-2">
                                （{getUserDisplayName()}として投稿されます）
                              </span>
                            )}
                            {commentIsAnonymous[q.id] === true && (
                              <span className="text-xs text-muted-foreground ml-2">
                                （匿名として投稿されます）
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            （ログインすると名前で投稿できます。現在は匿名で投稿されます）
                          </div>
                        )}
                        <button
                          type="submit"
                          className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                        >
                          回答を投稿
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
