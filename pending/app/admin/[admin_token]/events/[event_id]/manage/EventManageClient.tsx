"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, Mail, Copy, Check, Download, ArrowLeft, Calendar, MapPin, DollarSign, User, Edit2, Save, X } from "lucide-react"
import type { Event } from "@/types"
import { SCORE_CATEGORIES, getScoreCategory } from "@/types"

interface EventManageClientProps {
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
  adminToken: string
}

export default function EventManageClient({
  event: initialEvent,
  stats,
  responses,
  adminToken,
}: EventManageClientProps) {
  const router = useRouter()
  const [event, setEvent] = useState(initialEvent)
  const [isEditing, setIsEditing] = useState(false)
  const [editedEvent, setEditedEvent] = useState({
    title: initialEvent.title,
    description_short: initialEvent.description_short || '',
    start_at: initialEvent.start_at ? new Date(initialEvent.start_at).toISOString().slice(0, 16) : '',
    end_at: initialEvent.end_at ? new Date(initialEvent.end_at).toISOString().slice(0, 16) : '',
    location_text: initialEvent.location_text || '',
    location_type: initialEvent.location_type,
    fee_text: initialEvent.fee_text || '',
    organizer_name: initialEvent.organizer_name || '',
    additional_info: initialEvent.additional_info || '',
    public_page_content: initialEvent.public_page_content || '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedMessageLink, setCopiedMessageLink] = useState(false)
  const [origin, setOrigin] = useState<string>('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_token: adminToken,
          ...editedEvent,
          start_at: editedEvent.start_at ? new Date(editedEvent.start_at).toISOString() : null,
          end_at: editedEvent.end_at ? new Date(editedEvent.end_at).toISOString() : null,
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setEvent(updated.data)
        setIsEditing(false)
        // クライアント側のリフレッシュ
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      } else {
        const error = await response.json()
        alert('エラー: ' + (error.error || '保存に失敗しました'))
      }
    } catch (error) {
      alert('エラーが発生しました')
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = (text: string, setFunc: (val: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setFunc(true)
    setTimeout(() => setFunc(false), 2000)
  }

  const filteredResponses = filterCategory
    ? responses.filter((r) => getScoreCategory(r.score) === filterCategory)
    : responses


  const startDate = new Date(event.start_at)
  const endDate = event.end_at ? new Date(event.end_at) : null
  const publicUrl = origin ? `${origin}/e/${event.slug}` : ''
  const messageUrl = origin ? `${origin}/m/${event.slug}` : ''
  const embedUrl = origin ? `${origin}/embed/${event.slug}` : ''

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl py-8">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/my-events')}
            className="gap-2 font-light"
          >
            <ArrowLeft className="size-4" />
            戻る
          </Button>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setEditedEvent({
                      title: event.title,
                      description_short: event.description_short || '',
                      start_at: event.start_at ? new Date(event.start_at).toISOString().slice(0, 16) : '',
                      end_at: event.end_at ? new Date(event.end_at).toISOString().slice(0, 16) : '',
                      location_text: event.location_text || '',
                      location_type: event.location_type,
                      fee_text: event.fee_text || '',
                      organizer_name: event.organizer_name || '',
                      additional_info: event.additional_info || '',
                      public_page_content: event.public_page_content || '',
                    })
                  }}
                  className="gap-2 font-light"
                >
                  <X className="size-4" />
                  キャンセル
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="gap-2 font-light"
                >
                  <Save className="size-4" />
                  {isSaving ? '保存中...' : '保存'}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="gap-2 font-light"
              >
                <Edit2 className="size-4" />
                編集
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-8">
            {/* イベント情報 */}
            <Card className="border-border/50 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-light tracking-wide text-foreground">イベント情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="title">イベントタイトル</Label>
                      <Input
                        id="title"
                        value={editedEvent.title}
                        onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })}
                        className="font-light"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="description">概要</Label>
                      <textarea
                        id="description"
                        value={editedEvent.description_short}
                        onChange={(e) => setEditedEvent({ ...editedEvent, description_short: e.target.value })}
                        rows={6}
                        className="flex min-h-[80px] w-full rounded-xl border border-border/50 bg-background/80 px-3 py-2 text-sm font-light ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="start_at">開始日時</Label>
                        <Input
                          id="start_at"
                          type="datetime-local"
                          value={editedEvent.start_at}
                          onChange={(e) => setEditedEvent({ ...editedEvent, start_at: e.target.value })}
                          className="font-light"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label htmlFor="end_at">終了日時</Label>
                        <Input
                          id="end_at"
                          type="datetime-local"
                          value={editedEvent.end_at}
                          onChange={(e) => setEditedEvent({ ...editedEvent, end_at: e.target.value })}
                          className="font-light"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="location_text">場所</Label>
                      <Input
                        id="location_text"
                        value={editedEvent.location_text}
                        onChange={(e) => setEditedEvent({ ...editedEvent, location_text: e.target.value })}
                        placeholder="例: 渋谷区文化センター 3F会議室"
                        className="font-light"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="location_type">開催形式</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="location_type"
                            value="offline"
                            checked={editedEvent.location_type === "offline"}
                            onChange={(e) => setEditedEvent({ ...editedEvent, location_type: e.target.value as "offline" | "online" })}
                            className="size-4"
                          />
                          <span className="text-sm font-light">対面</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="location_type"
                            value="online"
                            checked={editedEvent.location_type === "online"}
                            onChange={(e) => setEditedEvent({ ...editedEvent, location_type: e.target.value as "online" | "offline" })}
                            className="size-4"
                          />
                          <span className="text-sm font-light">オンライン</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="fee_text">参加費</Label>
                      <Input
                        id="fee_text"
                        value={editedEvent.fee_text}
                        onChange={(e) => setEditedEvent({ ...editedEvent, fee_text: e.target.value })}
                        placeholder="例: 無料、2000円、ドリンク代別"
                        className="font-light"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="organizer_name">主催団体/主催者</Label>
                      <Input
                        id="organizer_name"
                        value={editedEvent.organizer_name}
                        onChange={(e) => setEditedEvent({ ...editedEvent, organizer_name: e.target.value })}
                        placeholder="例: 田中太郎、または○○サークル"
                        className="font-light"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="additional_info">その他の情報</Label>
                      <textarea
                        id="additional_info"
                        value={editedEvent.additional_info}
                        onChange={(e) => setEditedEvent({ ...editedEvent, additional_info: e.target.value })}
                        placeholder="持ち物、注意事項、その他の情報を自由に記入してください"
                        rows={4}
                        className="flex min-h-[80px] w-full rounded-xl border border-border/50 bg-background/80 px-3 py-2 text-sm font-light ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-lg font-light text-foreground">{event.title}</h3>
                      {event.description_short && (
                        <p className="text-sm font-light leading-relaxed text-muted-foreground whitespace-pre-wrap">
                          {event.description_short}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-start gap-3 text-sm">
                        <Calendar className="mt-1 size-5 shrink-0 text-primary" strokeWidth={1.5} />
                        <div className="flex flex-col gap-1.5 font-light">
                          <span className="font-normal text-foreground">{startDate.toLocaleDateString("ja-JP")}</span>
                          <span className="text-muted-foreground">
                            {startDate.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                            {endDate && ` - ${endDate.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`}
                          </span>
                        </div>
                      </div>

                      {event.location_text && (
                        <div className="flex items-start gap-3 text-sm">
                          <MapPin className="mt-1 size-5 shrink-0 text-primary" strokeWidth={1.5} />
                          <div className="flex flex-col gap-1.5 font-light">
                            <span className="font-normal text-foreground">{event.location_text}</span>
                            <span className="text-muted-foreground">
                              {event.location_type === "online" ? "オンライン開催" : "対面開催"}
                            </span>
                          </div>
                        </div>
                      )}

                      {event.fee_text && (
                        <div className="flex items-start gap-3 text-sm">
                          <DollarSign className="mt-1 size-5 shrink-0 text-primary" strokeWidth={1.5} />
                          <span className="font-normal text-foreground">{event.fee_text}</span>
                        </div>
                      )}

                      {event.organizer_name && (
                        <div className="flex items-start gap-3 text-sm">
                          <User className="mt-1 size-5 shrink-0 text-primary" strokeWidth={1.5} />
                          <span className="font-normal text-foreground">{event.organizer_name}</span>
                        </div>
                      )}
                    </div>

                    {event.additional_info && (
                      <div className="rounded-2xl border border-border/50 bg-muted/20 p-5">
                        <h4 className="mb-2 text-sm font-light text-muted-foreground">その他の情報</h4>
                        <p className="text-sm font-light leading-relaxed whitespace-pre-wrap text-foreground">
                          {event.additional_info}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* URL管理 */}
            <Card className="border-border/50 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-light tracking-wide text-foreground">URL管理</CardTitle>
                <CardDescription className="font-light">イベントへのアクセス用URL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-muted/20 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-foreground">公開URL</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(publicUrl, setCopiedLink)}
                      className="h-9 gap-2 font-light"
                      disabled={!publicUrl}
                    >
                      {copiedLink ? (
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
                  <code className="truncate font-sans text-xs text-muted-foreground">{publicUrl || '読み込み中...'}</code>
                  <p className="text-xs text-muted-foreground mt-1 font-light">
                    メッセージアプリ内で開くと自動的にコンパクト表示になります。
                  </p>
                </div>

                <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-muted/20 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-foreground">メッセージ用URL</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(messageUrl, setCopiedMessageLink)}
                      className="h-9 gap-2 font-light"
                      disabled={!messageUrl}
                    >
                      {copiedMessageLink ? (
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
                  <code className="truncate font-sans text-xs text-muted-foreground">{messageUrl || '読み込み中...'}</code>
                  <p className="text-xs text-muted-foreground mt-1 font-light">
                    LINEやSlackなどのメッセージアプリで共有すると、プレビューカードが表示されます。
                  </p>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 統計カード */}
            <Card className="border-border/50 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-light tracking-wide text-foreground">統計</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-muted-foreground">回答人数</span>
                    <span className="text-2xl font-light text-foreground">{stats.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-muted-foreground">平均スコア</span>
                    <span className="text-xl font-light text-foreground">{stats.average_score.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* クイックアクション */}
            <Card className="border-border/50 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-light tracking-wide text-foreground">クイックアクション</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start gap-2 font-light"
                >
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    公開ページを開く
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start gap-2 font-light"
                >
                  <a href={embedUrl} target="_blank" rel="noopener noreferrer">
                    埋め込み用URLを開く
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start gap-2 font-light"
                >
                  <a href={`/admin/${adminToken}/events/${event.id}/public-page/edit`}>
                    <Edit2 className="size-4" />
                    公開ページを編集する
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
