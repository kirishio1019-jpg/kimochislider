'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ban, Flag } from 'lucide-react'

interface UserActionsProps {
  userId: string
  userName: string
  onClose?: () => void
}

export default function UserActions({ userId, userName, onClose }: UserActionsProps) {
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBlock = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedId: userId }),
      })

      if (!response.ok) {
        throw new Error('Failed to block user')
      }

      alert(`${userName}をブロックしました`)
      setShowBlockConfirm(false)
      onClose?.()
      router.refresh()
    } catch (error) {
      console.error('Failed to block user:', error)
      alert('ブロックに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert('理由を入力してください')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedUserId: userId,
          reason: reportReason.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to report user')
      }

      alert('通報を受け付けました。ご報告ありがとうございます。')
      setShowReportForm(false)
      setReportReason('')
      onClose?.()
    } catch (error) {
      console.error('Failed to report user:', error)
      alert('通報に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {!showBlockConfirm && !showReportForm && (
        <>
          <button
            onClick={() => setShowBlockConfirm(true)}
            className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Ban className="w-4 h-4" />
            <span>ブロック</span>
          </button>
          <button
            onClick={() => setShowReportForm(true)}
            className="w-full flex items-center space-x-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <Flag className="w-4 h-4" />
            <span>通報</span>
          </button>
        </>
      )}

      {showBlockConfirm && (
        <div className="space-y-2">
          <p className="text-sm text-gray-700 mb-2">
            {userName}をブロックしますか？ブロックすると、このユーザーからのメッセージを受信できなくなります。
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleBlock}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? '処理中...' : 'ブロック'}
            </button>
            <button
              onClick={() => setShowBlockConfirm(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {showReportForm && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            通報理由
          </label>
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="通報理由を入力してください"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleReport}
              disabled={loading || !reportReason.trim()}
              className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {loading ? '送信中...' : '通報'}
            </button>
            <button
              onClick={() => {
                setShowReportForm(false)
                setReportReason('')
              }}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

