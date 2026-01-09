import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_id, score, edit_token, is_confirmed, x_value, y_value, user_id } = body

    if (!event_id || score === undefined || !edit_token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // ユーザー認証を確認
    const { data: { user } } = await supabase.auth.getUser()
    const finalUserId = user_id || user?.id || null

    // x_valueとy_valueが提供されている場合はそれを使用、そうでなければscoreから逆算
    const finalXValue = x_value !== undefined 
      ? Math.max(0, Math.min(100, Math.round(x_value)))
      : Math.max(0, Math.min(100, Math.round(score)))
    const finalYValue = y_value !== undefined
      ? Math.max(0, Math.min(100, Math.round(y_value)))
      : Math.max(0, Math.min(100, Math.round(score)))

    const responseData = {
      event_id,
      score: Math.max(0, Math.min(100, Math.round(score))),
      edit_token,
      is_confirmed: is_confirmed || false,
      x_value: finalXValue,
      y_value: finalYValue,
      user_id: finalUserId,
      updated_at: new Date().toISOString(),
    }

    let data, error

    // user_idがある場合、既存のレコードを更新または作成
    if (finalUserId) {
      // 既存のレコードを確認
      const { data: existingResponse } = await supabase
        .from('responses')
        .select('id, edit_token')
        .eq('event_id', event_id)
        .eq('user_id', finalUserId)
        .maybeSingle()

      if (existingResponse) {
        // 既存のレコードを更新（edit_tokenは既存のものを保持）
        console.log('[API] Updating existing response for user:', finalUserId)
        const updateData = {
          ...responseData,
          edit_token: existingResponse.edit_token, // 既存のedit_tokenを保持
        }
        const result = await supabase
          .from('responses')
          .update(updateData)
          .eq('id', existingResponse.id)
          .select()
          .single()
        data = result.data
        error = result.error
      } else {
        // 新規作成（user_idがある場合）
        console.log('[API] Creating new response for user:', finalUserId)
        const result = await supabase
          .from('responses')
          .insert(responseData)
          .select()
          .single()
        data = result.data
        error = result.error
      }
    } else {
      // user_idがない場合（匿名ユーザー）、新規作成
      console.log('[API] Creating new response for anonymous user')
      const result = await supabase
        .from('responses')
        .insert(responseData)
        .select()
        .single()
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Supabase error:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Error details:', error.details)
      console.error('Error hint:', error.hint)
      
      return NextResponse.json(
        { 
          error: error.message || 'データの保存に失敗しました',
          code: error.code,
          details: error.details,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error in POST /api/responses:', error)
    const errorMessage = error instanceof Error ? error.message : '予期しないエラーが発生しました'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
