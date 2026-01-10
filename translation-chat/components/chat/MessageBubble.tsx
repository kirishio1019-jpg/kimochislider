'use client'

import { useState, useEffect } from 'react'
import { Message } from '@/types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Reply, Trash2 } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  displayLang: string
  onReply?: (message: Message) => void
  onDelete?: (messageId: string) => void
}

export default function MessageBubble({ message, isOwn, displayLang, onReply, onDelete }: MessageBubbleProps) {
  const [showOriginal, setShowOriginal] = useState(false)
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [loadingTranslation, setLoadingTranslation] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const messageLang = message.user_specified_lang || message.detected_lang || 'en'
  const needsTranslation = messageLang.toLowerCase() !== displayLang.toLowerCase()
  
  // 送信から5分以内かチェック（削除可能かどうか）
  const messageTime = new Date(message.created_at)
  const now = new Date()
  const diffMinutes = (now.getTime() - messageTime.getTime()) / (1000 * 60)
  const canDelete = isOwn && diffMinutes <= 5

  useEffect(() => {
    // 翻訳が必要な場合、翻訳を取得
    if (needsTranslation && !showOriginal && !translatedText && message.translations) {
      const translation = message.translations[displayLang]
      if (translation) {
        setTranslatedText(translation)
      } else {
        // 翻訳がまだない場合、APIから取得
        loadTranslation()
      }
    }
  }, [message, displayLang, needsTranslation, showOriginal])

  const loadTranslation = async () => {
    if (loadingTranslation) return

    setLoadingTranslation(true)
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: message.id,
          targetLang: displayLang,
          sourceLang: messageLang,
        }),
      })

      const data = await response.json()
      if (data.translatedText) {
        setTranslatedText(data.translatedText)
      }
    } catch (error) {
      console.error('Failed to load translation:', error)
    } finally {
      setLoadingTranslation(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('このメッセージを削除しますか？')) return
    
    setDeleting(true)
    try {
      const response = await fetch('/api/messages/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: message.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '削除に失敗しました')
      }

      onDelete?.(message.id)
    } catch (error) {
      console.error('Failed to delete message:', error)
      alert(error instanceof Error ? error.message : 'メッセージの削除に失敗しました')
    } finally {
      setDeleting(false)
    }
  }

  const displayText = showOriginal
    ? message.original_text
    : (translatedText || message.original_text)

  return (
    <div 
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
          isOwn
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-900'
        }`}
      >
        {/* 返信先メッセージの表示 */}
        {message.reply_to_id && (
          <div className={`mb-2 pb-2 border-b ${
            isOwn ? 'border-blue-400' : 'border-gray-300'
          }`}>
            <div className="text-xs opacity-75 flex items-center space-x-1">
              <Reply className="w-3 h-3" />
              <span>返信</span>
            </div>
          </div>
        )}

        {message.sender && !isOwn && (
          <div className="text-xs font-semibold mb-1 opacity-75">
            {message.sender.name}
          </div>
        )}

        <div className="text-sm whitespace-pre-wrap break-words">
          {loadingTranslation ? (
            <span className="opacity-50">翻訳中...</span>
          ) : (
            displayText
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            {needsTranslation && (
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className={`text-xs underline opacity-75 hover:opacity-100 ${
                  isOwn ? 'text-blue-100' : 'text-gray-600'
                }`}
              >
                {showOriginal ? '翻訳を見る' : '原文を見る'}
              </button>
            )}
          </div>

          <div className={`text-xs opacity-60 ${
            isOwn ? 'text-blue-100' : 'text-gray-600'
          }`}>
            {format(new Date(message.created_at), 'HH:mm', { locale: ja })}
            {messageLang && (
              <span className="ml-2">({messageLang.toUpperCase()})</span>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        {showActions && (
          <div className={`absolute top-2 ${
            isOwn ? 'left-2' : 'right-2'
          } flex space-x-1`}>
            {onReply && (
              <button
                onClick={() => onReply(message)}
                className={`p-1 rounded ${
                  isOwn 
                    ? 'bg-blue-700 hover:bg-blue-800 text-white' 
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
                } transition-colors`}
                title="返信"
              >
                <Reply className="w-3 h-3" />
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`p-1 rounded ${
                  isOwn 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-red-200 hover:bg-red-300 text-red-900'
                } transition-colors disabled:opacity-50`}
                title="削除"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

