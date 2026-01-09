import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // 本番環境では環境変数を使用、開発環境ではrequestUrl.originを使用
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 認証後にマイページにリダイレクト
  return NextResponse.redirect(`${appUrl}/my-events`)
}
