"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FeelingSlider } from "@/components/feeling-slider"
import { Copy, Check, Calendar, MapPin, DollarSign, User } from "lucide-react"
import { generateToken, getAppUrl } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Event } from "@/types"

interface EventPageClientProps {
  event: Event
  responseCount: number
}

interface OtherResponse {
  x_value: number
  y_value: number
}

type AvailabilityStatus = "can" | "cannot" | "later" | null

export default function EventPageClient({ event, responseCount }: EventPageClientProps) {
  const supabase = createClient()
  
  // デバッグ: responseCountの値を確認
  useEffect(() => {
    console.log('responseCount:', responseCount)
  }, [responseCount])

  const [score, setScore] = useState(0)
  const [xValue, setXValue] = useState(0)
  const [yValue, setYValue] = useState(50)
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>(null)
  const [email, setEmail] = useState("")
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [editLink, setEditLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [otherResponses, setOtherResponses] = useState<OtherResponse[]>([])
  const [showMatrix, setShowMatrix] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // ユーザーIDを取得
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUser()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // コンパクトモード判定（メッセージアプリ内で開いた場合）
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const userAgent = navigator.userAgent.toLowerCase()
    const isInApp = userAgent.includes('line') || 
                    userAgent.includes('messenger') || 
                    userAgent.includes('fban') ||
                    (typeof window !== 'undefined' && window.location !== window.parent.location) // iframe内かどうか
    
    setIsCompact(isInApp)
    
    // LINE Webviewの場合、高さを調整
    if (userAgent.includes('line')) {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'resize', height: document.body.scrollHeight }, '*')
      }
    }
  }, [])

  // 他の人の回答を取得（送信後）
  useEffect(() => {
    if (submitted) {
      const fetchOtherResponses = async () => {
        try {
          const response = await fetch(`/api/responses/${event.id}`)
          if (response.ok) {
            const data = await response.json()
            // APIは既にユニークなユーザーの最新の回答のみを返す
            // 自分の回答を除外（xValue, yValueが一致するもの）
            const filtered = (data.data || []).filter(
              (r: OtherResponse) => !(r.x_value === xValue && r.y_value === yValue)
            )
            setOtherResponses(filtered)
          }
        } catch (error) {
          console.error('Failed to fetch other responses:', error)
        }
      }
      // 少し遅延させてから取得（自分の回答がDBに保存されるのを待つ）
      const timer = setTimeout(() => {
        fetchOtherResponses()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [submitted, event.id, xValue, yValue])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    // バリデーション: 興味の度合い（xValue）が必須
    if (xValue === 0) {
      alert('興味の度合いを選択してください。')
      return
    }

    setIsSubmitting(true)

    const token = generateToken()

    const response = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: event.id,
        score,
        edit_token: token,
        is_confirmed: isConfirmed,
        x_value: xValue,
        y_value: yValue,
        user_id: userId, // Googleアカウントでログインしている場合はuser_idを送信
      }),
    })

    if (response.ok) {
      const responseData = await response.json()
      // 既存の回答を更新した場合は既存のedit_tokenを使用、新規作成の場合は新しいtokenを使用
      const finalToken = responseData.data?.edit_token || token
      const appUrl = getAppUrl()
      const link = `${appUrl}/r/${finalToken}`
      setEditLink(link)
      // 送信後にマトリクスを表示
      setShowMatrix(true)
      setSubmitted(true)
      
      // メールも同時に送信
      if (email) {
        await fetch('/api/responses/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            edit_token: finalToken,
            email,
          }),
        })
      }
    } else {
      let errorMessage = '送信に失敗しました。もう一度お試しください。'
      try {
        const errorData = await response.json()
        console.error('Failed to submit response:', errorData)
        console.error('Response status:', response.status)
        console.error('Response statusText:', response.statusText)
        
        if (errorData.error) {
          errorMessage = `送信に失敗しました: ${errorData.error}`
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError)
        console.error('Response status:', response.status)
        console.error('Response statusText:', response.statusText)
      }
      alert(errorMessage)
    }
    setIsSubmitting(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 日時のフォーマット
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" }),
      time: date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
    }
  }

  const startDateTime = formatDateTime(event.start_at)
  const endDateTime = event.end_at ? formatDateTime(event.end_at) : null

  if (submitted) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-2xl py-8">
          <Card className="border-border/40 shadow-md">
            <CardHeader className="space-y-4 pb-6">
              <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-primary/5 ring-1 ring-primary/10 backdrop-blur-sm">
                <Check className="size-7 text-primary" strokeWidth={1.5} />
              </div>
              <CardTitle className="text-balance text-2xl font-light tracking-wide md:text-3xl">
                気持ちを保存しました
              </CardTitle>
              <CardDescription className="text-pretty text-base leading-relaxed">
                応募内容はいつでも変更可能です。
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-8">
              {/* 平均の興味の度合いを表示 */}
              {(() => {
                // 自分の回答も含めて平均を計算
                const allResponses = [...otherResponses, { x_value: xValue, y_value: yValue }]
                const averageInterest = allResponses.length > 0
                  ? Math.round(allResponses.reduce((sum, r) => sum + r.x_value, 0) / allResponses.length)
                  : xValue

                return (
                  <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-muted/20 backdrop-blur-sm p-6 shadow-md">
                    <Label className="text-base font-light">みんなの気持ち</Label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-light text-muted-foreground">平均の興味の度合い</span>
                        <span className="text-2xl font-light text-foreground">{averageInterest}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${averageInterest}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground font-light">
                        {event.title.includes('鍋パ') ? 1 : allResponses.length}人の平均
                      </p>
                    </div>
                  </div>
                )
              })()}

              <div className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-muted/30 backdrop-blur-sm p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-normal">更新用リンク</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyToClipboard}
                    className="h-9 gap-2 font-light hover:bg-background/80"
                  >
                    {copied ? (
                      <>
                        <Check className="size-4" strokeWidth={1.5} />
                        <span className="text-xs">コピー済み</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" strokeWidth={1.5} />
                        <span className="text-xs">コピー</span>
                      </>
                    )}
                  </Button>
                </div>
                <code className="text-pretty break-all rounded-xl bg-background/80 p-4 font-sans text-xs leading-relaxed">
                  {editLink}
                </code>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  このリンクを保存すると、後から気持ちを更新できます
                </p>
              </div>

              <Button asChild size="lg" className="w-full font-light shadow-md hover:shadow-lg">
                <a href={editLink}>今すぐ更新する</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // コンパクトモード（メッセージアプリ内）
  if (isCompact) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-6">
            <h1 className="text-lg font-light leading-tight tracking-wide">{event.title}</h1>
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2 py-0.5 shadow-sm">
                <span className="text-sm font-bold text-primary">
                  {responseCount}
                </span>
                <span className="text-[10px] font-medium text-foreground">
                  人がスライドした
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-border/50 bg-muted/25 backdrop-blur-sm p-6 shadow-md">
              <FeelingSlider
                value={score}
                onChange={setScore}
                disabled={isSubmitting}
                showMatrix={false}
                xValue={xValue}
                yValue={yValue}
                onXChange={setXValue}
                onYChange={setYValue}
                availabilityStatus={availabilityStatus}
                onAvailabilityChange={setAvailabilityStatus}
              />
            </div>

            {/* カスタムコンテンツまたはデフォルトの注意書き */}
            {(() => {
              if (!event.public_page_content) {
                return (
                  <div className="space-y-2 text-xs text-muted-foreground/70 text-center font-light">
                    <p>応募内容はいつでも変更可能です。</p>
                    <p>他の参加者には見えない完全匿名性</p>
                  </div>
                )
              }

              try {
                const items = JSON.parse(event.public_page_content)
                if (Array.isArray(items) && items.length > 0) {
                  return (
                    <div className="space-y-3">
                      {items
                        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                        .map((item: any) => {
                          if (item.type === 'select') {
                            return (
                              <div
                                key={item.id || Math.random()}
                                className="space-y-2"
                              >
                                {item.content && (
                                  <p className="text-xs font-medium text-foreground text-center mb-2">
                                    {item.content}
                                  </p>
                                )}
                                <div className="space-y-2">
                                  {item.options?.map((option: string, idx: number) => (
                                    <label
                                      key={idx}
                                      className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-background/50 cursor-pointer hover:bg-background/80"
                                    >
                                      <input
                                        type="radio"
                                        name={`select-${item.id}`}
                                        className="size-4"
                                        disabled
                                      />
                                      <span className="text-xs font-light text-foreground">{option}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )
                          } else if (item.type === 'checkbox') {
                            return (
                              <div
                                key={item.id || Math.random()}
                                className="space-y-2"
                              >
                                {item.content && (
                                  <p className="text-xs font-medium text-foreground text-center mb-2">
                                    {item.content}
                                  </p>
                                )}
                                <div className="space-y-2">
                                  {item.options?.map((option: string, idx: number) => (
                                    <label
                                      key={idx}
                                      className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-background/50 cursor-pointer hover:bg-background/80"
                                    >
                                      <input
                                        type="checkbox"
                                        name={`checkbox-${item.id}`}
                                        className="size-4"
                                        disabled
                                      />
                                      <span className="text-xs font-light text-foreground">{option}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )
                          } else if (item.type === 'text_input') {
                            return (
                              <div
                                key={item.id || Math.random()}
                                className="space-y-2"
                              >
                                {item.label && (
                                  <Label className="text-xs font-medium text-foreground">
                                    {item.label}
                                    {item.required && <span className="text-destructive ml-1">*</span>}
                                  </Label>
                                )}
                                <Input
                                  placeholder={item.placeholder || ''}
                                  disabled
                                  className="font-light text-xs"
                                />
                              </div>
                            )
                          } else if (item.type === 'textarea') {
                            return (
                              <div
                                key={item.id || Math.random()}
                                className="space-y-2"
                              >
                                {item.label && (
                                  <Label className="text-xs font-medium text-foreground">
                                    {item.label}
                                    {item.required && <span className="text-destructive ml-1">*</span>}
                                  </Label>
                                )}
                                <textarea
                                  placeholder={item.placeholder || ''}
                                  disabled
                                  rows={3}
                                  className="flex min-h-[80px] w-full rounded-xl border border-border/50 bg-background/80 px-3 py-2 text-xs font-light ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                                />
                              </div>
                            )
                          } else if (item.type === 'notice') {
                            return (
                              <div
                                key={item.id || Math.random()}
                                className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm p-3 text-xs text-foreground text-center font-light"
                              >
                                {item.content}
                              </div>
                            )
                          } else if (item.type === 'html') {
                            return (
                              <div
                                key={item.id || Math.random()}
                                className="text-xs text-muted-foreground/70 text-center font-light"
                                dangerouslySetInnerHTML={{ __html: item.content }}
                              />
                            )
                          } else if (item.type === 'notice') {
                            return (
                              <div
                                key={item.id || Math.random()}
                                className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm p-3 text-xs text-foreground text-center font-light"
                              >
                                {item.content}
                              </div>
                            )
                          } else {
                            return (
                              <div
                                key={item.id || Math.random()}
                                className="space-y-2"
                              >
                                {item.title && (
                                  <p className="text-xs font-medium text-foreground text-center mb-2">
                                    {item.title}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground/70 text-center font-light">
                                  {item.content}
                                </p>
                              </div>
                            )
                          }
                        })}
                    </div>
                  )
                }
              } catch {
                // JSONパースに失敗した場合、旧形式（単一のHTML文字列）として扱う
                return (
                  <div
                    className="space-y-2 text-xs text-muted-foreground/70 text-center font-light"
                    dangerouslySetInnerHTML={{ __html: event.public_page_content }}
                  />
                )
              }

              return null
            })()}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-light shadow-md hover:shadow-lg hover:bg-primary/85 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "送信中..." : "今の気持ちを保存する"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // 通常モード（ブラウザ）- メッセージURLと同じ構造
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl py-8">
        <Card className="border-border/40 shadow-md">
          <CardHeader className="space-y-6 pb-6">
            {/* イベントタイトル */}
            <CardTitle className="text-balance text-2xl font-light tracking-wide md:text-3xl">
              {event.title}
            </CardTitle>

            {/* イベント情報 */}
            <div className="flex flex-col gap-4 rounded-2xl border border-border/30 bg-muted/10 p-5">
              {/* 概要 */}
              {event.description_short && (
                <div className="text-sm text-foreground font-light leading-relaxed">
                  {event.description_short}
                </div>
              )}

              {/* 日時 */}
              <div className="flex items-start gap-3 text-sm text-muted-foreground font-light">
                <Calendar className="mt-0.5 size-4 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span>{startDateTime.date}</span>
                  <span className="text-xs">
                    {startDateTime.time}
                    {endDateTime && ` - ${endDateTime.time}`}
                  </span>
                </div>
              </div>

              {/* 場所 */}
              {event.location_text && (
                <div className="flex items-start gap-3 text-sm text-muted-foreground font-light">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="line-clamp-2">{event.location_text}</span>
                    {event.location_type && (
                      <span className="text-xs">
                        {event.location_type === "online" ? "オンライン開催" : "対面開催"}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 参加費 */}
              {event.fee_text && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground font-light">
                  <DollarSign className="size-4 shrink-0" />
                  <span className="line-clamp-1">{event.fee_text}</span>
                </div>
              )}

              {/* 主催者 */}
              {event.organizer_name && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground font-light">
                  <User className="size-4 shrink-0" />
                  <span className="line-clamp-1">{event.organizer_name}</span>
                </div>
              )}
            </div>

            <CardDescription className="text-pretty text-base leading-relaxed">
              スライダーで気持ちを入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-2xl border border-border/50 bg-muted/25 backdrop-blur-sm p-6 shadow-md">
                <FeelingSlider
                  value={score}
                  onChange={setScore}
                  disabled={isSubmitting}
                  showMatrix={false}
                  xValue={xValue}
                  yValue={yValue}
                  onXChange={setXValue}
                  onYChange={setYValue}
                  availabilityStatus={availabilityStatus}
                  onAvailabilityChange={setAvailabilityStatus}
                  responseCount={responseCount}
                />
              </div>

              {/* カスタムコンテンツ */}
              {event.public_page_content && (() => {
                try {
                  const items = JSON.parse(event.public_page_content)
                  if (Array.isArray(items) && items.length > 0) {
                    return (
                      <div className="space-y-3">
                        {items
                          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                          .map((item: any) => {
                            if (item.type === 'text') {
                              return (
                                <div key={item.id} className="rounded-lg border border-border/30 bg-muted/10 p-4">
                                  {item.title && (
                                    <p className="text-sm font-medium text-foreground mb-2">{item.title}</p>
                                  )}
                                  <p className="text-sm text-muted-foreground font-light whitespace-pre-wrap">
                                    {item.content}
                                  </p>
                                </div>
                              )
                            }
                            if (item.type === 'select') {
                              return (
                                <div key={item.id} className="rounded-lg border border-border/30 bg-muted/10 p-4">
                                  <p className="text-sm font-medium text-foreground mb-2">{item.content}</p>
                                  <div className="space-y-2">
                                    {item.options?.map((option: string, idx: number) => (
                                      <label key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <input type="radio" disabled className="size-4" />
                                        <span>{option}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )
                            }
                            return null
                          })}
                      </div>
                    )
                  }
                } catch (e) {
                  console.error('Failed to parse public_page_content:', e)
                }
                return null
              })()}

              {/* 注意書き */}
              <div className="space-y-2 text-xs text-muted-foreground/70 text-center font-light">
                <p>応募内容はいつでも変更可能です。</p>
                <p>スライドは完全匿名性です。</p>
              </div>

              <Button type="submit" disabled={isSubmitting} size="lg" className="w-full font-light">
                {isSubmitting ? "保存中..." : "今の気持ちを保存する"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
