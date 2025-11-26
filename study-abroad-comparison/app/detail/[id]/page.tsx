import DetailPage from '@/components/detail-page'

interface DetailPageParams {
  params: Promise<{
    id: string
  }>
}

export default async function Detail({ params }: DetailPageParams) {
  const { id } = await params
  const reviewId = parseInt(id, 10)
  
  if (isNaN(reviewId)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-center text-muted-foreground">無効なIDです</p>
      </div>
    )
  }

  return <DetailPage reviewId={reviewId} />
}

