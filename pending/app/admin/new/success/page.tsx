"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get("eventId")
  const adminToken = searchParams.get("adminToken")
  const slug = searchParams.get("slug")

  const [copiedPublic, setCopiedPublic] = useState(false)
  const [copiedAdmin, setCopiedAdmin] = useState(false)

  const publicUrl = `${window.location.origin}/e/${slug}`
  const embedUrl = `${window.location.origin}/embed/${slug}`
  const adminUrl = `${window.location.origin}/admin/${adminToken}/events/${eventId}`

  const copyToClipboard = (text: string, setFunc: (val: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setFunc(true)
    setTimeout(() => setFunc(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">イベントを作成しました</CardTitle>
            <CardDescription>以下のURLをブックマークまたはコピーしてください</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">公開URL（参加者用）</span>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(publicUrl, setCopiedPublic)}>
                  {copiedPublic ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
              <code className="text-pretty break-all rounded bg-background p-2 text-xs">{publicUrl}</code>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">公開URL</span>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(embedUrl, setCopiedPublic)}>
                  {copiedPublic ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
              <code className="text-pretty break-all rounded bg-background p-2 text-xs">{embedUrl}</code>
              <p className="text-xs text-muted-foreground mt-2">
                メッセージアプリ内で開ける軽量版です。スライダーを直接操作できます。
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">管理URL（主催者用）</span>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(adminUrl, setCopiedAdmin)}>
                  {copiedAdmin ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
              <code className="text-pretty break-all rounded bg-background p-2 text-xs">{adminUrl}</code>
            </div>

            <div className="flex flex-col gap-2 rounded-lg border-l-4 border-l-yellow-500 bg-yellow-500/10 p-4">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                重要: 管理URLは必ず保存してください
              </p>
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                このURLを失うと、イベントの管理ができなくなります。ブックマークするか、安全な場所に保存してください。
              </p>
            </div>

            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <a href={publicUrl}>公開ページを見る</a>
              </Button>
              <Button asChild className="flex-1">
                <a href={adminUrl}>ダッシュボードへ</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function EventCreatedPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  )
}
