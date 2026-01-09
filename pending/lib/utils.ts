import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// スコアをカテゴリに変換（types/index.tsに移動）

// ランダムなトークンを生成
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// スラッグを生成（URL用）
// イベントごとに毎回異なるURLを生成するため、タイムスタンプとランダム文字列を使用
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 30)
  
  // タイムスタンプ（ミリ秒）の下6桁とランダム文字列を組み合わせて一意性を確保
  const timestamp = Date.now().toString(36).slice(-6)
  const random = Math.random().toString(36).substring(2, 10)
  
  // baseが空の場合はランダム文字列のみを使用
  if (!base) {
    return `event-${timestamp}-${random}`
  }
  
  return `${base}-${timestamp}-${random}`
}

// アプリのベースURLを取得（クライアントサイド用）
// 本番環境では環境変数を使用、開発環境ではwindow.location.originを使用
export function getAppUrl(): string {
  if (typeof window === 'undefined') {
    // サーバーサイドの場合
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
  
  // クライアントサイドの場合
  const envUrl = process.env.NEXT_PUBLIC_APP_URL
  if (envUrl && envUrl !== 'undefined' && !envUrl.includes('localhost')) {
    return envUrl
  }
  
  // 環境変数が設定されていない、またはlocalhostの場合は現在のoriginを使用
  return window.location.origin
}
