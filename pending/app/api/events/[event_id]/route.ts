import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ event_id: string }> }
) {
  try {
    const { event_id } = await params
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
      admin_token,
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

    if (!admin_token) {
      return NextResponse.json(
        { error: 'admin_tokenが必要です' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // admin_tokenでイベントを検証
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('id')
      .eq('id', event_id)
      .eq('admin_token', admin_token)
      .single()

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: 'イベントが見つからないか、権限がありません' },
        { status: 404 }
      )
    }

    // イベントを更新
    const updateData: Record<string, any> = {}
    if (title !== undefined) updateData.title = title
    if (description_short !== undefined) updateData.description_short = description_short || null
    if (start_at !== undefined) updateData.start_at = start_at || null
    if (end_at !== undefined) updateData.end_at = end_at || null
    if (location_text !== undefined) updateData.location_text = location_text || null
    if (location_type !== undefined) updateData.location_type = location_type
    if (fee_text !== undefined) updateData.fee_text = fee_text || null
    if (organizer_name !== undefined) updateData.organizer_name = organizer_name || null
    if (additional_info !== undefined) updateData.additional_info = additional_info || null
    if (public_page_content !== undefined) updateData.public_page_content = public_page_content || null
    updateData.updated_at = new Date().toISOString()

    // 更新条件を設定（admin_tokenで検証済み）
    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', event_id)
      .eq('admin_token', admin_token)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      console.error('Update data:', JSON.stringify(updateData, null, 2))
      return NextResponse.json(
        { 
          error: 'イベントの更新に失敗しました',
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API route error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
