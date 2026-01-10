// 型定義

export interface User {
  id: string
  email: string
  phone?: string
  name: string
  avatar_url?: string
  native_lang: string
  display_lang: string
  auto_detect_lang: boolean
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  type: 'one_to_one' | 'group'
  title?: string
  created_at: string
  updated_at: string
}

export interface ConversationMember {
  id: string
  conversation_id: string
  user_id: string
  role: 'admin' | 'member'
  joined_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  original_text: string
  detected_lang?: string
  user_specified_lang?: string
  message_type: 'text' | 'image' | 'file'
  image_url?: string
  reply_to_id?: string
  created_at: string
  deleted_at?: string
  // 拡張フィールド（クライアント側で追加）
  sender?: User
  translations?: Record<string, string> // 言語コード -> 翻訳テキスト
  is_read?: boolean
  reactions?: MessageReaction[]
}

export interface MessageTranslation {
  id: string
  message_id: string
  target_lang: string
  translated_text: string
  provider: string
  model_version?: string
  created_at: string
}

export interface MessageRead {
  id: string
  message_id: string
  user_id: string
  read_at: string
}

export interface MessageReaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface Block {
  id: string
  blocker_id: string
  blocked_id: string
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  reported_user_id?: string
  reported_message_id?: string
  reason: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  created_at: string
}

