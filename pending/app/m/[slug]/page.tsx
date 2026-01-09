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
  const ogImageUrl = `${appUrl}/api/og?title=${encodeURIComponent(event.title)}&slug=${slug}`

  return {
    title: event.title,
    description: event.description_short || 'きもちスライダーで気持ちを共有しましょう',
    openGraph: {
      title: event.title,
      description: event.description_short || 'きもちスライダーで気持ちを共有しましょう',
      url: `${appUrl}/m/${slug}`,
      siteName: 'きもちスライダー',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
      locale: 'ja_JP',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: event.description_short || 'きもちスライダーで気持ちを共有しましょう',
      images: [ogImageUrl],
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

  // 回答数を取得
  const { count } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)

  return <MessageEventPageClient event={event} responseCount={count ?? 0} />
}
