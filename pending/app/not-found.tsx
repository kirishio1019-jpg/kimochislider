import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">404</h1>
          <p className="text-lg text-gray-600">
            ページが見つかりませんでした
          </p>
        </div>
        <Link href="/">
          <Button size="lg">ホームに戻る</Button>
        </Link>
      </div>
    </div>
  )
}
