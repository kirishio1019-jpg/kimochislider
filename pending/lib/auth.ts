import { createClient } from '@/lib/supabase/client'
import { getAppUrl } from '@/lib/utils'

export async function handleGoogleLogin(redirectPath?: string) {
  console.log('🔵 ========================================')
  console.log('🔵 Google Login Button Clicked!')
  console.log('🔵 ========================================')
  
  try {
    const appUrl = getAppUrl()
    const supabase = createClient()
    
    // リダイレクト先を決定
    const finalRedirectPath = redirectPath || window.location.pathname
    const redirectUrl = `${appUrl}/auth/callback?redirect=${encodeURIComponent(finalRedirectPath)}`
    
    // Supabase設定の確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('🔵 === Google Login Debug ===')
    console.log('🔵 App URL:', appUrl)
    console.log('🔵 Redirect URL:', redirectUrl)
    console.log('🔵 Redirect Path:', finalRedirectPath)
    
    // Supabase設定の検証
    if (!supabaseUrl || !supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
      const errorMsg = `Supabase URLが正しく設定されていません。\n\n現在の値: ${supabaseUrl || 'NOT SET'}\n\nVercel Dashboardで環境変数 NEXT_PUBLIC_SUPABASE_URL を確認してください。`
      console.error(errorMsg)
      alert(errorMsg)
      return
    }
    
    if (!supabaseAnonKey || supabaseAnonKey.length < 50) {
      const errorMsg = `Supabase Anon Keyが正しく設定されていません。\n\nVercel Dashboardで環境変数 NEXT_PUBLIC_SUPABASE_ANON_KEY を確認してください。`
      console.error(errorMsg)
      alert(errorMsg)
      return
    }
    
    // リダイレクトURLの検証
    if (!redirectUrl.startsWith('https://') && !redirectUrl.startsWith('http://localhost')) {
      const errorMsg = `無効なリダイレクトURLです: ${redirectUrl}\n\n本番環境ではhttps://で始まるURLが必要です。`
      console.error(errorMsg)
      alert(errorMsg)
      return
    }
    
    console.log('🔵 === Attempting OAuth Sign In ===')
    console.log('🔵 Provider: google')
    console.log('🔵 Redirect To:', redirectUrl)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    
    if (error) {
      console.error('🔴 OAuth Error:', error)
      alert(`ログインに失敗しました。\n\nエラー: ${error.message}\n\n詳細はコンソール（F12）を確認してください。`)
      return
    }
    
    if (data?.url) {
      console.log('🟢 OAuth URL generated successfully:', data.url)
      
      // OAuth URLの検証
      if (!data.url.startsWith('https://')) {
        console.error('🔴 OAuth URL does not start with https://')
        alert('OAuth URLが無効です。Supabaseの設定を確認してください。')
        return
      }
      
      // リダイレクトを実行
      console.log('🟢 Redirecting to OAuth provider...')
      window.location.href = data.url
    }
  } catch (err) {
    console.error('🔴 Unexpected error:', err)
    const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました'
    alert(`ログインに失敗しました。\n\nエラー: ${errorMessage}\n\n詳細はコンソール（F12）を確認してください。`)
  }
}
