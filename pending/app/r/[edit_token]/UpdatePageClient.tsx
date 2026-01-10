"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FeelingSlider } from "@/components/feeling-slider"
import { Calendar, MapPin } from "lucide-react"
import type { Event, Response } from "@/types"

interface UpdatePageClientProps {
  editToken: string
  response: Response
  event: Event
}

export default function UpdatePageClient({
  editToken,
  response,
  event,
}: UpdatePageClientProps) {
  const [score, setScore] = useState(response.score)
  const [xValue, setXValue] = useState(response.x_value || 0)
  const [yValue, setYValue] = useState(response.y_value || 50)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updated, setUpdated] = useState(false)

  const startDate = new Date(event.start_at)
  const hasChanged = xValue !== (response.x_value || 0) || yValue !== (response.y_value || 50)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    const response = await fetch('/api/responses/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        edit_token: editToken,
        score,
        x_value: xValue,
        y_value: yValue,
      }),
    })

    setUpdated(true)
    setIsSubmitting(false)

    // Reset updated message after 3 seconds
    setTimeout(() => setUpdated(false), 3000)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-balance text-2xl font-light tracking-wide">{event.title}</CardTitle>
            <CardDescription className="text-pretty font-light">気持ちを更新できます</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-8">
            {/* Event info */}
            <div className="flex flex-col gap-3 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-start gap-3 text-sm">
                <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="font-medium">{startDate.toLocaleDateString("ja-JP")}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="font-medium">{event.location_text}</span>
              </div>
            </div>


            {/* Important notices */}
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border-l-4 border-l-green-500 bg-green-500/10 p-3">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">応募内容はいつでも変更可能です。</p>
                <p className="text-xs text-green-800 dark:text-green-200">
                  今の気持ちを気軽に教えてください。何度でも更新できます。
                </p>
              </div>
            </div>

            {/* Update form */}
            <form onSubmit={handleUpdate} className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Label className="text-base font-semibold">今の参加したい気持ちは？</Label>
                <FeelingSlider 
                  value={score} 
                  onChange={setScore} 
                  disabled={isSubmitting}
                  xValue={xValue}
                  yValue={yValue}
                  onXChange={setXValue}
                  onYChange={setYValue}
                  showMatrix={false}
                />
              </div>

              <Button type="submit" disabled={isSubmitting || !hasChanged} size="lg" className="w-full">
                {isSubmitting ? "更新中..." : updated ? "更新しました！" : "気持ちを更新する"}
              </Button>

              {updated && (
                <div className="rounded-lg border-l-4 border-l-green-500 bg-green-500/10 p-3 text-center">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">更新しました</p>
                </div>
              )}
            </form>

            <div className="text-center text-xs text-muted-foreground">
              最終更新: {new Date(response.updated_at).toLocaleString("ja-JP")}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
