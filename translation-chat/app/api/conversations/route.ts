import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 会話一覧取得API
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ユーザーが参加している会話を取得
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversation_members')
      .select(`
        conversation:conversations(*),
        other_members:conversation_members!conversation_id(
          user:users!conversation_members_user_id_fkey(id, name, avatar_url)
        )
      `)
      .eq('user_id', user.id)
      .order('conversation(updated_at)', { ascending: false })

    if (conversationsError) {
      return NextResponse.json(
        { error: 'Failed to fetch conversations', details: conversationsError },
        { status: 500 }
      )
    }

    // 各会話の最新メッセージを取得
    const conversationsWithLastMessage = await Promise.all(
      (conversations || []).map(async (item) => {
        const conversation = item.conversation as any
        
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('id, original_text, created_at, sender_id')
          .eq('conversation_id', conversation.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          ...conversation,
          lastMessage,
          members: item.other_members,
        }
      })
    )

    return NextResponse.json({ conversations: conversationsWithLastMessage })
  } catch (error) {
    console.error('Conversations fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// 会話作成API
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, memberIds } = body

    if (!type || (type === 'group' && !title)) {
      return NextResponse.json(
        { error: 'type is required, and title is required for group conversations' },
        { status: 400 }
      )
    }

    // 1対1チャットの場合、既存の会話をチェック
    if (type === 'one_to_one') {
      if (!memberIds || memberIds.length !== 1) {
        return NextResponse.json(
          { error: 'one_to_one conversation requires exactly one memberId' },
          { status: 400 }
        )
      }

      const otherUserId = memberIds[0]

      // 既存の1対1会話を検索
      // 両方のユーザーがメンバーで、かつ1対1タイプの会話を探す
      const { data: existingConversations } = await supabase
        .from('conversation_members')
        .select(`
          conversation_id,
          conversation:conversations!inner(type)
        `)
        .eq('user_id', user.id)
        .eq('conversation.type', 'one_to_one')

      if (existingConversations) {
        // 各会話について、もう一方のユーザーもメンバーかチェック
        for (const member of existingConversations) {
          const { data: otherMember } = await supabase
            .from('conversation_members')
            .select('conversation_id')
            .eq('conversation_id', member.conversation_id)
            .eq('user_id', otherUserId)
            .single()

          if (otherMember) {
            // 既存の会話が見つかった
            const { data: existingConversation } = await supabase
              .from('conversations')
              .select('*')
              .eq('id', member.conversation_id)
              .single()

            return NextResponse.json({ conversation: existingConversation })
          }
        }
      }
    }

    // 会話を作成
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        type,
        title: type === 'group' ? title : undefined,
      })
      .select()
      .single()

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: 'Failed to create conversation', details: conversationError },
        { status: 500 }
      )
    }

    // メンバーを追加
    const membersToAdd = [
      { conversation_id: conversation.id, user_id: user.id, role: 'admin' },
      ...(memberIds || []).map((memberId: string) => ({
        conversation_id: conversation.id,
        user_id: memberId,
        role: 'member' as const,
      })),
    ]

    const { error: membersError } = await supabase
      .from('conversation_members')
      .insert(membersToAdd)

    if (membersError) {
      // 会話は作成されたがメンバー追加に失敗した場合、会話を削除
      await supabase.from('conversations').delete().eq('id', conversation.id)
      return NextResponse.json(
        { error: 'Failed to add members', details: membersError },
        { status: 500 }
      )
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error('Conversation creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

