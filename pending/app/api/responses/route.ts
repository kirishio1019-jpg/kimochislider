import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_id, score, edit_token, is_confirmed, x_value, y_value } = body

    if (!event_id || score === undefined || !edit_token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // x_valueとy_valueが提供されている場合はそれを使用、そうでなければscoreから逆算
    const finalXValue = x_value !== undefined 
      ? Math.max(0, Math.min(100, Math.round(x_value)))
      : Math.max(0, Math.min(100, Math.round(score)))
    const finalYValue = y_value !== undefined
      ? Math.max(0, Math.min(100, Math.round(y_value)))
      : Math.max(0, Math.min(100, Math.round(score)))

    const { data, error } = await supabase
      .from('responses')
      .insert({
        event_id,
        score: Math.max(0, Math.min(100, Math.round(score))),
        edit_token,
        is_confirmed: is_confirmed || false,
        x_value: finalXValue,
        y_value: finalYValue,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
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
