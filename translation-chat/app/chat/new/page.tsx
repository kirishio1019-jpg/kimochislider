'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/types'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewChatPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [conversationType, setConversationType] = useState<'one_to_one' | 'group'>('one_to_one')
  const [groupTitle, setGroupTitle] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('id, name, avatar_url, native_lang')
        .neq('id', user.id)
        .order('name')

      if (error) throw error
      if (data) setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const handleCreateConversation = async () => {
    if (conversationType === 'one_to_one' && !selectedUserId) {
      alert('ユーザーを選択してください')
      return
    }

    if (conversationType === 'group' && (!groupTitle || selectedMemberIds.length === 0)) {
      alert('グループ名とメンバーを選択してください')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: conversationType,
          title: conversationType === 'group' ? groupTitle : undefined,
          memberIds: conversationType === 'one_to_one' 
            ? [selectedUserId] 
            : selectedMemberIds,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create conversation')
      }

      const data = await response.json()
      router.push(`/chat/${data.conversation.id}`)
    } catch (error) {
      console.error('Failed to create conversation:', error)
      alert('会話の作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const toggleMember = (userId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
        <Link
          href="/chat"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">新しい会話</h1>
      </header>

      <div className="p-4 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            会話タイプ
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="one_to_one"
                checked={conversationType === 'one_to_one'}
                onChange={(e) => setConversationType(e.target.value as 'one_to_one')}
                className="mr-2"
              />
              1対1チャット
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="group"
                checked={conversationType === 'group'}
                onChange={(e) => setConversationType(e.target.value as 'group')}
                className="mr-2"
              />
              グループチャット
            </label>
          </div>
        </div>

        {conversationType === 'group' && (
          <div>
            <label htmlFor="groupTitle" className="block text-sm font-medium text-gray-700 mb-1">
              グループ名
            </label>
            <input
              id="groupTitle"
              type="text"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              placeholder="グループ名を入力"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {conversationType === 'one_to_one' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ユーザーを選択
            </label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full p-3 text-left border rounded-lg transition-colors ${
                    selectedUserId === user.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">
                    母語: {user.native_lang}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メンバーを選択（複数選択可）
            </label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => toggleMember(user.id)}
                  className={`w-full p-3 text-left border rounded-lg transition-colors ${
                    selectedMemberIds.includes(user.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">
                        母語: {user.native_lang}
                      </div>
                    </div>
                    {selectedMemberIds.includes(user.id) && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleCreateConversation}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '作成中...' : '会話を開始'}
        </button>
      </div>
    </div>
  )
}

