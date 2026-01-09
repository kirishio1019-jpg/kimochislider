import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PublicPageEditClient from './PublicPageEditClient'
import type { Event } from '@/types'

interface PageProps {
  params: Promise<{
    admin_token: string
    event_id: string
  }>
}

export default async function PublicPageEditPage({ params }: PageProps) {
  const { admin_token, event_id } = await params

  const supabase = await createClient()

  // admin_tokenでイベントを検証
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', event_id)
    .eq('admin_token', admin_token)
    .single()

  if (error || !event) {
    redirect('/')
  }

  return <PublicPageEditClient event={event as Event} adminToken={admin_token} />
}
