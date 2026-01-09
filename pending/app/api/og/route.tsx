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
            background: 'linear-gradient(135deg, #fff5e6 0%, #ffe8cc 50%, #ffd9a3 100%)',
            fontFamily: 'serif',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 装飾的な背景要素 */}
          <div
            style={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'rgba(255, 200, 100, 0.2)',
              filter: 'blur(60px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -150,
              left: -150,
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: 'rgba(255, 180, 80, 0.15)',
              filter: 'blur(80px)',
            }}
          />

          {/* リボン装飾（上部） */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 200,
              height: 80,
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
              clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)',
              boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 24,
              fontWeight: 500,
              color: '#ffffff',
              letterSpacing: '0.05em',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
          >
            ご招待
          </div>

          {/* プレゼントボックス */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 60,
              marginBottom: 40,
            }}
          >
            {/* ボックス本体 */}
            <div
              style={{
                width: 320,
                height: 200,
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)',
                borderRadius: 16,
                boxShadow: '0 8px 24px rgba(255, 107, 107, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                border: '4px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {/* リボン（横） */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: 40,
                  background: 'rgba(255, 255, 255, 0.4)',
                  transform: 'translateY(-50%)',
                }}
              />
              {/* リボン（縦） */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  width: 40,
                  background: 'rgba(255, 255, 255, 0.4)',
                  transform: 'translateX(-50%)',
                }}
              />
              
              {/* タイトル */}
              <h1
                style={{
                  fontSize: 48,
                  fontWeight: 400,
                  textAlign: 'center',
                  color: '#ffffff',
                  letterSpacing: '0.02em',
                  lineHeight: 1.3,
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  padding: '0 40px',
                  zIndex: 1,
                }}
              >
                {title}
              </h1>
            </div>

            {/* リボンの結び目（下） */}
            <div
              style={{
                width: 60,
                height: 30,
                background: 'linear-gradient(135deg, #ff5252 0%, #ff3838 100%)',
                borderRadius: '0 0 30px 30px',
                marginTop: -4,
                boxShadow: '0 4px 8px rgba(255, 82, 82, 0.3)',
              }}
            />
          </div>

          {/* サブテキスト */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              marginTop: 20,
            }}
          >
            <p
              style={{
                fontSize: 32,
                fontWeight: 300,
                color: '#8b4513',
                textAlign: 'center',
                letterSpacing: '0.02em',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
              }}
            >
              きもちスライダーで
            </p>
            <p
              style={{
                fontSize: 28,
                fontWeight: 300,
                color: '#a0522d',
                textAlign: 'center',
                letterSpacing: '0.01em',
              }}
            >
              気持ちを共有しましょう
            </p>
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
