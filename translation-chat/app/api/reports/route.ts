import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 通報作成API
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reportedUserId, reportedMessageId, reason } = body

    if (!reason) {
      return NextResponse.json(
        { error: 'reason is required' },
        { status: 400 }
      )
    }

    if (!reportedUserId && !reportedMessageId) {
      return NextResponse.json(
        { error: 'reportedUserId or reportedMessageId is required' },
        { status: 400 }
      )
    }

    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        reported_message_id: reportedMessageId,
        reason,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create report', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Report creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

