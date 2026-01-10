import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTranslationProvider, normalizeLanguageCode } from '@/lib/translation'

// 翻訳APIエンドポイント
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messageId, targetLang, sourceLang } = body

    if (!messageId || !targetLang) {
      return NextResponse.json(
        { error: 'messageId and targetLang are required' },
        { status: 400 }
      )
    }

    // メッセージを取得
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('original_text, detected_lang, user_specified_lang')
      .eq('id', messageId)
      .single()

    if (messageError || !message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    const normalizedTargetLang = normalizeLanguageCode(targetLang)
    const normalizedSourceLang = sourceLang 
      ? normalizeLanguageCode(sourceLang)
      : (message.user_specified_lang || message.detected_lang)

    // 既存の翻訳をチェック
    const { data: existingTranslation } = await supabase
      .from('message_translations')
      .select('translated_text')
      .eq('message_id', messageId)
      .eq('target_lang', normalizedTargetLang)
      .single()

    if (existingTranslation) {
      return NextResponse.json({
        translatedText: existingTranslation.translated_text,
        cached: true,
      })
    }

    // 翻訳を実行
    const provider = createTranslationProvider()
    const translatedText = await provider.translate(
      message.original_text,
      normalizedTargetLang,
      normalizedSourceLang
    )

    // 翻訳結果を保存
    const { error: saveError } = await supabase
      .from('message_translations')
      .insert({
        message_id: messageId,
        target_lang: normalizedTargetLang,
        translated_text: translatedText,
        provider: 'google', // 実際のプロバイダーを記録
      })

    if (saveError) {
      console.error('Failed to save translation:', saveError)
      // 翻訳は成功したが保存に失敗した場合でも返す
    }

    return NextResponse.json({
      translatedText,
      cached: false,
    })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Translation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

