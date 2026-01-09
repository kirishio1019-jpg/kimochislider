"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, Mail, Copy, Check, Download, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Event } from "@/types"
import { SCORE_CATEGORIES, getScoreCategory } from "@/types"
import { getAppUrl } from "@/lib/utils"

interface DashboardClientProps {
  event: Event
  stats: {
    total: number
    average_score: number
    category_distribution: { category: string; count: number }[]
  }
  responses: Array<{
    id: string
    score: number
    category: string
    email: string | null
    created_at: string
    updated_at: string
  }>
}

export default function DashboardClient({
  event,
  stats,
  responses,
}: DashboardClientProps) {
  const router = useRouter()
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedEmails, setCopiedEmails] = useState(false)
  const [copiedMessage, setCopiedMessage] = useState(false)
  const [origin, setOrigin] = useState<string>('')
  
  // admin_tokenを取得（URLから）
  const adminToken = typeof window !== 'undefined' 
    ? window.location.pathname.split('/')[2] 
    : ''

  // クライアントサイドでのみoriginを取得
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(getAppUrl())
    }
  }, [])

  const startDate = new Date(event.start_at)
  const publicUrl = origin ? `${origin}/e/${event.slug}` : ''

  // Filter responses
  const filteredResponses = filterCategory
    ? responses.filter((r) => getScoreCategory(r.score) === filterCategory)
    : responses

  // Responses with email
  const responsesWithEmail = filteredResponses.filter((r) => r.email)

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  const generateReminderMessage = () => {
    return `【${event.title}】リマインド

イベントが近づいてきました。
改めて、参加したい気持ちを教えてください。

イベント詳細:
日時: ${startDate.toLocaleDateString("ja-JP")} ${startDate.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
場所: ${event.location_text}

あなたの気持ちを更新:
[更新用リンクをここに挿入]

これは参加確定ではありません。
いつでも気持ちの更新が可能です。`
  }

  const generateCSV = () => {
    const headers = ["回答日時", "更新日時", "気持ち", "スコア", "メール"]
    const rows = responses.map((r) => [
      new Date(r.created_at).toLocaleString("ja-JP"),
      new Date(r.updated_at).toLocaleString("ja-JP"),
      getScoreCategory(r.score),
      r.score,
      r.email || "",
    ])

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${event.slug}-responses.csv`)
    link.click()
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl py-8">
        <div className="mb-10 flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <h1 className="text-3xl font-light leading-tight tracking-wide md:text-4xl">{event.title}</h1>
              <p className="text-base font-light leading-relaxed text-muted-foreground">{event.description_short}</p>
            </div>
            <Button
              onClick={() => router.push(`/admin/${adminToken}/events/${event.id}/manage`)}
              variant="outline"
              className="gap-2 font-light shrink-0"
            >
              <Settings className="size-4" />
              詳細管理
            </Button>
          </div>

          {/* Public URL */}
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm shadow-sm">
            <CardContent className="flex flex-col gap-4 py-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                  <span className="text-sm font-normal">公開URL（通常版）</span>
                  <code className="truncate font-sans text-xs text-muted-foreground">{publicUrl || '読み込み中...'}</code>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(publicUrl, setCopiedLink)}
                  className="shrink-0 gap-2 font-light shadow-sm"
                  disabled={!publicUrl}
                >
                  {copiedLink ? (
                    <Check className="size-4" strokeWidth={1.5} />
                  ) : (
                    <Copy className="size-4" strokeWidth={1.5} />
                  )}
                  <span className="text-xs">コピー</span>
                </Button>
              </div>
              
              <div className="border-t border-border/60 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                    <span className="text-sm font-light text-foreground">公開URL</span>
                    <code className="truncate font-sans text-xs text-muted-foreground">{origin ? `${origin}/e/${event.slug}` : '読み込み中...'}</code>
                    <p className="text-xs text-muted-foreground mt-1">
                      メッセージアプリ内で開くと自動的にコンパクト表示になります。
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`${origin}/e/${event.slug}`, setCopiedLink)}
                    disabled={!origin}
                    className="shrink-0 gap-2 font-light shadow-sm"
                  >
                    {copiedLink ? (
                      <Check className="size-4" strokeWidth={1.5} />
                    ) : (
                      <Copy className="size-4" strokeWidth={1.5} />
                    )}
                    <span className="text-xs">コピー</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <Card className="border-border/40 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-sm font-light">回答人数</CardTitle>
              <div className="flex size-11 items-center justify-center rounded-full bg-primary/5 ring-1 ring-primary/10 backdrop-blur-sm">
                <Users className="size-5 text-primary" strokeWidth={1.5} />
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <div className="text-3xl font-light tracking-wide">{stats.total}</div>
              <p className="text-xs font-light text-muted-foreground/80">気持ちを入力した人数</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-sm font-light">平均スコア</CardTitle>
              <div className="flex size-11 items-center justify-center rounded-full bg-accent/5 ring-1 ring-accent/10 backdrop-blur-sm">
                <TrendingUp className="size-5 text-accent" strokeWidth={1.5} />
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <div className="font-sans text-3xl font-light tracking-wide">{stats.average_score.toFixed(1)}</div>
              <p className="text-xs font-light text-muted-foreground/80">0-100の内部値</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-sm font-light">メール登録</CardTitle>
              <div className="flex size-11 items-center justify-center rounded-full bg-chart-3/5 ring-1 ring-chart-3/10 backdrop-blur-sm">
                <Mail className="size-5 text-chart-3" strokeWidth={1.5} />
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <div className="text-3xl font-light tracking-wide">{responses.filter((r) => r.email).length}</div>
              <p className="text-xs font-light text-muted-foreground/80">リマインド希望者</p>
            </CardContent>
          </Card>
        </div>

        {/* Distribution */}
        <Card className="mb-10 border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-light tracking-wide text-foreground">気持ちの分布</CardTitle>
            <CardDescription className="font-light leading-relaxed">カテゴリ別の回答人数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {stats.category_distribution.map((cat) => {
                const percentage = stats.total > 0 ? (cat.count / stats.total) * 100 : 0
                const isActive = filterCategory === cat.category
                return (
                  <div key={cat.category} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-sm">
                      <button
                        type="button"
                        onClick={() => setFilterCategory(isActive ? null : cat.category)}
                        className={`font-normal transition-colors hover:text-primary ${isActive ? "text-primary" : ""}`}
                      >
                        {cat.category}
                      </button>
                      <span className="font-sans text-sm font-light text-muted-foreground">
                        {cat.count}人 ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/50">
                      <div
                        className="h-full rounded-full bg-primary/80 transition-all duration-700 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Reminder Tool */}
        {responsesWithEmail.length > 0 && (
          <Card className="mb-10 border-border/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-light tracking-wide text-foreground">リマインド送信</CardTitle>
              <CardDescription className="font-light leading-relaxed">
                {filterCategory ? `「${filterCategory}」以上でメール登録済みの人` : "メール登録済みの全員"}に送信
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-8">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/50 bg-muted/20 p-6 shadow-sm">
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-light text-muted-foreground">対象者</span>
                  <span className="text-3xl font-light tracking-wide">{responsesWithEmail.length}人</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(responsesWithEmail.map((r) => r.email).join(", "), setCopiedEmails)}
                  className="gap-2 font-light shadow-sm"
                >
                  {copiedEmails ? (
                    <Check className="size-4" strokeWidth={1.5} />
                  ) : (
                    <Copy className="size-4" strokeWidth={1.5} />
                  )}
                  <span className="text-xs">メールアドレス</span>
                </Button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-normal">メール文面</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generateReminderMessage(), setCopiedMessage)}
                    className="gap-2 font-light shadow-sm"
                  >
                    {copiedMessage ? (
                      <Check className="size-4" strokeWidth={1.5} />
                    ) : (
                      <Copy className="size-4" strokeWidth={1.5} />
                    )}
                    <span className="text-xs">コピー</span>
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap rounded-2xl border border-border/60 bg-muted/20 p-6 font-sans text-xs font-light leading-relaxed">
                  {generateReminderMessage()}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Response List */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-xl font-light tracking-wide">回答一覧</CardTitle>
                <CardDescription className="font-light leading-relaxed">
                  {filterCategory ? `フィルタ: ${filterCategory}` : "全ての回答"} ({filteredResponses.length}件)
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {filterCategory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterCategory(null)}
                    className="gap-2 font-light"
                  >
                    フィルタ解除
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateCSV}
                  className="gap-2 font-light shadow-sm bg-transparent"
                >
                  <Download className="size-4" strokeWidth={1.5} />
                  CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {filteredResponses.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-16">
                  <div className="flex size-16 items-center justify-center rounded-full bg-muted/40">
                    <Users className="size-8 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <p className="text-center text-sm font-light text-muted-foreground">まだ回答がありません</p>
                </div>
              ) : (
                filteredResponses.map((response) => (
                  <div
                    key={response.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/50 bg-muted/15 p-6 transition-colors hover:border-primary/40 hover:bg-muted/25 shadow-sm"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <span className="text-base font-light text-foreground">{getScoreCategory(response.score)}</span>
                      <span className="truncate font-sans text-xs font-light text-muted-foreground">
                        {response.email || "メール未登録"} • 更新:{" "}
                        {new Date(response.updated_at).toLocaleString("ja-JP")}
                      </span>
                    </div>
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/8 font-sans text-lg font-light text-primary ring-1 ring-primary/20 shadow-sm">
                      {response.score}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
