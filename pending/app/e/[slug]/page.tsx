import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EventPageClient from './EventPageClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !event) {
    notFound()
  }

  // ユニークなユーザーの回答数を取得
  // user_idがNULLでない場合はユニークなuser_idの数をカウント
  // user_idがNULLの場合は各レコードを1つとしてカウント
  const { data: responses, error: countError } = await supabase
    .from('responses')
    .select('user_id')
    .eq('event_id', event.id)

  let uniqueCount = 0
  if (responses) {
    const userIds = new Set<string>()
    for (const response of responses) {
      if (response.user_id) {
        userIds.add(response.user_id)
      } else {
        // 匿名ユーザーは各レコードを1つとしてカウント
        uniqueCount++
      }
    }
    uniqueCount += userIds.size
  }

  // デバッグ: countの値を確認
  console.log('Server: unique response count for event', event.id, ':', uniqueCount)

  return <EventPageClient event={event} responseCount={uniqueCount} />
}
