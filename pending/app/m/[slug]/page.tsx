import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-name.vercel.app'
  // OGP画像URL（プレゼントUI風のデザイン）
  const ogImageUrl = `${appUrl}/api/og?title=${encodeURIComponent(event.title)}&slug=${slug}`

  return {
    title: `${event.title} - イベントのご招待です`,
    description: 'イベントのご招待です。きもちスライダーで気持ちを共有しましょう',
    openGraph: {
      title: `${event.title} - イベントのご招待です`,
      description: 'イベントのご招待です。きもちスライダーで気持ちを共有しましょう',
      url: `${appUrl}/m/${slug}`,
      siteName: 'きもちスライダー',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${event.title} - イベントのご招待です`,
        },
      ],
      locale: 'ja_JP',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${event.title} - イベントのご招待です`,
      description: 'イベントのご招待です。きもちスライダーで気持ちを共有しましょう',
      images: [ogImageUrl],
    },
    // LINE用のメタデータ
    other: {
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/png',
    },
  }
}

export default async function MessageEventPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

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
