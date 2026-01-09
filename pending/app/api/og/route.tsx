import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'イベント'
    const slug = searchParams.get('slug') || ''

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom, #fef7f0, #fef5ed)',
            fontFamily: 'serif',
          }}
        >
          {/* タイトル */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 80px',
              width: '100%',
            }}
          >
            <h1
              style={{
                fontSize: 64,
                fontWeight: 300,
                textAlign: 'center',
                color: '#2d1810',
                marginBottom: 20,
                letterSpacing: '0.02em',
                lineHeight: 1.2,
              }}
            >
              {title}
            </h1>
          </div>

          {/* スライダーコンポーネント */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 40,
              width: '80%',
              maxWidth: 800,
            }}
          >
            {/* 現在の気持ち表示 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px 60px',
                borderRadius: 24,
                border: '3px solid rgba(82, 45, 20, 0.3)',
                background: 'linear-gradient(to bottom right, rgba(82, 45, 20, 0.1), rgba(82, 45, 20, 0.05))',
                minHeight: 100,
                width: '100%',
              }}
            >
              <p
                style={{
                  fontSize: 36,
                  fontWeight: 300,
                  color: '#522d14',
                  textAlign: 'center',
                  letterSpacing: '0.02em',
                }}
              >
                半々
              </p>
            </div>

            {/* スライダーバー */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                width: '100%',
              }}
            >
              {/* スライダートラック */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 12,
                  borderRadius: 6,
                  background: 'linear-gradient(to right, #e8e0d8 0%, rgba(82, 45, 20, 0.3) 50%, #522d14 100%)',
                }}
              >
                {/* スライダーつまみ */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#522d14',
                    border: '3px solid #fef7f0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  }}
                />
              </div>

              {/* ラベル */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  fontSize: 24,
                  fontWeight: 300,
                  color: '#522d14',
                  letterSpacing: '0.01em',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span>まだ迷う</span>
                  <span style={{ fontSize: 18, color: '#8b6f47', opacity: 0.7 }}>今は行けなさそう</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <span>けっこう行きたい</span>
                  <span style={{ fontSize: 18, color: '#8b6f47', opacity: 0.7 }}>かなり前向き</span>
                </div>
              </div>
            </div>

            {/* CTAテキスト */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 20,
              }}
            >
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 300,
                  color: '#522d14',
                  textAlign: 'center',
                  letterSpacing: '0.01em',
                }}
              >
                タップしてスライダーで気持ちを入力
              </p>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: unknown) {
    return new Response(`Failed to generate the image: ${e instanceof Error ? e.message : String(e)}`, {
      status: 500,
    })
  }
}
