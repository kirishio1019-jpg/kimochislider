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

  // 回答数を取得
  const { count, error: countError } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)

  // デバッグ: countの値を確認
  console.log('Server: response count for event', event.id, ':', count)

  return <EventPageClient event={event} responseCount={count ?? 0} />
}
