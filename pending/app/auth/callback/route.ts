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

    // エラーがある場合はエラーページにリダイレクト
    if (error) {
      console.error('[Auth Callback] OAuth error:', error, errorDescription)
      return NextResponse.redirect(`${appUrl}/?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`)
    }

    // コードがない場合はエラー
    if (!code) {
      console.error('[Auth Callback] No code parameter found')
      return NextResponse.redirect(`${appUrl}/?error=no_code&error_description=${encodeURIComponent('認証コードが取得できませんでした')}`)
    }

    // セッションを交換
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[Auth Callback] Exchange error:', exchangeError)
      return NextResponse.redirect(`${appUrl}/?error=${encodeURIComponent(exchangeError.message)}&error_description=${encodeURIComponent('認証セッションの交換に失敗しました')}`)
    }

    console.log('[Auth Callback] Exchange successful, user:', data.user?.id)

    // 認証後にマイページにリダイレクト
    return NextResponse.redirect(`${appUrl}/my-events`)
  } catch (error) {
    console.error('[Auth Callback] Unexpected error:', error)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const errorMessage = error instanceof Error ? error.message : '予期しないエラーが発生しました'
    return NextResponse.redirect(`${appUrl}/?error=unexpected_error&error_description=${encodeURIComponent(errorMessage)}`)
  }
}
