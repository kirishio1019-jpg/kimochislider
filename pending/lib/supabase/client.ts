import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  // クライアントサイドでのみログを出力
  if (typeof window !== 'undefined') {
    console.log('🔵 [Supabase Client] Initializing...')
    console.log('🔵 [Supabase Client] URL:', supabaseUrl)
    console.log('🔵 [Supabase Client] Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce', // PKCE flowを使用（より安全）
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}
