"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FeelingSlider } from "@/components/feeling-slider"
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Event } from "@/types"

interface PublicPageContentItem {
  id: string
  type: 'text' | 'select'
  content: string
  title?: string // テキストブロックのタイトル（任意）
  options?: string[] // チェックボックスの場合の選択肢
  order: number
}

interface PublicPageEditClientProps {
  event: Event
  adminToken: string
}

export default function PublicPageEditClient({ event, adminToken }: PublicPageEditClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<PublicPageContentItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [responseCount, setResponseCount] = useState(0)
  const [showBlockTypeMenu, setShowBlockTypeMenu] = useState(false)

  useEffect(() => {
    // 既存のデータを読み込む
    if (event.public_page_content) {
      try {
        const parsed = JSON.parse(event.public_page_content)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      } catch {
        // JSONパースに失敗した場合は空配列
      }
    }

    // 回答数を取得
    const fetchResponseCount = async () => {
      try {
        const supabaseClient = createClient()
        const { count } = await supabaseClient
          .from('responses')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
        setResponseCount(count || 0)
      } catch (error) {
        console.error('Failed to fetch response count:', error)
      }
    }
    fetchResponseCount()
  }, [event.id, event.public_page_content])

  const addItem = (type: 'text' | 'select' = 'text') => {
    const newItem: PublicPageContentItem = {
      id: crypto.randomUUID(),
      type,
      content: type === 'select' ? '' : '', // チェックボックスの場合は空（必須なので後で入力が必要）
      options: type === 'select' ? ['選択肢1', '選択肢2'] : undefined,
      order: items.length
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id).map((item, index) => ({
      ...item,
      order: index
    })))
  }

  const updateItem = (id: string, updates: Partial<PublicPageContentItem>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const updateSelectOption = (id: string, optionIndex: number, value: string) => {
    setItems(items.map(item => {
      if (item.id === id && item.options) {
        const newOptions = [...item.options]
        newOptions[optionIndex] = value
        return { ...item, options: newOptions }
      }
      return item
    }))
  }

  const addSelectOption = (id: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          options: [...(item.options || []), '新しい選択肢']
        }
      }
      return item
    }))
  }

  const removeSelectOption = (id: string, optionIndex: number) => {
    setItems(items.map(item => {
      if (item.id === id && item.options) {
        return {
          ...item,
          options: item.options.filter((_, idx) => idx !== optionIndex)
        }
      }
      return item
    }))
  }

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const index = items.findIndex(item => item.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= items.length) return

    const newItems = [...items]
    const [moved] = newItems.splice(index, 1)
    newItems.splice(newIndex, 0, moved)
    
    setItems(newItems.map((item, idx) => ({ ...item, order: idx })))
  }

  const handleSave = async () => {
    // バリデーション: チェックボックスの質問文が必須
    const invalidItems = items.filter(item => item.type === 'select' && !item.content.trim())
    if (invalidItems.length > 0) {
      alert('チェックボックスの質問文は必須です。すべてのチェックボックスに質問文を入力してください。')
      return
    }

    setIsSaving(true)
    try {
      const contentJson = JSON.stringify(items)
      
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_token: adminToken,
          public_page_content: contentJson,
        }),
      })

      if (response.ok) {
        router.push(`/admin/${adminToken}/events/${event.id}/manage`)
      } else {
        console.error('Response status:', response.status)
        
        // レスポンスをテキストとして取得
        const responseText = await response.text()
        console.error('Response text:', responseText)
        
        let errorData: any = {}
        try {
          if (responseText) {
            errorData = JSON.parse(responseText)
            console.error('Parsed error data:', errorData)
          } else {
            errorData = { error: '保存に失敗しました', details: `HTTP ${response.status}: レスポンスが空です` }
          }
        } catch (parseError) {
          console.error('Failed to parse JSON:', parseError)
          errorData = { error: '保存に失敗しました', details: `HTTP ${response.status}: ${responseText || 'レスポンスが空です'}` }
        }
        
        console.error('Save error details:', errorData)
        
        // カラムが存在しないエラーの場合、より分かりやすいメッセージを表示
        let errorMessage = errorData.error || '保存に失敗しました'
        if (errorData.code === 'PGRST204' && errorData.details?.includes('public_page_content')) {
          errorMessage += '\n\nデータベースに`public_page_content`カラムが存在しません。\nSupabase DashboardのSQL Editorで以下を実行してください：\n\nALTER TABLE events ADD COLUMN IF NOT EXISTS public_page_content TEXT;'
        } else if (errorData.details) {
          errorMessage += '\n詳細: ' + errorData.details
        }
        if (errorData.code) {
          errorMessage += '\nコード: ' + errorData.code
        }
        if (errorData.hint) {
          errorMessage += '\nヒント: ' + errorData.hint
        }
        
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('エラーが発生しました: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsSaving(false)
    }
  }

  // プレビュー用のコンテンツ表示
  const renderPreviewContent = () => {
    if (items.length === 0) {
      return (
        <div className="space-y-2 text-xs text-muted-foreground/70 text-center font-light">
          <p>応募内容はいつでも変更可能です。</p>
          <p>他の参加者には見えない完全匿名性</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {items
          .sort((a, b) => a.order - b.order)
          .map((item) => {
            if (item.type === 'select') {
              return (
                <div
                  key={item.id}
                  className="space-y-2"
                >
                  {item.content && (
                    <p className="text-xs font-medium text-foreground text-center mb-2">
                      {item.content}
                    </p>
                  )}
                  <div className="space-y-2">
                    {item.options?.map((option, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-background/50 cursor-pointer hover:bg-background/80"
                      >
                        <input
                          type="radio"
                          name={`preview-select-${item.id}`}
                          className="size-4"
                          disabled
                        />
                        <span className="text-xs font-light text-foreground">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            } else {
              return (
                <div
                  key={item.id}
                  className="space-y-2"
                >
                  {item.title && (
                    <p className="text-xs font-medium text-foreground text-center mb-2">
                      {item.title}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/70 text-center font-light">
                    {item.content}
                  </p>
                </div>
              )
            }
          })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl py-8">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/admin/${adminToken}/events/${event.id}/manage`)}
              className="gap-2 font-light"
            >
              <ArrowLeft className="size-4" />
              戻る
            </Button>
            <h1 className="text-2xl font-light tracking-wide">公開ページの編集</h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 font-light"
          >
            <Save className="size-4" />
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>

        {/* プレビュー */}
        <Card className="border-border/50 shadow-md mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-light tracking-wide text-foreground">
              プレビュー
            </CardTitle>
            <p className="text-sm font-light text-muted-foreground">
              公開ページの表示イメージです
            </p>
          </CardHeader>
          <CardContent>
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="w-full max-w-md space-y-6">
                <div className="space-y-6 text-center">
                  <h1 className="text-xl font-light leading-tight tracking-wide">{event.title}</h1>
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 shadow-sm">
                      <span className="text-base font-bold text-primary">
                        {responseCount}
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        人がスライドした
                      </span>
                    </div>
                  </div>
                </div>

                {/* スライダー */}
                <div className="rounded-2xl border border-border/50 bg-muted/25 backdrop-blur-sm p-6 shadow-md">
                  <FeelingSlider
                    value={0}
                    onChange={() => {}}
                    disabled={true}
                    showMatrix={false}
                    xValue={0}
                    yValue={50}
                    onXChange={() => {}}
                    onYChange={() => {}}
                    availabilityStatus={null}
                    onAvailabilityChange={() => {}}
                  />
                </div>

                {/* 追加コンテンツのプレビュー */}
                {renderPreviewContent()}

                <button
                  type="button"
                  disabled
                  className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-light shadow-md opacity-50 cursor-not-allowed"
                >
                  今の気持ちを保存する
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 追加項目の編集 */}
        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-light tracking-wide text-foreground">
              追加項目
            </CardTitle>
            <p className="text-sm font-light text-muted-foreground">
              スライダーの下に表示される追加項目を編集できます
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-light text-muted-foreground mb-4">
                  まだ項目がありません。下のボタンから追加してください。
                </p>
              </div>
            ) : (
              items
                .sort((a, b) => a.order - b.order)
                .map((item, index) => (
                  <Card key={item.id} className="border-border/50">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="size-4 text-muted-foreground" />
                          <span className="text-xs font-light text-muted-foreground">
                            項目 {index + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItem(item.id, 'up')}
                            disabled={index === 0}
                            className="h-8 px-2 font-light"
                          >
                            上へ
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItem(item.id, 'down')}
                            disabled={index === items.length - 1}
                            className="h-8 px-2 font-light"
                          >
                            下へ
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-8 px-2 text-destructive hover:text-destructive font-light"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`type-${item.id}`}>タイプ</Label>
                        <select
                          id={`type-${item.id}`}
                          value={item.type}
                          onChange={(e) => {
                            const newType = e.target.value as 'text' | 'select'
                            updateItem(item.id, {
                              type: newType,
                              options: newType === 'select' ? ['選択肢1', '選択肢2'] : undefined
                            })
                          }}
                          className="flex h-10 w-full rounded-xl border border-border/50 bg-background/80 px-3 py-2 text-sm font-light ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="text">テキスト</option>
                          <option value="select">チェックボックス</option>
                        </select>
                      </div>

                      {item.type === 'text' ? (
                        <div className="space-y-4">
                          <div className="flex flex-col gap-2">
                            <Label htmlFor={`title-${item.id}`}>タイトル</Label>
                            <Input
                              id={`title-${item.id}`}
                              value={item.title || ''}
                              onChange={(e) => updateItem(item.id, { title: e.target.value })}
                              placeholder="タイトルを入力してください（任意）"
                              className="font-light"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label htmlFor={`content-${item.id}`}>テキスト</Label>
                            <textarea
                              id={`content-${item.id}`}
                              value={item.content}
                              onChange={(e) => updateItem(item.id, { content: e.target.value })}
                              placeholder="テキストを入力してください"
                              rows={3}
                              className="flex min-h-[80px] w-full rounded-xl border border-border/50 bg-background/80 px-3 py-2 text-sm font-light ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-col gap-2">
                            <Label htmlFor={`content-${item.id}`}>
                              質問文 <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id={`content-${item.id}`}
                              value={item.content}
                              onChange={(e) => updateItem(item.id, { content: e.target.value })}
                              placeholder="例：参加希望の時間帯を選択してください"
                              className="font-light"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label>選択肢</Label>
                            <div className="space-y-2">
                              {item.options?.map((option, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => updateSelectOption(item.id, optIdx, e.target.value)}
                                    placeholder={`選択肢 ${optIdx + 1}`}
                                    className="font-light"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSelectOption(item.id, optIdx)}
                                    disabled={(item.options?.length || 0) <= 1}
                                    className="h-8 px-2 text-destructive hover:text-destructive font-light"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addSelectOption(item.id)}
                                className="gap-2 font-light"
                              >
                                <Plus className="size-4" />
                                選択肢を追加
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
            )}

            <div className="pt-4">
              {showBlockTypeMenu ? (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      addItem('text')
                      setShowBlockTypeMenu(false)
                    }}
                    className="gap-2 font-light w-full justify-start"
                  >
                    <Plus className="size-4" />
                    テキスト
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      addItem('select')
                      setShowBlockTypeMenu(false)
                    }}
                    className="gap-2 font-light w-full justify-start"
                  >
                    <Plus className="size-4" />
                    チェックボックス
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowBlockTypeMenu(false)}
                    className="gap-2 font-light w-full text-muted-foreground"
                  >
                    キャンセル
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowBlockTypeMenu(true)}
                  className="gap-2 font-light w-full"
                >
                  <Plus className="size-4" />
                  ブロックを選択
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
