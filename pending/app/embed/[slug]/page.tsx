import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

// 埋め込み用URLを通常のURLにリダイレクト（統一）
export default async function EmbedPage({ params }: PageProps) {
  const { slug } = await params
  redirect(`/e/${slug}`)
}
