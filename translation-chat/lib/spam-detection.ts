// スパム検知とNGワードフィルタリング

// NGワードリスト（実際の実装ではデータベースから取得することを推奨）
const NG_WORDS = [
  // 日本語のNGワード例
  'スパム',
  '詐欺',
  // 英語のNGワード例
  'spam',
  'scam',
  // 追加のNGワードは設定から管理可能にする
]

// スパムパターン（例: 短時間に大量のメッセージ送信）
const SPAM_PATTERNS = {
  MAX_MESSAGES_PER_MINUTE: 10,
  MAX_MESSAGES_PER_HOUR: 50,
}

export interface SpamCheckResult {
  isSpam: boolean
  reason?: string
  blockedWords?: string[]
}

/**
 * NGワードをチェック
 */
export function checkNGWords(text: string): SpamCheckResult {
  const lowerText = text.toLowerCase()
  const blockedWords: string[] = []

  for (const word of NG_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      blockedWords.push(word)
    }
  }

  if (blockedWords.length > 0) {
    return {
      isSpam: true,
      reason: 'NGワードが含まれています',
      blockedWords,
    }
  }

  return { isSpam: false }
}

/**
 * スパムパターンをチェック（短時間の大量送信など）
 */
export async function checkSpamPatterns(
  userId: string,
  supabase: any
): Promise<SpamCheckResult> {
  const now = new Date()
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  // 過去1分間のメッセージ数をチェック
  const { count: recentCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('sender_id', userId)
    .gte('created_at', oneMinuteAgo.toISOString())
    .is('deleted_at', null)

  if (recentCount && recentCount >= SPAM_PATTERNS.MAX_MESSAGES_PER_MINUTE) {
    return {
      isSpam: true,
      reason: '短時間に大量のメッセージを送信しています',
    }
  }

  // 過去1時間のメッセージ数をチェック
  const { count: hourlyCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('sender_id', userId)
    .gte('created_at', oneHourAgo.toISOString())
    .is('deleted_at', null)

  if (hourlyCount && hourlyCount >= SPAM_PATTERNS.MAX_MESSAGES_PER_HOUR) {
    return {
      isSpam: true,
      reason: '1時間あたりのメッセージ送信数が上限を超えています',
    }
  }

  return { isSpam: false }
}

/**
 * 総合的なスパムチェック
 */
export async function checkSpam(
  text: string,
  userId: string,
  supabase: any
): Promise<SpamCheckResult> {
  // NGワードチェック
  const ngWordCheck = checkNGWords(text)
  if (ngWordCheck.isSpam) {
    return ngWordCheck
  }

  // スパムパターンチェック
  const patternCheck = await checkSpamPatterns(userId, supabase)
  if (patternCheck.isSpam) {
    return patternCheck
  }

  return { isSpam: false }
}

