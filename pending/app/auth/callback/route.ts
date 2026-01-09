import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const errorDescription = requestUrl.searchParams.get('error_description')
    
    // 本番環境では環境変数を使用、開発環境ではrequestUrl.originを使用
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin

    console.log('[Auth Callback] Request URL:', requestUrl.toString())
    console.log('[Auth Callback] Code:', code)
    console.log('[Auth Callback] Error:', error)
    console.log('[Auth Callback] Error Description:', errorDescription)
    console.log('[Auth Callback] App URL:', appUrl)

    const supabase = await createClient()

    // エラーがある場合はエラーページにリダイレクト
    if (error) {
      console.error('[Auth Callback] OAuth error:', error, errorDescription)
      // エラーがあっても、既存のセッションを確認
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        console.log('[Auth Callback] User already authenticated, redirecting to my-events')
        return NextResponse.redirect(new URL('/my-events', appUrl).toString())
      }
      return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`, appUrl).toString())
    }

    // コードがある場合はセッションを交換
    if (code) {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('[Auth Callback] Exchange error:', exchangeError)
        // エラーがあっても、既存のセッションを確認
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          console.log('[Auth Callback] User already authenticated despite exchange error, redirecting to my-events')
          return NextResponse.redirect(new URL('/my-events', appUrl).toString())
        }
        return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(exchangeError.message)}&error_description=${encodeURIComponent('認証セッションの交換に失敗しました')}`, appUrl).toString())
      }

      console.log('[Auth Callback] Exchange successful, user:', data.user?.id)
      
      // 認証後にマイページにリダイレクト（絶対URLを使用）
      return NextResponse.redirect(new URL('/my-events', appUrl).toString())
    }

    // コードがない場合でも、既存のセッションを確認
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      console.log('[Auth Callback] No code but user already authenticated, redirecting to my-events')
      return NextResponse.redirect(new URL('/my-events', appUrl).toString())
    }

    // コードもセッションもない場合はエラー
    console.error('[Auth Callback] No code parameter found and no existing session')
    return NextResponse.redirect(new URL(`/?error=no_code&error_description=${encodeURIComponent('認証コードが取得できませんでした')}`, appUrl).toString())
  } catch (error) {
    console.error('[Auth Callback] Unexpected error:', error)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const errorMessage = error instanceof Error ? error.message : '予期しないエラーが発生しました'
    
    // エラーが発生しても、既存のセッションを確認
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        console.log('[Auth Callback] User authenticated despite error, redirecting to my-events')
        return NextResponse.redirect(new URL('/my-events', appUrl).toString())
      }
    } catch {
      // セッション確認も失敗した場合はエラーページにリダイレクト
    }
    
    return NextResponse.redirect(new URL(`/?error=unexpected_error&error_description=${encodeURIComponent(errorMessage)}`, appUrl).toString())
  }
}
