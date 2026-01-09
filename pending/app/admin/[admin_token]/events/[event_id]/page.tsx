import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DashboardClient from './DashboardClient'
import { getScoreCategory } from '@/types'

interface PageProps {
  params: Promise<{ admin_token: string; event_id: string }>
}

export default async function DashboardPage({ params }: PageProps) {
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <DashboardClient
          event={data.event}
          stats={data.stats}
          responses={data.responses}
        />
      </div>
    </div>
  )
}
