'use client'

import { useEffect, useState, useRef } from 'react'
import { Message, User } from '@/types'
import MessageBubble from './MessageBubble'
import { createClient } from '@/lib/supabase/client'

interface MessageListProps {
  conversationId: string
  currentUserId: string
  displayLang: string
  onReply?: (message: Message) => void
}

export default function MessageList({ conversationId, currentUserId, displayLang, onReply }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadMessages()

    // リアルタイム更新を購読
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // 新しいメッセージを追加
          loadMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    // メッセージが更新されたらスクロール
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      const data = await response.json()
      if (data.messages) {
        // 時系列順にソート（古い順）
        const sortedMessages = [...data.messages].reverse()
        setMessages(sortedMessages)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await fetch('/api/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      })
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  useEffect(() => {
    // 未読メッセージを既読にする
    const unreadMessages = messages.filter(
      (m) => m.sender_id !== currentUserId && !m.is_read
    )
    unreadMessages.forEach((m) => markAsRead(m.id))
  }, [messages, currentUserId])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">メッセージを読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.sender_id === currentUserId}
          displayLang={displayLang}
          onReply={onReply}
          onDelete={(messageId) => {
            setMessages(messages.filter(m => m.id !== messageId))
          }}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

