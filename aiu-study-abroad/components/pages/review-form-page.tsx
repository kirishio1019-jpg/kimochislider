"use client"

import { useState } from "react"

export default function ReviewFormPage() {
  const [formData, setFormData] = useState({
    country: "",
    university: "",
    title: "",
    satisfaction: 5,
    cost: "",
    language: "",
    languageLevel: "",
    author: "",
    excerpt: "",
    strongFields: [] as string[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("レビューが投稿されました！")
    // フォームをリセット
    setFormData({
      country: "",
      university: "",
      title: "",
      satisfaction: 5,
      cost: "",
      language: "",
      languageLevel: "",
      author: "",
      excerpt: "",
      strongFields: [],
    })
  }

  const toggleStrongField = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      strongFields: prev.strongFields.includes(field)
        ? prev.strongFields.filter((f) => f !== field)
        : [...prev.strongFields, field],
    }))
  }

  const strongFieldOptions = [
    "Business Administration",
    "Communication & Media",
    "Technology & Engineering",
    "International Relations",
    "Sustainability & Environment",
    "Law",
    "Arts & Humanities",
    "Economics",
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">レビューを投稿</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 基本情報 */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">基本情報</h2>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">国 <span className="text-destructive">*</span></label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="例：オーストラリア"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">大学名 <span className="text-destructive">*</span></label>
            <input
              type="text"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              placeholder="例：シドニー大学"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">タイトル <span className="text-destructive">*</span></label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例：安定して勉強できる環境"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">満足度 <span className="text-destructive">*</span></label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, satisfaction: star })}
                  className="text-3xl focus:outline-none"
                >
                  {star <= formData.satisfaction ? "⭐" : "☆"}
                </button>
              ))}
              <span className="ml-2 text-foreground">{formData.satisfaction}/5</span>
            </div>
          </div>
        </section>

        {/* 費用と語学 */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">費用と語学</h2>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">月額費用（円）</label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              placeholder="例：350000"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">語学</label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                placeholder="例：英語"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">語学レベル</label>
              <select
                value={formData.languageLevel}
                onChange={(e) => setFormData({ ...formData, languageLevel: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">選択してください</option>
                <option value="初級">初級</option>
                <option value="中級">中級</option>
                <option value="中上級">中上級</option>
                <option value="上級">上級</option>
              </select>
            </div>
          </div>
        </section>

        {/* 強い分野 */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">大学の強い分野（複数選択可）</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {strongFieldOptions.map((field) => (
              <label
                key={field}
                className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={formData.strongFields.includes(field)}
                  onChange={() => toggleStrongField(field)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-foreground">{field}</span>
              </label>
            ))}
          </div>
        </section>

        {/* レビュー本文 */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">レビュー本文 <span className="text-destructive">*</span></h2>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="あなたの留学体験を詳しく書いてください..."
            rows={8}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            required
          />
        </section>

        {/* 投稿者情報 */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">投稿者情報</h2>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            placeholder="お名前（匿名可）"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
          />
        </section>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              if (confirm("入力内容が失われますが、よろしいですか？")) {
                setFormData({
                  country: "",
                  university: "",
                  title: "",
                  satisfaction: 5,
                  cost: "",
                  language: "",
                  languageLevel: "",
                  author: "",
                  excerpt: "",
                  strongFields: [],
                })
              }
            }}
            className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-muted/50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            レビューを投稿
          </button>
        </div>
      </form>
    </div>
  )
}



