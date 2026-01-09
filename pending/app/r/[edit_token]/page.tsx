import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import UpdatePageClient from './UpdatePageClient'

interface PageProps {
  params: Promise<{ edit_token: string }>
}

export default async function UpdatePage({ params }: PageProps) {
  const { edit_token } = await params
  const supabase = await createClient()

  const { data: response, error: responseError } = await supabase
    .from('responses')
    .select('*')
    .eq('edit_token', edit_token)
    .single()

  if (responseError || !response) {
    notFound()
  }

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', response.event_id)
    .single()

  if (eventError || !event) {
    notFound()
  }

  return (
    <UpdatePageClient
      editToken={edit_token}
      response={response}
      event={event}
    />
  )
}
