import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/chat')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Translation Chat
        </h1>
        <p className="text-center text-gray-600 mb-8">
          異なる母語同士でも翻訳を意識せず会話できる
        </p>
        
        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            ログイン
          </Link>
          <Link
            href="/auth/signup"
            className="block w-full bg-gray-200 text-gray-800 text-center py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            新規登録
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">主な機能</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">🌐</span>
              <span>リアルタイム自動翻訳</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">💬</span>
              <span>1対1・グループチャット</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🔄</span>
              <span>原文・翻訳文の切替表示</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🔒</span>
              <span>安全なコミュニケーション</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

