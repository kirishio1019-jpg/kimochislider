import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ChatPageClient from './ChatPageClient'

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // ユーザープロフィールを取得
  const { data: userProfile } = await supabase
    .from('users')
    .select('display_lang')
    .eq('id', user.id)
    .single()

  const displayLang = userProfile?.display_lang || 'ja'

  return (
    <ChatPageClient
      conversationId={id}
      currentUserId={user.id}
      displayLang={displayLang}
    />
  )
}

