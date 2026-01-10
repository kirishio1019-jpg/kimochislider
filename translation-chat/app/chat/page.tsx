import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatList from '@/components/chat/ChatList'
import Link from 'next/link'
import { Plus, Settings } from 'lucide-react'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Translation Chat</h1>
        <div className="flex items-center space-x-2">
          <Link
            href="/settings"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <Link
            href="/chat/new"
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <ChatList />
      </div>
    </div>
  )
}

