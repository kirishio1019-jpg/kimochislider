"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Settings, Calendar, Users, ArrowLeft, Trash2, MapPin, DollarSign, User, Clock } from "lucide-react"
import type { Event } from "@/types"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

interface MyEventsClientProps {
  events: Event[]
  user: SupabaseUser
}

interface EventWithStats extends Event {
  responseCount: number
}

export default function MyEventsClient({ events, user }: MyEventsClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [eventsWithStats, setEventsWithStats] = useState<EventWithStats[]>([])
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      const eventsWithResponseCounts = await Promise.all(
        events.map(async (event) => {
          const { count } = await supabase
            .from('responses')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
          
          const responseCount: number = typeof count === 'number' ? count : 0
          
          return {
            ...event,
            responseCount,
          }
        })
      )
      setEventsWithStats(eventsWithResponseCounts)
    }
    
    if (events.length > 0) {
      fetchStats()
    }
  }, [events, supabase])

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`「${eventTitle}」を削除してもよろしいですか？\n\nこの操作は取り消せません。イベントとすべての回答が削除されます。`)) {
      return
    }

    setDeletingEventId(eventId)
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'イベントの削除に失敗しました')
      }

      // 削除成功後、ページをリロード
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      alert(error instanceof Error ? error.message : 'イベントの削除に失敗しました')
    } finally {
      setDeletingEventId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl py-8">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="gap-2 font-light"
          >
            <ArrowLeft className="size-4" />
            戻る
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-light text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-wide md:text-4xl">マイイベント</h1>
          <p className="mt-2 text-base font-light text-muted-foreground">
            作成したイベントを管理できます
          </p>
        </div>

        {/* イベント一覧 */}
        {events.length === 0 ? (
          <Card className="border-border/50 shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="mb-6 text-center text-muted-foreground font-light">
                まだイベントを作成していません
              </p>
              <Button
                onClick={() => router.push('/')}
                className="gap-2 font-light"
              >
                <Plus className="size-4" />
                最初のイベントを作成
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(eventsWithStats.length > 0 ? eventsWithStats : events).map((event) => {
              const startDate = new Date(event.start_at)
              const endDate = event.end_at ? new Date(event.end_at) : null
              const responseCount: number = 'responseCount' in event ? (event as EventWithStats).responseCount : 0
              
              return (
                <Card
                  key={event.id}
                  className="border-border/50 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/my-events/${event.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-light tracking-wide text-foreground line-clamp-2">
                      {event.title}
                    </CardTitle>
                    {event.description_short && (
                      <CardDescription className="line-clamp-2 font-light">
                        {event.description_short}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* 日時 */}
                    <div className="flex items-start gap-2 text-sm text-muted-foreground font-light">
                      <Calendar className="mt-0.5 size-4 shrink-0" />
                      <div className="flex flex-col gap-0.5">
                        <span>{startDate.toLocaleDateString("ja-JP")}</span>
                        <span className="text-xs">
                          {startDate.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                          {endDate && ` - ${endDate.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`}
                        </span>
                      </div>
                    </div>

                    {/* 場所と開催形式 */}
                    {event.location_text && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground font-light">
                        <MapPin className="mt-0.5 size-4 shrink-0" />
                        <div className="flex flex-col gap-0.5">
                          <span className="line-clamp-1">{event.location_text}</span>
                          <span className="text-xs">
                            {event.location_type === "online" ? "オンライン開催" : "対面開催"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 費用 */}
                    {event.fee_text && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-light">
                        <DollarSign className="size-4 shrink-0" />
                        <span className="line-clamp-1">{event.fee_text}</span>
                      </div>
                    )}

                    {/* 主催者 */}
                    {event.organizer_name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-light">
                        <User className="size-4 shrink-0" />
                        <span className="line-clamp-1">{event.organizer_name}</span>
                      </div>
                    )}

                    {/* 追加情報（短縮表示） */}
                    {event.additional_info && (
                      <div className="text-xs text-muted-foreground font-light line-clamp-2">
                        {event.additional_info}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-light">
                        <Users className="size-4" />
                        <span>回答: {responseCount}人</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/my-events/${event.id}`)
                          }}
                          className="gap-2 font-light"
                        >
                          <Settings className="size-4" />
                          管理
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteEvent(event.id, event.title)
                          }}
                          disabled={deletingEventId === event.id}
                          className="gap-2 font-light text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-4" />
                          {deletingEventId === event.id ? '削除中...' : '削除'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
