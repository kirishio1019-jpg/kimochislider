import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'
import MessageEventPageClient from './MessageEventPageClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!event) {
    return {
      title: 'イベントが見つかりません',
    }
  }

  // 絶対URLを生成（Vercel本番環境で確実に動作するように）
  // サーバーサイドでは環境変数を使用、なければデフォルト値を使用
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-name.vercel.app'
  const pageUrl = `${appUrl}/m/${slug}`
  
  // ユニークなユーザーの回答数を取得（OGP画像用）
  const { data: responses } = await supabase
    .from('responses')
    .select('user_id')
    .eq('event_id', event.id)

  let uniqueCount = 0
  if (responses) {
    const userIds = new Set<string>()
    for (const response of responses) {
      if (response.user_id) {
        userIds.add(response.user_id)
      } else {
        // 匿名ユーザーは各レコードを1つとしてカウント
        uniqueCount++
      }
    }
    uniqueCount += userIds.size
  }
  
  // OGP画像URL（プレゼントUI風のデザイン）- 絶対URLで生成
  // Next.jsのファイルベースメタデータ（opengraph-image.tsx）を使用する場合と、
  // APIエンドポイント（/api/og）を使用する場合の両方に対応
  const ogImageUrl = `${appUrl}/api/og?title=${encodeURIComponent(event.title)}&slug=${encodeURIComponent(slug)}&count=${uniqueCount}`
  
  // デバッグ用ログ
  console.log('[OGP Metadata]', {
    appUrl,
    pageUrl,
    ogImageUrl,
    title: event.title,
    slug,
    envUrl: process.env.NEXT_PUBLIC_APP_URL,
  })

  return {
    metadataBase: new URL(appUrl),
    title: `イベントへのご招待: ${event.title}`,
    description: 'イベントのご招待です。きもちスライダーで気持ちを共有しましょう',
    openGraph: {
      type: 'website',
      locale: 'ja_JP',
      url: pageUrl,
      siteName: 'きもちスライダー',
      title: `イベントへのご招待: ${event.title}`,
      description: 'イベントのご招待です。きもちスライダーで気持ちを共有しましょう',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${event.title} - イベントのご招待です`,
          type: 'image/png',
          secureUrl: ogImageUrl, // HTTPS対応
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `イベントへのご招待: ${event.title}`,
      description: 'イベントのご招待です。きもちスライダーで気持ちを共有しましょう',
      images: [ogImageUrl],
    },
    // 追加のメタデータ（LINE、Slack、Discord等に対応）
    // Next.jsのMetadata APIでは、otherプロパティで追加のメタタグを設定可能
    other: {
      'og:image:secure_url': ogImageUrl,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/png',
      'og:image:alt': `${event.title} - イベントのご招待です`,
      // Discord用
      'theme-color': '#ff6b6b',
    },
  }
}

export default async function MessageEventPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Googleログイン必須チェック
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !event) {
    notFound()
  }

  // ユニークなユーザーの回答数を取得
  // user_idがNULLでない場合はユニークなuser_idの数をカウント
  // user_idがNULLの場合は各レコードを1つとしてカウント
  const { data: responses } = await supabase
    .from('responses')
    .select('user_id')
    .eq('event_id', event.id)

  let uniqueCount = 0
  if (responses) {
    const userIds = new Set<string>()
    for (const response of responses) {
      if (response.user_id) {
        userIds.add(response.user_id)
      } else {
        // 匿名ユーザーは各レコードを1つとしてカウント
        uniqueCount++
      }
    }
    uniqueCount += userIds.size
  }

  return <MessageEventPageClient event={event} responseCount={uniqueCount} />
}
