import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateToken, generateSlug } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'リクエストの解析に失敗しました' },
        { status: 400 }
      )
    }

    const {
      title,
      description_short,
      start_at,
      end_at,
      location_text,
      location_type,
      fee_text,
      organizer_name,
      additional_info,
      public_page_content,
    } = body

    if (!title || !start_at) {
      return NextResponse.json(
        { error: '必須項目が不足しています: タイトル、開始日時は必須です' },
        { status: 400 }
      )
    }

    // 環境変数の確認
    const missingVars: string[] = []
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url') {
      missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_supabase_anon_key') {
      missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
    
    if (missingVars.length > 0) {
      console.error('Missing Supabase environment variables:', missingVars.join(', '))
      return NextResponse.json(
        { 
          error: `サーバー設定エラー: Supabaseの環境変数が設定されていません。\n\n不足している変数: ${missingVars.join(', ')}\n\n設定方法:\n1. Supabase Dashboard (https://supabase.com/dashboard) にアクセス\n2. Settings → API から認証情報を取得\n3. .env.local ファイルを編集して実際の値を設定\n4. 開発サーバーを再起動\n\n詳細は ENV_SETUP.md を参照してください。`
        },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    
    // ユーザー認証を確認（ログインしている場合）
    const { data: { user } } = await supabase.auth.getUser()
    
    // スラッグの重複チェック（簡易版）
    let slug = generateSlug(title)
    let attempts = 0
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()
      
      if (!existing) break
      slug = generateSlug(title)
      attempts++
    }
    
    const adminToken = generateToken()

    const { data, error } = await supabase
      .from('events')
      .insert({
        slug,
        title,
        description_short: description_short || null,
        start_at,
        end_at: end_at || null,
        location_text: location_text || null,
        location_type: location_type || 'offline',
        fee_text: fee_text || null,
        organizer_name: organizer_name || null,
        additional_info: additional_info || null,
        public_page_content: public_page_content || null,
        admin_token: adminToken,
        user_id: user?.id || null, // ログインしている場合はuser_idを保存
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // より詳細なエラーメッセージ
      let errorMessage = 'イベントの作成に失敗しました'
      if (error.message) {
        errorMessage = error.message
      } else if (error.code) {
        errorMessage = `データベースエラー (${error.code}): ${error.message || 'Unknown error'}`
      }
      
      // よくあるエラーの説明を追加
      if (error.code === '42P01') {
        errorMessage = 'データベーステーブルが存在しません。Supabase DashboardのSQL Editorでsupabase-schema.sqlを実行してください。'
      } else if (error.code === '42501') {
        errorMessage = '権限エラー: RLSポリシーが正しく設定されていない可能性があります。supabase-schema.sqlを確認してください。'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          code: error.code,
          details: process.env.NODE_ENV === 'development' ? error : undefined
        },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'イベントの作成に失敗しました（データが返されませんでした）' },
        { status: 500 }
      )
    }

    // リクエストのOriginを取得（クライアント側から呼ばれる場合）
    const referer = request.headers.get('referer')
    const origin = request.headers.get('origin') || 
                   (referer ? new URL(referer).origin : null) ||
                   'http://localhost:3000'
    
    return NextResponse.json({
      data,
      public_url: `${origin}/e/${slug}`,
      admin_url: `${origin}/admin/${adminToken}/events/${data.id}`,
    })
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
