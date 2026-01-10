import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// メッセージ削除（送信取り消し）API
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

    // メッセージの所有者を確認
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('sender_id, created_at')
      .eq('id', messageId)
      .single()

    if (messageError || !message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // 送信者本人のみ削除可能
    if (message.sender_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this message' },
        { status: 403 }
      )
    }

    // 送信から一定時間以内のみ削除可能（例: 5分）
    const messageTime = new Date(message.created_at)
    const now = new Date()
    const diffMinutes = (now.getTime() - messageTime.getTime()) / (1000 * 60)
    
    if (diffMinutes > 5) {
      return NextResponse.json(
        { error: 'Message can only be deleted within 5 minutes of sending' },
        { status: 400 }
      )
    }

    // ソフトデリート（deleted_atを設定）
    const { error: deleteError } = await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete message', details: deleteError },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Message deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

