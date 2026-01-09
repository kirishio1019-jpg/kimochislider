"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { generateSlug, generateToken } from "@/lib/utils"

export default function CreateEventPage() {
  const router = useRouter()
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
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        // Navigate to success page with URLs
        router.push(`/admin/new/success?eventId=${result.data.id}&adminToken=${result.data.admin_token}&slug=${result.data.slug}`)
      } else {
        alert('エラー: ' + result.error)
      }
    } catch (error) {
      alert('エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-light tracking-wide">新しいイベントを作成</CardTitle>
            <CardDescription className="font-light">参加者の「未確定の気持ち」を集めるイベントページを作成します</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
                  概要（短く） <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="description"
                  required
                  value={formData.description_short}
                  onChange={(e) => setFormData({ ...formData, description_short: e.target.value })}
                  placeholder="イベントの詳細な説明を自由に記入してください"
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
                  placeholder="例: 田中太郎"
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

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "作成中..." : "イベントを作成"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
