"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, Link2, LogIn, LogOut, User, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { getAppUrl } from "@/lib/utils"

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [createdEvent, setCreatedEvent] = useState<{
    embedUrl: string
    adminUrl: string
    adminToken: string
    eventId: string
  } | null>(null)
  const [copiedEmbed, setCopiedEmbed] = useState(false)
  const [copiedAdmin, setCopiedAdmin] = useState(false)

  // 認証状態を確認
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    checkUser()

    // URLパラメータからエラーを取得
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    const errorDescription = urlParams.get('error_description')
    if (error) {
      setAuthError(errorDescription || error)
      // URLからエラーパラメータを削除
      window.history.replaceState({}, '', window.location.pathname)
    }

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleGoogleLogin = async () => {
    try {
      const appUrl = getAppUrl()
      const redirectUrl = `${appUrl}/auth/callback`
      
      console.log('=== Google Login Debug ===')
      console.log('App URL:', appUrl)
      console.log('Redirect URL:', redirectUrl)
      console.log('Window location origin:', window.location.origin)
      console.log('Window location hostname:', window.location.hostname)
      console.log('Window location href:', window.location.href)
      console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
      console.log('========================')
      
      // リダイレクトURLの検証
      if (!redirectUrl.startsWith('https://') && !redirectUrl.startsWith('http://localhost')) {
        const errorMsg = `無効なリダイレクトURLです: ${redirectUrl}\n\n本番環境ではhttps://で始まるURLが必要です。`
        console.error(errorMsg)
        alert(errorMsg)
        return
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      
      if (error) {
        console.error('=== OAuth Error Details ===')
        console.error('Error:', error)
        console.error('Error name:', error.name)
        console.error('Error message:', error.message)
        console.error('Error status:', error.status)
        console.error('Error cause:', error.cause)
        console.error('Full error object:', JSON.stringify(error, null, 2))
        console.error('==========================')
        
        // より詳細なエラーメッセージを表示
        if (error.message.includes('OAuth secret') || error.message.includes('provider') || error.message.includes('not enabled')) {
          alert('Google認証が設定されていません。\n\nSupabase Dashboardで以下を設定してください：\n1. Authentication → Providers → Google を有効化\n2. Client ID と Client Secret を入力\n\n詳細は GOOGLE_AUTH_SETUP.md を参照してください。')
        } else if (error.message.includes('404') || error.message.includes('NOT_FOUND') || error.status === 404 || error.name === 'AuthApiError') {
          const setupMessage = `⚠️ リダイレクトURLが設定されていません\n\n現在のURL: ${appUrl}\n必要なリダイレクトURL: ${redirectUrl}\n\n【設定手順】\n1. Supabase Dashboardにアクセス\n2. Authentication → URL Configuration を開く\n3. Redirect URLs に以下を追加：\n   ${redirectUrl}\n4. Site URL を設定：\n   ${appUrl}\n5. Save をクリック\n6. 30秒待ってから再度お試しください\n\n詳細は FIX_GOOGLE_LOGIN_404.md を参照してください。`
          alert(setupMessage)
          console.error('=== Supabase Redirect URL Setup Required ===')
          console.error('Current App URL:', appUrl)
          console.error('Required Redirect URL:', redirectUrl)
          console.error('Full redirect URL:', redirectUrl)
          console.error('Please add this URL to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs')
          console.error('============================================')
          
          // クリップボードにコピーできるようにする
          if (navigator.clipboard) {
            navigator.clipboard.writeText(redirectUrl).then(() => {
              console.log('Redirect URL copied to clipboard:', redirectUrl)
            }).catch(() => {
              console.log('Failed to copy to clipboard')
            })
          }
        } else {
          alert(`ログインに失敗しました。\n\nエラー: ${error.message}\n\n詳細はコンソール（F12）を確認してください。`)
        }
      } else if (data?.url) {
        // OAuth URLが正常に生成された場合
        console.log('OAuth URL generated successfully:', data.url)
        // ブラウザでOAuth URLにリダイレクト（通常は自動的に行われる）
      }
    } catch (err) {
      console.error('=== Unexpected Login Error ===')
      console.error('Error:', err)
      console.error('Error type:', err?.constructor?.name)
      console.error('Error message:', err instanceof Error ? err.message : String(err))
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace')
      console.error('=============================')
      
      const errorMessage = err instanceof Error ? err.message : String(err)
      alert(`ログインに失敗しました。\n\nエラー: ${errorMessage}\n\n詳細はコンソール（F12）を確認してください。`)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const [formData, setFormData] = useState({
    title: "",
    description_short: "",
    start_at: "",
    end_at: "",
    location_text: "",
    location_type: "offline" as "online" | "offline",
    fee_text: "",
    organizer_name: "",
    additional_info: "",
    public_page_content: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // バリデーション
      if (!formData.title || !formData.start_at) {
        alert('必須項目を入力してください: タイトル、開始日時')
        setIsSubmitting(false)
        return
      }

      console.log('Submitting form data:', formData)
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      let result
      try {
        const responseText = await response.text()
        console.log('Raw response text:', responseText)
        console.log('Response text length:', responseText.length)
        
        if (!responseText) {
          throw new Error('サーバーからの応答が空です')
        }
        
        try {
          result = JSON.parse(responseText)
          console.log('Parsed result:', result)
          console.log('Result keys:', Object.keys(result || {}))
        } catch (parseError) {
          console.error('JSON parse error:', parseError)
          console.error('Failed to parse text:', responseText.substring(0, 200))
          throw new Error(`サーバーからの応答を解析できませんでした: ${responseText.substring(0, 100)}`)
        }
      } catch (parseError) {
        const errorMsg = parseError instanceof Error ? parseError.message : String(parseError)
        alert('エラー: ' + errorMsg)
        console.error('Response parsing error:', parseError)
        setIsSubmitting(false)
        return
      }

      if (response.ok && result?.data) {
        const embedUrl = `${window.location.origin}/e/${result.data.slug}`
        const adminUrl = `${window.location.origin}/admin/${result.data.admin_token}/events/${result.data.id}`
        
        setCreatedEvent({
          embedUrl,
          adminUrl,
          adminToken: result.data.admin_token,
          eventId: result.data.id,
        })
        setShowForm(false)
        
        // ログインしている場合はマイページにリダイレクト
        if (user) {
          setTimeout(() => {
            router.push('/my-events')
          }, 2000)
        }
      } else {
        // エラーメッセージの取得を改善
        let errorMessage = 'イベントの作成に失敗しました'
        
        console.log('Error handling - result:', result)
        console.log('Error handling - result.error:', result?.error)
        console.log('Error handling - result.message:', result?.message)
        
        if (result?.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error
          } else if (typeof result.error === 'object' && result.error !== null) {
            errorMessage = result.error.message || result.error.error || JSON.stringify(result.error)
          } else {
            errorMessage = String(result.error)
          }
        } else if (result?.message) {
          errorMessage = result.message
        } else if (!response.ok) {
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`
          if (result && Object.keys(result).length > 0) {
            errorMessage += ` - ${JSON.stringify(result)}`
          }
        }
        
        // 改行を含むエラーメッセージを処理
        const displayMessage = errorMessage.replace(/\n/g, ' ')
        
        // エラーメッセージを表示
        if (displayMessage && displayMessage !== 'イベントの作成に失敗しました') {
          alert('エラー: ' + displayMessage)
        } else {
          alert('エラー: イベントの作成に失敗しました。詳細はコンソールを確認してください。')
        }
        
        // 詳細なエラー情報をコンソールに出力
        console.group('🚨 API Error Details')
        console.log('Status:', response.status)
        console.log('Status Text:', response.statusText)
        console.log('OK:', response.ok)
        console.log('Result:', result)
        console.log('Result (stringified):', JSON.stringify(result, null, 2))
        console.log('Error Message:', errorMessage)
        console.log('Form Data:', formData)
        console.groupEnd()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error) || 'Unknown error'
      alert('エラーが発生しました: ' + errorMessage)
      console.error('Submit Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string, setFunc: (val: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setFunc(true)
    setTimeout(() => setFunc(false), 2000)
  }

  if (createdEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 size-72 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute top-40 right-20 size-96 rounded-full bg-accent/5 blur-3xl"></div>
        </div>
        <div className="mx-auto max-w-4xl px-4 py-32 md:py-48 lg:py-56 relative">
          <div className="flex flex-col items-center gap-12 text-center">
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm ring-2 ring-primary/20 shadow-lg">
                  <Check className="size-8 text-primary" strokeWidth={2} />
                </div>
              </div>
              <h1 className="text-balance text-3xl font-light tracking-wide md:text-4xl gradient-text">スライダーを作成しました</h1>
              <p className="text-pretty text-lg text-muted-foreground/90 md:text-xl font-light">
                メッセージアプリやSNSに貼り付けて共有できます
              </p>
            </div>

            <Card className="w-full max-w-2xl border-border/40">
              <CardHeader className="space-y-3">
                <CardTitle className="text-2xl">スライダーURL</CardTitle>
                <CardDescription className="text-pretty text-base">
                  このURLをメッセージアプリやSNSに貼り付けてください。開いた人が直接スライダーを操作できます。メッセージアプリ内では自動的にコンパクト表示になります。
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light">公開URL</span>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(createdEvent.embedUrl, setCopiedEmbed)} className="font-light">
                      {copiedEmbed ? <Check className="size-4" /> : <Copy className="size-4" />}
                    </Button>
                  </div>
                  <code className="text-pretty break-all rounded-xl bg-background/80 backdrop-blur-sm p-4 text-xs font-mono border border-border/40 font-light">
                    {createdEvent.embedUrl}
                  </code>
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <a href={createdEvent.embedUrl} target="_blank" rel="noopener noreferrer">
                        <Link2 className="size-4 mr-2" />
                        プレビュー
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(createdEvent.embedUrl, setCopiedEmbed)}
                      className="flex-1"
                    >
                      {copiedEmbed ? (
                        <>
                          <Check className="size-4 mr-2" />
                          コピー済み
                        </>
                      ) : (
                        <>
                          <Copy className="size-4 mr-2" />
                          コピー
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {user ? (
                  <div className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/8 backdrop-blur-sm p-5 shadow-md">
                    <div className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm font-light text-foreground">イベントが作成されました</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-light leading-relaxed">
                      マイページからイベントを管理できます。
                    </p>
                    <Button
                      onClick={() => router.push('/my-events')}
                      className="gap-2 font-light"
                    >
                      <Settings className="size-4" />
                      マイイベントを管理
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-muted/35 backdrop-blur-sm p-5 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-foreground">管理URL（回答を確認する用）</span>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(createdEvent.adminUrl, setCopiedAdmin)} className="font-light">
                        {copiedAdmin ? <Check className="size-4" /> : <Copy className="size-4" />}
                      </Button>
                    </div>
                    <code className="text-pretty break-all rounded-xl bg-background/80 backdrop-blur-sm p-4 text-xs font-mono border border-border/40 font-light">
                      {createdEvent.adminUrl}
                    </code>
                    <p className="text-xs text-muted-foreground/80 font-light leading-relaxed">
                      このURLで回答状況や気持ちの分布を確認できます。必ず保存してください。
                    </p>
                    <div className="mt-2 pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground/80 font-light mb-2">
                        Googleでログインすると、マイページから簡単に管理できます。
                      </p>
                      <Button
                        onClick={handleGoogleLogin}
                        variant="outline"
                        size="sm"
                        className="gap-2 font-light"
                      >
                        <LogIn className="size-4" />
                        Googleでログイン
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 rounded-2xl border-l-4 border-l-yellow-500/40 bg-yellow-500/5 backdrop-blur-sm p-5 text-left">
                  <p className="text-sm font-light text-yellow-900/90 dark:text-yellow-100/90">
                    使い方
                  </p>
                  <ol className="text-xs text-yellow-800/80 dark:text-yellow-200/80 space-y-2 list-decimal list-inside font-light leading-relaxed">
                    <li>公開URLをコピー</li>
                    <li>メッセージアプリやSNSに貼り付け</li>
                    <li>開いた人がスライダーで気持ちを入力</li>
                    <li>管理URLで回答状況を確認</li>
                  </ol>
                </div>

                <Button
                  onClick={() => {
                    setCreatedEvent(null)
                    setShowForm(false)
                    setFormData({
                      title: "",
                      description_short: "",
                      start_at: "",
                      end_at: "",
                      location_text: "",
                      location_type: "offline",
                      fee_text: "",
    organizer_name: "",
    additional_info: "",
    public_page_content: "",
  })
                  }}
                  variant="outline"
                  className="w-full"
                >
                  新しいスライダーを作成
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 size-72 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute top-40 right-20 size-96 rounded-full bg-accent/5 blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 size-80 rounded-full bg-primary/3 blur-3xl"></div>
      </div>
      
      {/* ヘッダー（ログイン/ログアウト） */}
      <div className="absolute top-4 right-4 z-10">
        {loading ? (
          <div className="h-10 w-24 animate-pulse rounded-2xl bg-muted"></div>
        ) : user ? (
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/my-events')}
              variant="outline"
              className="gap-2 font-light"
            >
              <User className="size-4" />
              マイページ
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="gap-2 font-light"
            >
              <LogOut className="size-4" />
              ログアウト
            </Button>
        </div>
        ) : (
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="gap-2 font-light"
          >
            <LogIn className="size-4" />
            Googleでログイン
          </Button>
        )}
      </div>

      <div className="mx-auto max-w-4xl px-4 py-32 md:py-48 lg:py-56">
        {/* エラーメッセージ表示 */}
        {authError && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
            <p className="text-sm font-medium text-destructive">認証エラー</p>
            <p className="mt-1 text-xs text-destructive/80">{authError}</p>
            <Button
              onClick={() => setAuthError(null)}
              variant="ghost"
              size="sm"
              className="mt-2"
            >
              閉じる
            </Button>
          </div>
        )}
        
        <div className="flex flex-col items-center gap-28 text-center">
          <div className="flex flex-col gap-6">
            <div className="relative inline-block">
              <h1 className="relative text-balance text-4xl font-light tracking-wide md:text-5xl lg:text-6xl gradient-text drop-shadow-sm">
                きもちスライダー
              </h1>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-primary/40 to-primary/60"></div>
              <div className="size-2 rounded-full bg-primary/60"></div>
              <div className="h-px w-12 bg-gradient-to-l from-transparent via-accent/40 to-accent/60"></div>
            </div>
            <p className="text-pretty text-lg text-muted-foreground/90 md:text-xl font-light">
              イベントへの参加意向を可視化するスライダー生成アプリ
            </p>
          </div>

          <Card className="w-full max-w-2xl border-border/50 bg-card/90 backdrop-blur-sm shadow-md">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-light tracking-wide text-foreground">未確定のまま応募完了</CardTitle>
              <CardDescription className="text-pretty font-light leading-relaxed mt-4">
                参加を確定せず、今の気持ちをスライダーで入力。
                <br />
                応募内容はいつでも変更可能。
                <br />
                URLをメッセージやSNSに貼るだけで、開いた人が直接スライダーを操作できます。
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-10">
              <div className="grid gap-4 text-left md:grid-cols-3">
                <div className="group relative flex flex-col gap-3 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card/70 to-card/70 backdrop-blur-sm p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all">
                  <div className="absolute top-3 right-3 size-2 rounded-full bg-primary/40 group-hover:bg-primary/60 transition-colors"></div>
                  <h3 className="font-light text-base text-foreground">判断不要</h3>
                  <p className="text-sm text-muted-foreground/90 font-light leading-relaxed">連続スライダーで直感的に気持ちを表現</p>
                </div>
                <div className="group relative flex flex-col gap-3 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/5 via-card/70 to-card/70 backdrop-blur-sm p-5 shadow-sm hover:shadow-md hover:border-accent/50 transition-all">
                  <div className="absolute top-3 right-3 size-2 rounded-full bg-accent/40 group-hover:bg-accent/60 transition-colors"></div>
                  <h3 className="font-light text-base text-foreground">安全</h3>
                  <p className="text-sm text-muted-foreground/90 font-light leading-relaxed">他の参加者には見えない完全匿名性</p>
                </div>
                <div className="group relative flex flex-col gap-3 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card/70 to-card/70 backdrop-blur-sm p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all">
                  <div className="absolute top-3 right-3 size-2 rounded-full bg-primary/40 group-hover:bg-primary/60 transition-colors"></div>
                  <h3 className="font-light text-base text-foreground">後戻り可能</h3>
                  <p className="text-sm text-muted-foreground/90 font-light leading-relaxed">いつでも気持ちの更新が可能</p>
                </div>
              </div>

              {!showForm ? (
                <Button onClick={() => setShowForm(true)} size="lg" className="w-full">
                  スライダーを作成する
                </Button>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="title">
                      イベントタイトル <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="例: 春の交流会"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="description">
                      概要 <span className="text-destructive">*</span>
                    </Label>
                    <textarea
                      id="description"
                      required
                      value={formData.description_short}
                      onChange={(e) => setFormData({ ...formData, description_short: e.target.value })}
                      placeholder="イベントの詳細な説明を自由に記入してください"
                      rows={6}
                      className="flex min-h-[80px] w-full rounded-xl border border-border/50 bg-background/80 px-3 py-2 text-sm font-light ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="start_at">
                        開始日時 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="start_at"
                        type="datetime-local"
                        required
                        value={formData.start_at}
                        onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="end_at">終了日時</Label>
                      <Input
                        id="end_at"
                        type="datetime-local"
                        value={formData.end_at}
                        onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="location_text">場所</Label>
                    <Input
                      id="location_text"
                      value={formData.location_text}
                      onChange={(e) => setFormData({ ...formData, location_text: e.target.value })}
                      placeholder="例: 渋谷区文化センター 3F会議室"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="location_type">
                      開催形式 <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="location_type"
                          value="offline"
                          checked={formData.location_type === "offline"}
                          onChange={(e) => setFormData({ ...formData, location_type: e.target.value as "offline" })}
                          className="size-4"
                        />
                        <span className="text-sm">対面</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="location_type"
                          value="online"
                          checked={formData.location_type === "online"}
                          onChange={(e) => setFormData({ ...formData, location_type: e.target.value as "online" })}
                          className="size-4"
                        />
                        <span className="text-sm">オンライン</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="fee_text">参加費</Label>
                    <Input
                      id="fee_text"
                      value={formData.fee_text}
                      onChange={(e) => setFormData({ ...formData, fee_text: e.target.value })}
                      placeholder="例: 無料、2000円、ドリンク代別"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="organizer_name">主催団体/主催者</Label>
                    <Input
                      id="organizer_name"
                      value={formData.organizer_name}
                      onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
                      placeholder="例: 田中太郎、または○○サークル"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="additional_info">その他の情報</Label>
                    <textarea
                      id="additional_info"
                      value={formData.additional_info}
                      onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                      placeholder="持ち物、注意事項、その他の情報を自由に記入してください"
                      rows={4}
                      className="flex min-h-[80px] w-full rounded-xl border border-border/50 bg-background/80 px-3 py-2 text-sm font-light ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="flex-1"
                    >
                      キャンセル
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? "作成中..." : "スライダーを作成"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
