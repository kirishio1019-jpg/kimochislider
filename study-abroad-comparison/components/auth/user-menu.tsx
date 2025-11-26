"use client"

import { useState, useEffect } from "react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import LoginButton from "./login-button"

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    // 環境変数が設定されているかチェック
    const configured = isSupabaseConfigured()
    setIsConfigured(configured)
    
    if (!configured) {
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // 現在のユーザーを取得
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
        setIsLoading(false)
      }).catch((error) => {
        console.error('Failed to get user:', error)
        setIsLoading(false)
      })

      // 認証状態の変化を監視
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error)
      setIsLoading(false)
    }
  }, [])

  const handleLogout = async () => {
    if (!isConfigured) {
      alert('Supabase環境変数が設定されていません。')
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
        alert('ログアウトに失敗しました')
      } else {
        // ログアウト後はホームページにリダイレクト
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Failed to create Supabase client:', error)
      alert('ログアウトに失敗しました')
    }
  }

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
    )
  }

  if (!user) {
    return <LoginButton />
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt={user.email || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
            {user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        <span className="text-sm text-muted-foreground hidden md:inline">
          {user.email?.split('@')[0] || 'ユーザー'}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ログアウト
      </button>
    </div>
  )
}

