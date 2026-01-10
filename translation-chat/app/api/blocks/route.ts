import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ブロック一覧取得API
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: blocks, error } = await supabase
      .from('blocks')
      .select(`
        id,
        blocked_id,
        blocked_user:users!blocks_blocked_id_fkey(id, name, avatar_url)
      `)
      .eq('blocker_id', user.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch blocks', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ blocks })
  } catch (error) {
    console.error('Blocks fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blocks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ブロック作成API
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { blockedId } = body

    if (!blockedId) {
      return NextResponse.json(
        { error: 'blockedId is required' },
        { status: 400 }
      )
    }

    if (blockedId === user.id) {
      return NextResponse.json(
        { error: 'Cannot block yourself' },
        { status: 400 }
      )
    }

    const { data: block, error } = await supabase
      .from('blocks')
      .insert({
        blocker_id: user.id,
        blocked_id: blockedId,
      })
      .select()
      .single()

    if (error) {
      // 既にブロックされている場合はエラーを無視
      if (error.code === '23505') {
        return NextResponse.json({ block: { id: 'existing' } })
      }
      return NextResponse.json(
        { error: 'Failed to create block', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ block })
  } catch (error) {
    console.error('Block creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create block', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ブロック解除API
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const blockedId = searchParams.get('blockedId')

    if (!blockedId) {
      return NextResponse.json(
        { error: 'blockedId is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', blockedId)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete block', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Block deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete block', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

