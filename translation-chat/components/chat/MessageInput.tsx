'use client'

import { useState, useEffect } from 'react'
import { Send, X } from 'lucide-react'

interface MessageInputProps {
  conversationId: string
  onMessageSent?: () => void
  replyTo?: { id: string; text: string; senderName?: string } | null
  onCancelReply?: () => void
}

export default function MessageInput({ conversationId, onMessageSent, replyTo, onCancelReply }: MessageInputProps) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          text: text.trim(),
          messageType: 'text',
          replyToId: replyTo?.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setText('')
      onMessageSent?.()
      onCancelReply?.()
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('メッセージの送信に失敗しました')
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200">
      {replyTo && (
        <div className="px-4 pt-2 pb-1 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-blue-600 font-semibold">
              {replyTo.senderName || '返信先'}に返信
            </div>
            <div className="text-xs text-blue-800 truncate mt-0.5">
              {replyTo.text}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="ml-2 p-1 text-blue-600 hover:bg-blue-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="p-4 flex items-end space-x-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="メッセージを入力..."
          rows={1}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}

