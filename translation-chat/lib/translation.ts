// 翻訳機能の実装

export interface TranslationProvider {
  translate(text: string, targetLang: string, sourceLang?: string): Promise<string>
  detectLanguage(text: string): Promise<string>
}

// Google Cloud Translation API 実装
export class GoogleTranslateProvider implements TranslationProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<string> {
    const url = 'https://translation.googleapis.com/language/translate/v2'
    const params = new URLSearchParams({
      key: this.apiKey,
      q: text,
      target: targetLang,
      ...(sourceLang && { source: sourceLang }),
    })

    const response = await fetch(`${url}?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Translation failed: ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    return data.data.translations[0].translatedText
  }

  async detectLanguage(text: string): Promise<string> {
    const url = 'https://translation.googleapis.com/language/translate/v2/detect'
    const params = new URLSearchParams({
      key: this.apiKey,
      q: text,
    })

    const response = await fetch(`${url}?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Language detection failed: ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    return data.data.detections[0][0].language
  }
}

// DeepL API 実装（オプション）
export class DeepLProvider implements TranslationProvider {
  private apiKey: string
  private apiUrl: string

  constructor(apiKey: string, isFree: boolean = false) {
    this.apiKey = apiKey
    this.apiUrl = isFree ? 'https://api-free.deepl.com/v2' : 'https://api.deepl.com/v2'
  }

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<string> {
    const url = `${this.apiUrl}/translate`
    const body = new URLSearchParams({
      auth_key: this.apiKey,
      text: text,
      target_lang: targetLang.toUpperCase(),
      ...(sourceLang && { source_lang: sourceLang.toUpperCase() }),
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Translation failed: ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    return data.translations[0].text
  }

  async detectLanguage(text: string): Promise<string> {
    const url = `${this.apiUrl}/detect`
    const body = new URLSearchParams({
      auth_key: this.apiKey,
      text: text,
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Language detection failed: ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    return data.language.toLowerCase()
  }
}

// 翻訳プロバイダーのファクトリー
export function createTranslationProvider(): TranslationProvider {
  // 環境変数から優先プロバイダーを選択
  const googleKey = process.env.GOOGLE_TRANSLATE_API_KEY
  const deeplKey = process.env.DEEPL_API_KEY

  if (googleKey) {
    return new GoogleTranslateProvider(googleKey)
  }
  
  if (deeplKey) {
    const isFree = process.env.DEEPL_API_FREE === 'true'
    return new DeepLProvider(deeplKey, isFree)
  }

  // 開発環境ではモックプロバイダーを返す（オプション）
  if (process.env.NODE_ENV === 'development') {
    console.warn('No translation API key configured. Using mock provider.')
    return new MockTranslationProvider()
  }

  throw new Error('No translation API key configured. Please set GOOGLE_TRANSLATE_API_KEY or DEEPL_API_KEY')
}

// モック翻訳プロバイダー（開発用）
class MockTranslationProvider implements TranslationProvider {
  async translate(text: string, targetLang: string, sourceLang?: string): Promise<string> {
    // 開発環境でのみ使用されるモック実装
    return `[${targetLang}] ${text}`
  }

  async detectLanguage(text: string): Promise<string> {
    // 簡易的な言語判定（実際の実装ではより高度な判定が必要）
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) {
      return 'ja'
    }
    return 'en'
  }
}

// 言語コードの正規化（ISO 639-1）
export function normalizeLanguageCode(lang: string): string {
  return lang.toLowerCase().substring(0, 2)
}

// サポートされている言語のリスト
export const SUPPORTED_LANGUAGES = [
  { code: 'ja', name: '日本語' },
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'ko', name: '한국어' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' },
] as const

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']

