import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EventManageClient from '@/app/admin/[admin_token]/events/[event_id]/manage/EventManageClient'
import { getScoreCategory } from '@/types'

interface PageProps {
  params: Promise<{ event_id: string }>
}

export default async function MyEventManagePage({ params }: PageProps) {
  const { event_id } = await params
  const supabase = await createClient()

  // ユーザー認証を確認
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }

  // イベントを取得（user_idで検証）
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', event_id)
    .eq('user_id', user.id)
    .single()

  if (eventError || !event) {
    notFound()
  }

  // 回答を取得
  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select('*')
    .eq('event_id', event_id)
    .order('created_at', { ascending: false })

  if (responsesError) {
    notFound()
  }

  // 統計を計算
  const total = responses?.length || 0
  const averageScore = total > 0
    ? Math.round(responses.reduce((sum, r) => sum + r.score, 0) / total)
    : 0

  // カテゴリ別の分布
  const { SCORE_CATEGORIES } = await import('@/types')
  const categoryCounts: Record<string, number> = {}
  
  SCORE_CATEGORIES.forEach((cat) => {
    categoryCounts[cat.label] = 0
  })

  responses?.forEach((r) => {
    const category = getScoreCategory(r.score)
    categoryCounts[category] = (categoryCounts[category] || 0) + 1
  })

  const categoryDistribution = SCORE_CATEGORIES.map((cat) => ({
    category: cat.label,
    count: categoryCounts[cat.label] || 0,
  }))

  const data = {
    event,
    stats: {
      total,
      average_score: averageScore,
      category_distribution: categoryDistribution,
    },
    responses: responses?.map((r) => ({
      id: r.id,
      score: r.score,
      category: getScoreCategory(r.score),
      email: r.email,
      created_at: r.created_at,
      updated_at: r.updated_at,
    })) || [],
  }

  return (
    <EventManageClient 
      event={data.event} 
      stats={data.stats} 
      responses={data.responses} 
      adminToken={event.admin_token}
    />
  )
}
