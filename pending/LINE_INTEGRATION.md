# LINE統合ガイド

## 現在の実装

現在、`/embed/[slug]`というURLをLINEやFacebookのメッセージに貼り付けると、リンクをクリックして別ページとして開く形式になっています。

## メッセージ内に直接スライダーを表示する方法

LINEのメッセージ内に直接スライダーを表示するには、以下の2つの方法があります：

### 1. LINE Flex Message API（推奨）

LINE Flex Messageを使用すると、メッセージ内にインタラクティブなUIを表示できます。

**必要なもの：**
- LINE公式アカウント
- LINE Messaging APIの設定
- Bot開発

**実装方法：**

```typescript
// app/api/line/flex-message/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { eventId, embedUrl } = await request.json()
  
  const flexMessage = {
    type: 'flex',
    altText: '参加気持ちスライダー',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'イベントへの参加気持ちを教えてください',
            weight: 'bold',
            size: 'lg'
          },
          {
            type: 'separator',
            margin: 'md'
          },
          {
            type: 'text',
            text: 'スライダーを操作して気持ちを入力',
            size: 'sm',
            color: '#666666',
            margin: 'md'
          },
          {
            type: 'button',
            action: {
              type: 'uri',
              label: 'スライダーを開く',
              uri: embedUrl
            },
            style: 'primary',
            margin: 'md'
          }
        ]
      }
    }
  }
  
  return NextResponse.json({ flexMessage })
}
```

**制限事項：**
- Flex Messageにはスライダーコンポーネントが直接含まれないため、Webviewを使用する必要があります
- LINE公式アカウントの申請と審査が必要

### 2. LINE Webview（推奨）

LINE Webviewを使用すると、メッセージ内にWebページを埋め込めます。

**実装方法：**

1. **LINE Botの設定**
   - LINE Developers ConsoleでBotを作成
   - Webhook URLを設定
   - Channel Access Tokenを取得

2. **Webviewページの最適化**

現在の`/embed/[slug]`ページをLINE Webview用に最適化：

```typescript
// app/embed/[slug]/EmbedSliderClient.tsx に追加
useEffect(() => {
  if (typeof window !== 'undefined') {
    // LINE Webviewの検出
    const isLineWebview = navigator.userAgent.includes('Line')
    
    if (isLineWebview) {
      // LINE Webview用の設定
      document.body.style.height = '100vh'
      document.body.style.overflow = 'hidden'
      
      // LINE SDKの読み込み（必要に応じて）
      // liff.init({ liffId: 'YOUR_LIFF_ID' })
    }
  }
}, [])
```

3. **LINE Botからのメッセージ送信**

```typescript
// app/api/line/send-message/route.ts
import { NextRequest, NextResponse } from 'next/server'

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN

export async function POST(request: NextRequest) {
  const { userId, embedUrl, eventTitle } = await request.json()
  
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      to: userId,
      messages: [
        {
          type: 'template',
          altText: `${eventTitle}への参加気持ちを教えてください`,
          template: {
            type: 'buttons',
            thumbnailImageUrl: 'https://your-domain.com/og-image.png',
            title: eventTitle,
            text: 'スライダーで気持ちを入力してください',
            actions: [
              {
                type: 'uri',
                label: 'スライダーを開く',
                uri: embedUrl,
                altUri: {
                  desktop: embedUrl
                }
              }
            ]
          }
        }
      ]
    })
  })
  
  return NextResponse.json({ success: true })
}
```

### 3. 現在の実装（シンプル版）

現在の実装では、以下のように使用します：

1. **イベント作成時に埋め込み用URLを取得**
   ```
   https://your-domain.com/embed/[slug]
   ```

2. **LINEやFacebookのメッセージにURLを貼り付け**

3. **受信者がリンクをクリック**
   - LINE内ブラウザで開く
   - スライダーを操作
   - 気持ちを送信

**メリット：**
- 追加の設定不要
- すぐに使える
- LINE公式アカウント不要

**デメリット：**
- リンクをクリックする必要がある
- メッセージ内に直接表示されない

## 推奨される実装

MVP段階では、現在の実装（シンプル版）を推奨します。理由：

1. **すぐに使える**: 追加の設定や審査が不要
2. **シンプル**: LINE Botの開発が不要
3. **汎用的**: Facebookや他のメッセージアプリでも使える

将来的にLINE Botを開発する場合は、Webview方式を実装することで、メッセージ内に直接スライダーを表示できます。

## 次のステップ

1. **現在の実装でテスト**: `/embed/[slug]`のURLをLINEに貼り付けて動作確認
2. **LINE Bot開発（オプション）**: より高度な統合が必要な場合
3. **Facebook Messenger統合（オプション）**: Messenger Botの開発
