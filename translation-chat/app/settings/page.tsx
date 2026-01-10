'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { SUPPORTED_LANGUAGES } from '@/lib/translation'
import { User } from '@/types'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [name, setName] = useState('')
  const [nativeLang, setNativeLang] = useState('ja')
  const [displayLang, setDisplayLang] = useState('ja')
  const [autoDetectLang, setAutoDetectLang] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/auth/signin')
        return
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) throw profileError

      if (userProfile) {
        setUser(userProfile)
        setName(userProfile.name)
        setNativeLang(userProfile.native_lang)
        setDisplayLang(userProfile.display_lang)
        setAutoDetectLang(userProfile.auto_detect_lang ?? true)
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
      setError('プロフィールの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/auth/signin')
        return
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          name,
          native_lang: nativeLang,
          display_lang: displayLang,
          auto_detect_lang: autoDetectLang,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setError('設定の保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
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
        <h1 className="text-lg font-semibold text-gray-900">設定</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            設定を保存しました
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              表示名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="nativeLang" className="block text-sm font-medium text-gray-700 mb-2">
              母語（入力言語の優先）
            </label>
            <select
              id="nativeLang"
              value={nativeLang}
              onChange={(e) => setNativeLang(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              主に使用する言語を設定します。自動言語判定の参考として使用されます。
            </p>
          </div>

          <div>
            <label htmlFor="displayLang" className="block text-sm font-medium text-gray-700 mb-2">
              表示言語（受信メッセージの翻訳先）
            </label>
            <select
              id="displayLang"
              value={displayLang}
              onChange={(e) => setDisplayLang(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              受信したメッセージをこの言語に自動翻訳して表示します。
            </p>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoDetectLang}
                onChange={(e) => setAutoDetectLang(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                自動言語判定を有効にする
              </span>
            </label>
            <p className="mt-1 ml-6 text-xs text-gray-500">
              送信メッセージの言語を自動的に判定します。無効にすると、手動で言語を指定する必要があります。
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? '保存中...' : '保存'}</span>
            </button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">アカウント</h2>
          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  )
}

