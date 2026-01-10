import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// メッセージ検索API
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const conversationId = searchParams.get('conversationId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // 会話のメンバーシップを確認
    let messagesQuery = supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name, avatar_url),
        translations:message_translations(target_lang, translated_text)
      `)
      .is('deleted_at', null)
      .or(`original_text.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // 会話IDが指定されている場合はフィルタ
    if (conversationId) {
      // メンバーシップを確認
      const { data: membership } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        return NextResponse.json(
          { error: 'Not a member of this conversation' },
          { status: 403 }
        )
      }

      messagesQuery = messagesQuery.eq('conversation_id', conversationId)
    } else {
      // 全会話から検索する場合、ユーザーが参加している会話のみ
      const { data: userConversations } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', user.id)

      const conversationIds = userConversations?.map(c => c.conversation_id) || []
      if (conversationIds.length === 0) {
        return NextResponse.json({ messages: [] })
      }

      messagesQuery = messagesQuery.in('conversation_id', conversationIds)
    }

    const { data: messages, error: messagesError } = await messagesQuery

    if (messagesError) {
      return NextResponse.json(
        { error: 'Failed to search messages', details: messagesError },
        { status: 500 }
      )
    }

    // 翻訳文も検索対象に含める（翻訳テキストにマッチする場合）
    const { data: translations } = await supabase
      .from('message_translations')
      .select('message_id, translated_text')
      .ilike('translated_text', `%${query}%`)

    const translationMessageIds = new Set(translations?.map(t => t.message_id) || [])
    
    // 翻訳文にマッチするメッセージも追加
    if (translationMessageIds.size > 0) {
      let translationQuery = supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, name, avatar_url),
          translations:message_translations(target_lang, translated_text)
        `)
        .is('deleted_at', null)
        .in('id', Array.from(translationMessageIds))
        .order('created_at', { ascending: false })

      if (conversationId) {
        translationQuery = translationQuery.eq('conversation_id', conversationId)
      }

      const { data: translationMessages } = await translationQuery
      
      // 既存のメッセージとマージ（重複を除去）
      const existingIds = new Set(messages?.map(m => m.id) || [])
      const newMessages = translationMessages?.filter(m => !existingIds.has(m.id)) || []
      messages?.push(...newMessages)
    }

    // 既読状態を取得
    const messageIds = messages?.map(m => m.id) || []
    const { data: reads } = await supabase
      .from('message_reads')
      .select('message_id')
      .in('message_id', messageIds)
      .eq('user_id', user.id)

    const readMessageIds = new Set(reads?.map(r => r.message_id) || [])

    const messagesWithReadStatus = messages?.map(message => ({
      ...message,
      is_read: readMessageIds.has(message.id),
    })) || []

    return NextResponse.json({ messages: messagesWithReadStatus })
  } catch (error) {
    console.error('Message search error:', error)
    return NextResponse.json(
      { error: 'Failed to search messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

