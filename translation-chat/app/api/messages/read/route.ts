import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// メッセージ既読API
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messageId } = body

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      )
    }

    // 既読状態を確認
    const { data: existingRead } = await supabase
      .from('message_reads')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .single()

    if (existingRead) {
      // 既に既読の場合は更新
      const { error } = await supabase
        .from('message_reads')
        .update({ read_at: new Date().toISOString() })
        .eq('id', existingRead.id)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update read status', details: error },
          { status: 500 }
        )
      }
    } else {
      // 新規既読レコードを作成
      const { error } = await supabase
        .from('message_reads')
        .insert({
          message_id: messageId,
          user_id: user.id,
        })

      if (error) {
        return NextResponse.json(
          { error: 'Failed to mark as read', details: error },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Read status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update read status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

