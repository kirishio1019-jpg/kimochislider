import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// イベントの回答一覧を取得（マトリクス表示用）
export async function GET(
  request: NextRequest,
  { params }: { params: { event_id: string } }
) {
  try {
    const { event_id } = params

    if (!event_id) {
      return NextResponse.json(
        { error: 'Missing event_id' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // x_valueとy_valueが存在する回答のみ取得
    const { data, error } = await supabase
      .from('responses')
      .select('x_value, y_value')
      .eq('event_id', event_id)
      .not('x_value', 'is', null)
      .not('y_value', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
