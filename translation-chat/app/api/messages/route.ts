import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTranslationProvider, normalizeLanguageCode } from '@/lib/translation'
import { checkSpam } from '@/lib/spam-detection'

// メッセージ送信API
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId, text, messageType = 'text', imageUrl, replyToId, specifiedLang } = body

    if (!conversationId || (!text && !imageUrl)) {
      return NextResponse.json(
        { error: 'conversationId and text or imageUrl are required' },
        { status: 400 }
      )
    }

    // 会話のメンバーシップを確認
    const { data: membership, error: membershipError } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Not a member of this conversation' },
        { status: 403 }
      )
    }

    // スパムチェック
    if (text) {
      const spamCheck = await checkSpam(text, user.id, supabase)
      if (spamCheck.isSpam) {
        return NextResponse.json(
          { error: spamCheck.reason || 'スパムと判定されました', blockedWords: spamCheck.blockedWords },
          { status: 400 }
        )
      }
    }

    // 言語判定
    let detectedLang: string | undefined
    if (text && !specifiedLang) {
      try {
        const provider = createTranslationProvider()
        detectedLang = await provider.detectLanguage(text)
      } catch (error) {
        console.error('Language detection failed:', error)
        // 言語判定に失敗してもメッセージ送信は続行
      }
    }

    // メッセージを保存
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        original_text: text || '',
        detected_lang: detectedLang,
        user_specified_lang: specifiedLang,
        message_type: messageType,
        image_url: imageUrl,
        reply_to_id: replyToId,
      })
      .select()
      .single()

    if (messageError || !message) {
      return NextResponse.json(
        { error: 'Failed to create message', details: messageError },
        { status: 500 }
      )
    }

    // 会話の更新時刻を更新
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Message creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// メッセージ取得API
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }

    // 会話のメンバーシップを確認
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

    // メッセージを取得
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name, avatar_url, native_lang)
      `)
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (messagesError) {
      return NextResponse.json(
        { error: 'Failed to fetch messages', details: messagesError },
        { status: 500 }
      )
    }

    // ユーザーの表示言語を取得
    const { data: userProfile } = await supabase
      .from('users')
      .select('display_lang')
      .eq('id', user.id)
      .single()

    const displayLang = userProfile?.display_lang || 'en'

    // 各メッセージの翻訳を取得
    const messagesWithTranslations = await Promise.all(
      (messages || []).map(async (message) => {
        const messageLang = message.user_specified_lang || message.detected_lang || 'en'
        
        // 表示言語が原文言語と同じ場合は翻訳不要
        if (normalizeLanguageCode(displayLang) === normalizeLanguageCode(messageLang)) {
          return {
            ...message,
            translations: { [displayLang]: message.original_text },
          }
        }

        // 翻訳を取得
        const { data: translation } = await supabase
          .from('message_translations')
          .select('translated_text')
          .eq('message_id', message.id)
          .eq('target_lang', normalizeLanguageCode(displayLang))
          .single()

        return {
          ...message,
          translations: {
            [displayLang]: translation?.translated_text || message.original_text,
          },
        }
      })
    )

    // 既読状態を取得
    const messageIds = messagesWithTranslations.map(m => m.id)
    const { data: reads } = await supabase
      .from('message_reads')
      .select('message_id')
      .in('message_id', messageIds)
      .eq('user_id', user.id)

    const readMessageIds = new Set(reads?.map(r => r.message_id) || [])

    const messagesWithReadStatus = messagesWithTranslations.map(message => ({
      ...message,
      is_read: readMessageIds.has(message.id),
    }))

    return NextResponse.json({ messages: messagesWithReadStatus })
  } catch (error) {
    console.error('Message fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
