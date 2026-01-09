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

    // user_idが指定されていない場合、ユニークなユーザーの最新の回答のみ取得
    // まず、すべての回答を取得
    const { data: allResponses, error: fetchError } = await supabase
      .from('responses')
      .select('id, user_id, x_value, y_value, updated_at')
      .eq('event_id', event_id)
      .not('x_value', 'is', null)
      .not('y_value', 'is', null)
      .order('updated_at', { ascending: false })

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    if (!allResponses || allResponses.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // ユニークなユーザーの最新の回答のみを抽出
    const uniqueUserResponses = new Map<string, { x_value: number; y_value: number }>()
    
    for (const response of allResponses) {
      if (response.user_id) {
        // ログインユーザー: user_idをキーとして、最新の回答のみを保持
        if (!uniqueUserResponses.has(response.user_id)) {
          uniqueUserResponses.set(response.user_id, {
            x_value: response.x_value,
            y_value: response.y_value,
          })
        }
      } else {
        // 匿名ユーザー: 各回答を個別にカウント（edit_tokenで識別できないため、すべて含める）
        // ただし、重複を避けるためにidを使用
        const key = `anonymous_${response.id}`
        if (!uniqueUserResponses.has(key)) {
          uniqueUserResponses.set(key, {
            x_value: response.x_value,
            y_value: response.y_value,
          })
        }
      }
    }

    return NextResponse.json({ 
      data: Array.from(uniqueUserResponses.values()),
      count: uniqueUserResponses.size 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
