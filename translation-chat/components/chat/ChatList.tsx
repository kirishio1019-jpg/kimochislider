'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Conversation } from '@/types'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface ConversationWithLastMessage extends Conversation {
  lastMessage?: {
    id: string
    original_text: string
    created_at: string
    sender_id: string
  }
  members?: Array<{
    user: {
      id: string
      name: string
      avatar_url?: string
    }
  }>
}

export default function ChatList() {
  const [conversations, setConversations] = useState<ConversationWithLastMessage[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadConversations()

    // リアルタイム更新を購読
    const channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          loadConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()
      if (data.conversations) {
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getConversationTitle = (conversation: ConversationWithLastMessage) => {
    if (conversation.type === 'group' && conversation.title) {
      return conversation.title
    }
    // 1対1チャットの場合、相手の名前を表示
    const otherMember = conversation.members?.[0]
    return otherMember?.user.name || 'Unknown'
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        読み込み中...
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        会話がありません。新しい会話を開始してください。
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/chat/${conversation.id}`}
          className="block p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {getConversationTitle(conversation)}
              </h3>
              {conversation.lastMessage && (
                <p className="mt-1 text-sm text-gray-500 truncate">
                  {conversation.lastMessage.original_text}
                </p>
              )}
            </div>
            {conversation.lastMessage && (
              <div className="ml-4 text-xs text-gray-400">
                {formatDistanceToNow(new Date(conversation.lastMessage.created_at), {
                  addSuffix: true,
                  locale: ja,
                })}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

