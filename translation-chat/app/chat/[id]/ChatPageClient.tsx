'use client'

import { useState } from 'react'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'
import Link from 'next/link'
import { ArrowLeft, Search, Settings } from 'lucide-react'
import { Message } from '@/types'

interface ChatPageClientProps {
  conversationId: string
  currentUserId: string
  displayLang: string
}

export default function ChatPageClient({
  conversationId,
  currentUserId,
  displayLang,
}: ChatPageClientProps) {
  const [replyTo, setReplyTo] = useState<{ id: string; text: string; senderName?: string } | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Message[]>([])

  const handleReply = (message: Message) => {
    setReplyTo({
      id: message.id,
      text: message.original_text.substring(0, 50),
      senderName: message.sender?.name,
    })
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`/api/messages/search?q=${encodeURIComponent(query)}&conversationId=${conversationId}`)
      const data = await response.json()
      if (data.messages) {
        setSearchResults(data.messages)
      }
    } catch (error) {
      console.error('Failed to search messages:', error)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/chat"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">チャット</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </header>

      {showSearch && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                handleSearch(e.target.value)
              }}
              placeholder="メッセージを検索..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => {
                setShowSearch(false)
                setSearchQuery('')
                setSearchResults([])
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              閉じる
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {searchResults.length}件の結果が見つかりました
            </div>
          )}
        </div>
      )}

      <MessageList
        conversationId={conversationId}
        currentUserId={currentUserId}
        displayLang={displayLang}
        onReply={handleReply}
      />

      <MessageInput
        conversationId={conversationId}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  )
}

