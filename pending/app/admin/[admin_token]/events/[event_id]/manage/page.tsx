import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EventManageClient from './EventManageClient'
import { getScoreCategory } from '@/types'

interface PageProps {
  params: Promise<{ admin_token: string; event_id: string }>
}

export default async function EventManagePage({ params }: PageProps) {
  const { admin_token, event_id } = await params
  const supabase = await createClient()

  // イベントを取得（admin_tokenで検証）
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', event_id)
    .eq('admin_token', admin_token)
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

  // 参加可否の統計（ユニークなユーザーの最新の回答のみをカウント）
  const availabilityCounts = {
    can: 0,      // y_value = 100
    cannot: 0,  // y_value = 0
    later: 0,   // y_value = 50
  }

  if (responses && responses.length > 0) {
    // ユニークなユーザーの最新の回答のみを取得
    const userLatestResponses = new Map<string, { y_value: number | null }>()
    
    // updated_atでソート（最新のものが先頭）
    const sortedResponses = [...responses].sort((a, b) => {
      const aTime = new Date(a.updated_at || a.created_at).getTime()
      const bTime = new Date(b.updated_at || b.created_at).getTime()
      return bTime - aTime
    })

    for (const response of sortedResponses) {
      const userId = (response as any).user_id
      if (userId) {
        // ログインユーザー: user_idをキーとして、最新の回答のみを保持
        if (!userLatestResponses.has(userId)) {
          userLatestResponses.set(userId, { y_value: (response as any).y_value })
        }
      } else {
        // 匿名ユーザー: 各回答を個別にカウント
        const key = `anonymous_${response.id}`
        if (!userLatestResponses.has(key)) {
          userLatestResponses.set(key, { y_value: (response as any).y_value })
        }
      }
    }

    // y_valueで分類
    userLatestResponses.forEach((response) => {
      const yValue = response.y_value
      if (yValue === 100) {
        availabilityCounts.can++
      } else if (yValue === 0) {
        availabilityCounts.cannot++
      } else if (yValue === 50) {
        availabilityCounts.later++
      }
    })
  }

  const data = {
    event,
    stats: {
      total,
      average_score: averageScore,
      category_distribution: categoryDistribution,
      availability_counts: availabilityCounts,
    },
    responses: responses?.map((r) => ({
      id: r.id,
      score: r.score,
      category: getScoreCategory(r.score),
      email: r.email, // リマインド用メール（任意）
      user_email: (r as any).user_email || null, // Googleアカウントのメールアドレス（統計用）
      created_at: r.created_at,
      updated_at: r.updated_at,
    })) || [],
  }

  return <EventManageClient event={data.event} stats={data.stats} responses={data.responses} adminToken={admin_token} />
}
