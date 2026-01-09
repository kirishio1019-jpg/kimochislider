import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// イベントの回答一覧を取得（マトリクス表示用）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ event_id: string }> }
) {
  try {
    const { event_id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!event_id) {
      return NextResponse.json(
        { error: 'Missing event_id' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // user_idが指定されている場合、そのユーザーの回答を取得
    if (userId) {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('event_id', event_id)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ data: data || [] })
    }

    // user_idが指定されていない場合、x_valueとy_valueが存在する回答のみ取得（マトリクス表示用）
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
