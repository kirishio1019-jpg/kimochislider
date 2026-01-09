"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FeelingSlider } from "@/components/feeling-slider"
import { generateToken } from "@/lib/utils"
import type { Event } from "@/types"
import { Check } from "lucide-react"

interface EmbedSliderClientProps {
  event: Event
  responseCount: number
}

export default function EmbedSliderClient({ event, responseCount }: EmbedSliderClientProps) {
  const [score, setScore] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isCompact, setIsCompact] = useState(true)

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
      // LINE Webviewの高さを設定（必要に応じて）
      if (window.parent !== window) {
        // iframe内の場合、親ウィンドウに高さを通知
        window.parent.postMessage({ type: 'resize', height: document.body.scrollHeight }, '*')
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    setIsSubmitting(true)

    const token = generateToken()

    const response = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: event.id,
        score,
        edit_token: token,
      }),
    })

    if (response.ok) {
      setSubmitted(true)
      // メッセージアプリ内の場合、親ウィンドウにメッセージを送信
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'response_submitted', score, eventId: event.id }, '*')
      }
    }
    setIsSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Check className="size-8 text-primary" strokeWidth={2} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-light">気持ちを保存しました</h2>
            <p className="text-sm text-muted-foreground">
              応募内容はいつでも変更可能です。
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`w-full ${isCompact ? 'max-w-sm' : 'max-w-md'} space-y-6`}>
        {/* イベント情報（コンパクト） */}
        {isCompact ? (
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
        ) : (
          <div className="space-y-6 text-center">
            <h1 className="text-xl font-light leading-tight tracking-wide">{event.title}</h1>
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 shadow-sm">
                <span className="text-base font-bold text-primary">
                  {responseCount}
                </span>
                <span className="text-xs font-medium text-foreground">
                  人がスライドした
                </span>
              </div>
            </div>
          </div>
        )}

        {/* スライダー */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-border/50 bg-muted/25 backdrop-blur-sm p-6 shadow-md">
            <FeelingSlider value={score} onChange={setScore} disabled={isSubmitting} />
          </div>

          {/* 注意書き（コンパクトモードでは最小限） */}
          {!isCompact && (
            <div className="space-y-2 text-xs text-muted-foreground/70 text-center font-light">
              <p>応募内容はいつでも変更可能です。</p>
              <p>他の参加者には見えない完全匿名性</p>
            </div>
          )}

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
