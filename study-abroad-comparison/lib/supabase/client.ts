import { createBrowserClient } from '@supabase/ssr'

// 環境変数が設定されているかチェックする関数
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseAnonKey !== 'placeholder-key' &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseAnonKey.includes('placeholder')
  )
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // 環境変数が設定されていない場合はエラーを投げる
  if (!isSupabaseConfigured()) {
    const errorMessage = 'Supabase環境変数が設定されていません。.env.localファイルにNEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYを設定してください。'
    console.error(errorMessage)
    throw new Error(errorMessage)
  }
  
  // 型アサーションを使用して、環境変数が設定されていることを保証
  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = 'Supabase環境変数が不足しています。'
    console.error(errorMessage)
    throw new Error(errorMessage)
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

