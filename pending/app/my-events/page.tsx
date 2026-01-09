import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MyEventsClient from './MyEventsClient'

export default async function MyEventsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }

  // ユーザーのイベントを取得
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching events:', error)
  }

  return <MyEventsClient events={events || []} user={user} />
}
