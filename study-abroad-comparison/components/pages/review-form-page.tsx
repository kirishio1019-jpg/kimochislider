"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { universitiesByRegion, regions, type University } from "@/lib/universities"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface StrongFieldCategory {
  category: string
  fields: string[]
}

const strongFieldCategories: StrongFieldCategory[] = [
  {
    category: "Business & Economics",
    fields: [
      "Business",
      "International Business",
      "Marketing",
      "Management",
      "Economics",
      "Finance",
      "Entrepreneurship",
      "Innovation",
      "Tourism Studies",
    ],
  },
  {
    category: "Politics & Society",
    fields: [
      "International Relations",
      "Political Science",
      "Sociology",
      "Anthropology",
      "Development Studies",
    ],
  },
  {
    category: "Media & Communication",
    fields: [
      "Media Studies",
      "Journalism",
      "Public Relations",
      "Cultural Studies",
      "Communication",
      "Intercultural Communication",
    ],
  },
  {
    category: "Language & Education",
    fields: [
      "Linguistics",
      "Applied Linguistics",
      "TESOL",
      "English Education",
      "Translation",
      "Interpretation",
      "Comparative Education",
    ],
  },
  {
    category: "Environment & Sustainability",
    fields: [
      "Environmental Studies",
      "Sustainability",
      "CSR",
      "Global Health",
      "Public Policy",
    ],
  },
  {
    category: "Technology & Data",
    fields: [
      "Information Technology",
      "ICT",
      "Data Science",
      "Digital Media",
      "Innovation and Society",
    ],
  },
  {
    category: "Arts & Humanities",
    fields: [
      "History",
      "Philosophy",
      "Ethics",
      "Literature",
      "Art",
      "Performing Arts",
      "Area Studies (e.g., Asian, European, American)",
      "Liberal Arts",
    ],
  },
  {
    category: "Psychology & Human Behavior",
    fields: [
      "Psychology",
      "Cross-Cultural Psychology",
      "Human Development",
      "Social Behavior",
    ],
  },
]

const majorOptions = [
  "GB (グローバル・ビジネス)",
  "GS (グローバル・スタディーズ)",
  "GC (グローバル・コネクティビティ)",
]

const languageCertOptions = [
  "TOEFL iBT",
  "IELTS",
  "TOEIC",
  "CEFR",
  "その他",
]

const classLanguageOptions = [
  "英語",
  "現地語",
  "ミックス",
]

const costOfLivingOptions = [
  { label: "低い（月15万円以下）", value: "low" },
  { label: "平均的（月15～25万円）", value: "average" },
  { label: "高い（月25～35万円）", value: "high" },
  { label: "非常に高い（月35万円以上）", value: "very-high" },
]

interface FormData {
  major: string
  region: string
  country: string
  universityId: string
  studyMajor: string
  selectionReason: string
  strongFields: string[]
  startDate: string
  startSeason: string
  startYear: string
  endDate: string
  endSeason: string
  endYear: string
  vacationPeriod: string
  creditsEarned: string
  creditsTransferred: string
  credits300Level: string
  languageCert: string
  languageScore: string
  classLanguage: string
  costOfLiving: string
  costOfLivingNote: string
  foodCost: string
  rent: string
  culturalImpression: string
  safety: string
  climate: string
  dailyMeals: string
  accommodation: string
  extracurricularActivities: string
  extracurricularActivitiesNote: string
  title: string
  satisfaction: number
  positives: string
  challenges: string
  author: string
}

const initialFormData: FormData = {
  // 学業・専攻情報
  major: "",
  region: "",
  country: "",
  universityId: "",
  studyMajor: "",
  selectionReason: "",
  strongFields: [],

  // 留学期間
  startDate: "",
  startSeason: "",
  startYear: "",
  endDate: "",
  endSeason: "",
  endYear: "",
  vacationPeriod: "",

  // 学業成果
  creditsEarned: "",
  creditsTransferred: "",
  credits300Level: "",

  // 語学・コミュニケーション力
  languageCert: "",
  languageScore: "",
  classLanguage: "",

  // 生活・文化情報
  costOfLiving: "",
  costOfLivingNote: "",
  foodCost: "",
  rent: "",
  culturalImpression: "",
  safety: "",
  climate: "",
  dailyMeals: "",
  accommodation: "",
  extracurricularActivities: "",
  extracurricularActivitiesNote: "",

  // レビュー内容
  title: "",
  satisfaction: 5.0,
  positives: "",
  challenges: "",

  // 投稿者情報
  author: "",
}

interface ReviewFormPageProps {
  onPageChange?: (page: string) => void
  editReviewId?: number | null
}

export default function ReviewFormPage({ onPageChange, editReviewId }: ReviewFormPageProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isClient, setIsClient] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // ユーザー認証状態を確認
  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
        // ログインユーザーがいて、投稿者名が空の場合は、デフォルト値を設定
        if (user && !formData.author && !editReviewId) {
          const defaultAuthor = user.email?.split('@')[0] || user.user_metadata?.full_name || ""
          if (defaultAuthor) {
            setFormData(prev => ({ ...prev, author: defaultAuthor }))
          }
        }
      }).catch((error) => {
        console.error('Failed to get user:', error)
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        // ログインユーザーがいて、投稿者名が空の場合は、デフォルト値を設定
        if (session?.user && !formData.author && !editReviewId) {
          const defaultAuthor = session.user.email?.split('@')[0] || session.user.user_metadata?.full_name || ""
          if (defaultAuthor) {
            setFormData(prev => ({ ...prev, author: defaultAuthor }))
          }
        }
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error)
    }
  }, [])

  // 編集モード: 既存のレビューを読み込む（最優先で実行）
  useEffect(() => {
    if (!editReviewId) return
    
    console.log('Edit mode activated, editReviewId:', editReviewId)
    setIsClient(true)
    
    const savedReviews = localStorage.getItem('reviews')
    if (savedReviews) {
      try {
        const reviews = JSON.parse(savedReviews)
        console.log('All reviews:', reviews)
        const reviewToEdit = reviews.find((r: any) => r.id === editReviewId)
        console.log('Review to edit found:', reviewToEdit)
        
        if (reviewToEdit) {
          // 既存のレビューデータを準備（共通のデータオブジェクトを作成）
          const loadedData = {
              major: reviewToEdit.major || "",
              region: reviewToEdit.region || "",
              country: reviewToEdit.country || "",
              universityId: reviewToEdit.universityId || "",
              studyMajor: reviewToEdit.studyMajor || "",
              selectionReason: reviewToEdit.selectionReason || "",
              strongFields: reviewToEdit.strongFields || [],
              startDate: reviewToEdit.startDate || "",
              startSeason: (() => {
                if (reviewToEdit.startSeason) {
                  const seasonMatch = reviewToEdit.startSeason.match(/(Spring|Summer|Fall|Winter)$/)
                  return seasonMatch ? seasonMatch[1] : reviewToEdit.startSeason
                }
                return ""
              })(),
              startYear: reviewToEdit.startYear || (() => {
                if (reviewToEdit.startSeason) {
                  const yearMatch = reviewToEdit.startSeason.match(/(\d{4})年/)
                  return yearMatch ? yearMatch[1] : ""
                }
                return ""
              })(),
              endDate: reviewToEdit.endDate || "",
              endSeason: (() => {
                if (reviewToEdit.endSeason) {
                  const seasonMatch = reviewToEdit.endSeason.match(/(Spring|Summer|Fall|Winter)$/)
                  return seasonMatch ? seasonMatch[1] : reviewToEdit.endSeason
                }
                return ""
              })(),
              endYear: reviewToEdit.endYear || (() => {
                if (reviewToEdit.endSeason) {
                  const yearMatch = reviewToEdit.endSeason.match(/(\d{4})年/)
                  return yearMatch ? yearMatch[1] : ""
                }
                return ""
              })(),
              vacationPeriod: reviewToEdit.vacationPeriod || "",
              creditsEarned: reviewToEdit.creditsEarned?.toString() || "",
              creditsTransferred: reviewToEdit.creditsTransferred?.toString() || "",
              credits300Level: reviewToEdit.credits300Level?.toString() || "",
              languageCert: reviewToEdit.languageCert || "",
              languageScore: reviewToEdit.languageScore || "",
              classLanguage: reviewToEdit.classLanguage || "",
              costOfLiving: reviewToEdit.costOfLiving || "",
              costOfLivingNote: reviewToEdit.costOfLivingNote || "",
              foodCost: reviewToEdit.foodCost || "",
              rent: reviewToEdit.rent || "",
              culturalImpression: reviewToEdit.culturalImpression || "",
              safety: reviewToEdit.safety || "",
              climate: reviewToEdit.climate || "",
              dailyMeals: reviewToEdit.dailyMeals || "",
              accommodation: reviewToEdit.accommodation || "",
              extracurricularActivities: reviewToEdit.extracurricularActivities || "",
              extracurricularActivitiesNote: reviewToEdit.extracurricularActivitiesNote || "",
              title: reviewToEdit.title || "",
              satisfaction: reviewToEdit.satisfaction || 5.0,
              positives: reviewToEdit.positives || "",
              challenges: reviewToEdit.challenges || "",
              author: reviewToEdit.author || "",
          }
          
          // フォームデータを設定（初期値とマージして、すべてのフィールドを含める）
          setFormData({
            ...initialFormData,
            ...loadedData,
          })
          
          // 編集モードでは、読み込んだデータをlocalStorageに保存（リフレッシュ時も保持）
          localStorage.setItem('reviewFormData', JSON.stringify({
            ...initialFormData,
            ...loadedData,
          }))
          
          console.log('Form data loaded for editing:', loadedData)
        } else {
          console.warn('Review not found for editReviewId:', editReviewId)
        }
      } catch (e) {
        console.error('Failed to load review for editing:', e)
      }
    } else {
      console.warn('No reviews found in localStorage')
    }
  }, [editReviewId])

  // クライアントサイドでのみlocalStorageから復元
  useEffect(() => {
    // 編集モードの場合は処理をスキップ（既存レビューの読み込み処理で処理済み）
    if (editReviewId) {
      return
    }
    
    setIsClient(true)
    // 編集モードでない場合のみ、保存されたフォームデータを読み込む
    const saved = localStorage.getItem('reviewFormData')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFormData({
          ...initialFormData,
          ...parsed,
          satisfaction: parsed.satisfaction || 5.0,
          strongFields: parsed.strongFields || [],
          // 日付と季節のデータを保持（リフレッシュ時も維持）
          // 年だけでも保持されるように、空文字で上書きしない
          startDate: parsed.startDate !== undefined ? parsed.startDate : "",
          startSeason: parsed.startSeason !== undefined ? parsed.startSeason : "",
          startYear: parsed.startYear || "",
          endDate: parsed.endDate !== undefined ? parsed.endDate : "",
          endSeason: parsed.endSeason !== undefined ? parsed.endSeason : "",
          endYear: parsed.endYear || "",
        })
      } catch (e) {
        // パースエラー時は初期値を使用
      }
    }
  }, [editReviewId])

  // フォームデータをlocalStorageに保存
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('reviewFormData', JSON.stringify(formData))
    }
  }, [formData, isClient])

  // 地域ごとの国リスト
  const countriesByRegion = useMemo(() => {
    const result: Record<string, string[]> = {}
    for (const [region, universities] of Object.entries(universitiesByRegion)) {
      const countries = Array.from(new Set(universities.map((uni) => uni.country))).sort()
      result[region] = countries
    }
    return result
  }, [])

  // 選択された地域・国に基づく大学リスト
  const availableUniversities = useMemo(() => {
    if (!formData.region) return []
    const regionUnis = universitiesByRegion[formData.region] || []
    if (!formData.country) return regionUnis
    return regionUnis.filter((uni) => uni.country === formData.country)
  }, [formData.region, formData.country])

  // 選択された大学情報
  const selectedUniversity = useMemo(() => {
    if (!formData.universityId) return null
    return availableUniversities.find((uni) => uni.id === formData.universityId) || null
  }, [formData.universityId, availableUniversities])

  // 一時保存機能
  const handleSaveDraft = () => {
    if (!isClient) return
    
    // フォームデータをlocalStorageに保存
    localStorage.setItem('reviewFormData', JSON.stringify(formData))
    alert("レビューが一時保存されました。後で続きから編集できます。")
  }

  // 中止機能
  const handleCancel = () => {
    if (confirm("入力内容が失われますが、よろしいですか？")) {
      // フォームをリセット
      const emptyForm = {
        major: "",
        region: "",
        country: "",
        universityId: "",
        studyMajor: "",
        selectionReason: "",
        strongFields: [] as string[],
        startDate: "",
        startSeason: "",
        startYear: "",
        endDate: "",
        endSeason: "",
        endYear: "",
        vacationPeriod: "",
        creditsEarned: "",
        creditsTransferred: "",
        credits300Level: "",
        languageCert: "",
        languageScore: "",
        classLanguage: "",
        costOfLiving: "",
        costOfLivingNote: "",
        foodCost: "",
        rent: "",
        cost: "",
        culturalImpression: "",
        safety: "",
        climate: "",
        dailyMeals: "",
        accommodation: "",
        extracurricularActivities: "",
        extracurricularActivitiesNote: "",
        title: "",
        satisfaction: 5.0,
        positives: "",
        challenges: "",
        author: "",
      }
      setFormData(emptyForm)
      
      // localStorageもクリア
      if (isClient) {
        localStorage.removeItem('reviewFormData')
      }
      
      // ホームページに戻る
      if (onPageChange) {
        onPageChange("home")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // ログインチェック（環境変数が設定されている場合のみ）
    // 環境変数が設定されていない場合は、匿名で投稿可能
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
    
    if (isSupabaseConfigured && !user) {
      alert("レビューを投稿するには、Googleでログインしてください。")
      return
    }
    
    if (!selectedUniversity) {
      alert("大学を選択してください")
      return
    }

    // 編集モードの場合、ユーザーIDで作成者チェック
    if (editReviewId && isClient) {
      const savedReviews = localStorage.getItem('reviews')
      if (savedReviews) {
        const reviews = JSON.parse(savedReviews)
        const reviewToEdit = reviews.find((r: any) => r.id === editReviewId)
        
        if (reviewToEdit && reviewToEdit.userId && user && reviewToEdit.userId !== user.id) {
          alert("このレビューを編集できるのは作成者のみです。")
          return
        }
      }
    }

    // レビューを作成または更新
    const reviewData = {
      id: editReviewId || Date.now(), // 編集モードの場合は既存のIDを使用
      country: selectedUniversity.country,
      university: selectedUniversity.name,
      universityId: selectedUniversity.id,
      title: formData.title || "タイトルなし",
      satisfaction: formData.satisfaction,
      cost: 0, // 月額費用フィールドを削除したため0に設定
      language: formData.classLanguage || "",
      author: formData.author || user?.email?.split('@')[0] || user?.user_metadata?.full_name || "匿名",
      userId: user?.id || formData.author || 'anonymous', // ユーザーIDを保存（未設定の場合は匿名）
      date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
      excerpt: formData.positives || formData.challenges || "",
      strongFields: formData.strongFields || [],
      region: selectedUniversity.region,
      // 詳細情報
      major: formData.major,
      studyMajor: formData.studyMajor,
      selectionReason: formData.selectionReason,
          startDate: formData.startDate || (formData.startSeason && formData.startYear ? `${formData.startYear}年 ${formData.startSeason}` : formData.startSeason) || "",
          startYear: formData.startYear,
          endDate: formData.endDate || (formData.endSeason && formData.endYear ? `${formData.endYear}年 ${formData.endSeason}` : formData.endSeason) || "",
          endYear: formData.endYear,
          vacationPeriod: formData.vacationPeriod,
      creditsEarned: formData.creditsEarned,
      creditsTransferred: formData.creditsTransferred,
      credits300Level: formData.credits300Level,
      languageCert: formData.languageCert,
      languageScore: formData.languageScore,
      classLanguage: formData.classLanguage,
      costOfLiving: formData.costOfLiving,
      costOfLivingNote: formData.costOfLivingNote,
      foodCost: formData.foodCost,
      rent: formData.rent,
      culturalImpression: formData.culturalImpression,
      safety: formData.safety,
      climate: formData.climate,
      dailyMeals: formData.dailyMeals,
      accommodation: formData.accommodation,
      extracurricularActivities: formData.extracurricularActivities,
      extracurricularActivitiesNote: formData.extracurricularActivitiesNote,
      overallReview: "", // 総合レビューフィールドを削除したため空文字
      positives: formData.positives,
      challenges: formData.challenges,
    }

    // localStorageに保存または更新
    if (isClient) {
      const existingReviews = localStorage.getItem('reviews')
      const reviews = existingReviews ? JSON.parse(existingReviews) : []
      
      if (editReviewId) {
        // 編集モード: 既存のレビューを更新
        const reviewIndex = reviews.findIndex((r: any) => r.id === editReviewId)
        if (reviewIndex !== -1) {
          // 投稿日は変更せず、他の情報を更新
          reviewData.date = reviews[reviewIndex].date
          reviews[reviewIndex] = reviewData
          localStorage.setItem('reviews', JSON.stringify(reviews))
          alert("レビューを更新しました")
          
          // 編集完了後、レビュー詳細ページに戻る
          if (onPageChange) {
            window.dispatchEvent(new CustomEvent('pageChange', { detail: { page: 'detail' } }))
            window.dispatchEvent(new CustomEvent('reviewDetailClick', { detail: { reviewId: editReviewId } }))
            return
          }
        }
      } else {
        // 新規作成モード
        reviews.unshift(reviewData) // 最新を先頭に追加
        localStorage.setItem('reviews', JSON.stringify(reviews))
        
        // ユーザーIDで作成者情報を保存（編集権限管理用 - 後方互換性のため）
        const reviewCreators = localStorage.getItem('reviewCreators')
        const creators = reviewCreators ? JSON.parse(reviewCreators) : {}
        creators[reviewData.id] = reviewData.userId || reviewData.author
        localStorage.setItem('reviewCreators', JSON.stringify(creators))
      }
      
      // フォームデータをクリア
      localStorage.removeItem('reviewFormData')
      
      // カスタムイベントを発火して他のコンポーネントに通知
      window.dispatchEvent(new Event('reviewUpdated'))
    }

    // フォームをリセット
    const emptyForm = {
      major: "",
      region: "",
      country: "",
      universityId: "",
      studyMajor: "",
      selectionReason: "",
      strongFields: [] as string[],
          startDate: "",
          startSeason: "",
          startYear: "",
          endDate: "",
          endSeason: "",
          endYear: "",
          vacationPeriod: "",
      creditsEarned: "",
      creditsTransferred: "",
      credits300Level: "",
      languageCert: "",
      languageScore: "",
      classLanguage: "",
          costOfLiving: "",
          costOfLivingNote: "",
          foodCost: "",
          rent: "",
          cost: "",
      culturalImpression: "",
  safety: "",
  climate: "",
  dailyMeals: "",
  accommodation: "",
  extracurricularActivities: "",
  extracurricularActivitiesNote: "",
  title: "",
      satisfaction: 5.0,
      positives: "",
      challenges: "",
      author: "",
    }
    setFormData(emptyForm)
    
    // すぐにホームページに遷移
    if (onPageChange) {
      onPageChange("home")
    }
  }

  const toggleStrongField = useCallback((field: string) => {
    setFormData((prev) => ({
      ...prev,
      strongFields: prev.strongFields.includes(field)
        ? prev.strongFields.filter((f) => f !== field)
        : [...prev.strongFields, field],
    }))
  }, [])

  const handleRegionChange = useCallback((region: string) => {
    setFormData((prev) => ({
      ...prev,
      region,
      country: "",
      universityId: "",
    }))
  }, [])

  const handleCountryChange = useCallback((country: string) => {
    setFormData((prev) => ({
      ...prev,
      country,
      universityId: "",
    }))
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {editReviewId ? "留学レビューを編集" : "留学レビューを投稿"}
        </h1>
        <p className="text-muted-foreground mb-4">
          {editReviewId 
            ? "レビューの内容を編集できます。"
            : "あなたの留学経験を詳細に共有し、後輩たちをサポートしましょう"}
        </p>
        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">ログインが必要です</p>
                <p className="text-sm text-yellow-700 mt-1">レビューを投稿するには、Googleでログインしてください。</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {/* 0. 投稿者情報（最初に表示） */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">0</span>
            <h2 className="text-xl font-semibold text-foreground">投稿者情報</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              表示名 <span className="text-xs text-muted-foreground">（レビューに表示される名前）</span>
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              あなたの名前を入力してください。匿名で投稿することもできます。空欄の場合は、Googleアカウント名が表示されます。
            </p>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder={user?.email?.split('@')[0] || user?.user_metadata?.full_name || "匿名"}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {user && (
              <p className="text-xs text-muted-foreground mt-1">
                デフォルト: {user?.email?.split('@')[0] || user?.user_metadata?.full_name || "匿名"}
              </p>
            )}
          </div>
        </section>

        {/* 1. 学業・専攻情報 */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">1</span>
            <h2 className="text-xl font-semibold text-foreground">学業・専攻情報</h2>
          </div>

          {/* メジャー */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">メジャー</label>
            <select
              value={formData.major}
              onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">選択してください</option>
              {majorOptions.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>

          {/* 地域選択 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">地域</label>
            <select
              value={formData.region}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">地域を選択</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* 国選択 */}
          {formData.region && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">国</label>
              <select
                value={formData.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">国を選択</option>
                {countriesByRegion[formData.region]?.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 大学選択 */}
          {formData.country && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">留学先大学名</label>
              <select
                value={formData.universityId}
                onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">大学を選択</option>
                {availableUniversities.map((university) => (
                  <option key={university.id} value={university.id}>
                    {university.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 大学を選んだ理由 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">大学を選んだ理由</label>
            <textarea
              value={formData.selectionReason}
              onChange={(e) => setFormData({ ...formData, selectionReason: e.target.value })}
              placeholder="この大学を選んだ理由や決め手となった点を記入してください（任意）"
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>

          {/* 留学先での専攻 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">留学先での専攻</label>
            <input
              type="text"
              value={formData.studyMajor}
              onChange={(e) => setFormData({ ...formData, studyMajor: e.target.value })}
              placeholder="例：Computer Science"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>

          {/* 強い分野（カテゴリー別 - アコーディオン） */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              留学先大学の強い分野（複数選択可）
            </label>
            {formData.strongFields.length > 0 && (
              <div className="mb-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-xs font-medium text-foreground mb-2">選択中の分野 ({formData.strongFields.length}件):</p>
                <div className="flex flex-wrap gap-2">
                  {formData.strongFields.map((field) => (
                    <span
                      key={field}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full"
                    >
                      {field}
                      <button
                        type="button"
                        onClick={() => toggleStrongField(field)}
                        className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              {strongFieldCategories.map((category) => {
                const isExpanded = expandedCategory === category.category
                const categoryFieldsSelected = category.fields.filter((field) =>
                  formData.strongFields.includes(field)
                ).length
                
                return (
                  <div key={category.category} className="border border-border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedCategory(isExpanded ? null : category.category)}
                      className="w-full flex items-center justify-between p-4 bg-background hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">{category.category}</span>
                        {categoryFieldsSelected > 0 && (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {categoryFieldsSelected}
                          </span>
                        )}
                      </div>
                      <svg
                        className={`w-5 h-5 text-muted-foreground transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="p-4 border-t border-border bg-card">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {category.fields.map((field) => (
                            <label
                              key={field}
                              className="flex items-center gap-2 p-2 border border-border rounded cursor-pointer hover:bg-muted/50 transition-colors"
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
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">カテゴリーをクリックして分野を選択できます</p>
          </div>
        </section>

        {/* 2. 留学期間 */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">2</span>
            <h2 className="text-xl font-semibold text-foreground">留学期間</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">留学開始日（任意）</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value, startSeason: "" })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  required={false}
                />
              </div>
              {!formData.startDate && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">日付がわからない場合は季節を選択（任意）</label>
                    <select
                      value={formData.startSeason}
                      onChange={(e) => setFormData({ ...formData, startSeason: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                    >
                      <option value="">選択しない</option>
                      <option value="Spring">春（Spring）</option>
                      <option value="Summer">夏（Summer）</option>
                      <option value="Fall">秋（Fall）</option>
                      <option value="Winter">冬（Winter）</option>
                    </select>
                  </div>
                  {formData.startSeason && (
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">年（任意）</label>
                      <select
                        value={formData.startYear}
                        onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                      >
                        <option value="">選択しない</option>
                        {Array.from({ length: new Date().getFullYear() - 2005 + 10 }, (_, i) => {
                          const year = 2005 + i
                          return (
                            <option key={year} value={year.toString()}>
                              {year}年
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">留学終了日（任意）</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value, endSeason: "" })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  required={false}
                />
              </div>
              {!formData.endDate && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">日付がわからない場合は季節を選択（任意）</label>
                    <select
                      value={formData.endSeason}
                      onChange={(e) => setFormData({ ...formData, endSeason: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                    >
                      <option value="">選択しない</option>
                      <option value="Spring">春（Spring）</option>
                      <option value="Summer">夏（Summer）</option>
                      <option value="Fall">秋（Fall）</option>
                      <option value="Winter">冬（Winter）</option>
                    </select>
                  </div>
                  {formData.endSeason && (
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">年（任意）</label>
                      <select
                        value={formData.endYear}
                        onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                      >
                        <option value="">選択しない</option>
                        {Array.from({ length: new Date().getFullYear() - 2005 + 10 }, (_, i) => {
                          const year = 2005 + i
                          return (
                            <option key={year} value={year.toString()}>
                              {year}年
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">長期休暇の期間</label>
            <input
              type="text"
              value={formData.vacationPeriod}
              onChange={(e) => setFormData({ ...formData, vacationPeriod: e.target.value })}
              placeholder="例：Summer: 3ヶ月、Winter: 1ヶ月"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
        </section>

        {/* 3. 学業成果 */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">3</span>
            <h2 className="text-xl font-semibold text-foreground">学業成果</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">現地で取得した単位数</label>
              <input
                type="number"
                value={formData.creditsEarned}
                onChange={(e) => setFormData({ ...formData, creditsEarned: e.target.value })}
                placeholder="例：30"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">AIUへ持ち帰った単位数</label>
              <input
                type="number"
                value={formData.creditsTransferred}
                onChange={(e) => setFormData({ ...formData, creditsTransferred: e.target.value })}
                placeholder="例：28"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">持ち帰った300番台の単位数</label>
              <input
                type="number"
                value={formData.credits300Level}
                onChange={(e) => setFormData({ ...formData, credits300Level: e.target.value })}
                placeholder="例：12"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
              />
            </div>
          </div>
        </section>

        {/* 4. 語学・コミュニケーション力 */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">4</span>
            <h2 className="text-xl font-semibold text-foreground">語学・コミュニケーション力</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">語学資格（留学前）</label>
              <select
                value={formData.languageCert}
                onChange={(e) => setFormData({ ...formData, languageCert: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">選択してください</option>
                {languageCertOptions.map((cert) => (
                  <option key={cert} value={cert}>
                    {cert}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">スコア（留学前）</label>
              <input
                type="text"
                value={formData.languageScore}
                onChange={(e) => setFormData({ ...formData, languageScore: e.target.value })}
                placeholder="例：100"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">留学先での授業言語</label>
              <select
                value={formData.classLanguage}
                onChange={(e) => setFormData({ ...formData, classLanguage: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">選択してください</option>
                {classLanguageOptions.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 5. 生活・文化情報 */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">5</span>
            <h2 className="text-xl font-semibold text-foreground">生活・文化情報</h2>
          </div>

          {/* 費用関連 */}
          <div className="space-y-4 pb-6 border-b border-border/50">
            <h3 className="text-base font-semibold text-foreground mb-4">費用</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">物価レベル</label>
                <select
                  value={formData.costOfLiving}
                  onChange={(e) => setFormData({ ...formData, costOfLiving: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">選択してください</option>
                  {costOfLivingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">食費（月額）</label>
                <input
                  type="text"
                  value={formData.foodCost}
                  onChange={(e) => setFormData({ ...formData, foodCost: e.target.value })}
                  placeholder="例：500 AUD / 5万円"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">家賃（月額）</label>
                <input
                  type="text"
                  value={formData.rent}
                  onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                  placeholder="例：1200 AUD / 12万円"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">物価レベル補足（任意）</label>
              <textarea
                value={formData.costOfLivingNote}
                onChange={(e) => setFormData({ ...formData, costOfLivingNote: e.target.value })}
                placeholder="物価レベルについて補足があれば記入してください"
                rows={2}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
          </div>

          {/* 文化・環境関連 */}
          <div className="space-y-4 pb-6 border-b border-border/50">
            <h3 className="text-base font-semibold text-foreground mb-4">文化・環境</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">国民性の印象</label>
                <input
                  type="text"
                  value={formData.culturalImpression}
                  onChange={(e) => setFormData({ ...formData, culturalImpression: e.target.value })}
                  placeholder="例：Friendly, Relaxed, Punctual"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">治安</label>
                <textarea
                  value={formData.safety}
                  onChange={(e) => setFormData({ ...formData, safety: e.target.value })}
                  placeholder="治安について記入してください（任意）"
                  rows={2}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">気候</label>
                <textarea
                  value={formData.climate}
                  onChange={(e) => setFormData({ ...formData, climate: e.target.value })}
                  placeholder="気候について記入してください（任意）"
                  rows={2}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          {/* 日常生活関連 */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground mb-4">日常生活</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">日々の食事</label>
                <textarea
                  value={formData.dailyMeals}
                  onChange={(e) => setFormData({ ...formData, dailyMeals: e.target.value })}
                  placeholder="日々の食事について記入してください（任意）"
                  rows={2}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">住んでいた場所</label>
                <textarea
                  value={formData.accommodation}
                  onChange={(e) => setFormData({ ...formData, accommodation: e.target.value })}
                  placeholder="住んでいた場所について記入してください（任意）"
                  rows={2}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">課外活動</label>
                <input
                  type="text"
                  value={formData.extracurricularActivities}
                  onChange={(e) => setFormData({ ...formData, extracurricularActivities: e.target.value })}
                  placeholder="例：Music Club, Volunteer Work, Sports Team"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                />
                <textarea
                  value={formData.extracurricularActivitiesNote}
                  onChange={(e) => setFormData({ ...formData, extracurricularActivitiesNote: e.target.value })}
                  placeholder="課外活動について補足説明があれば記入してください（任意）"
                  rows={2}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mt-2"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 6. 総合レビュー */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">6</span>
            <h2 className="text-xl font-semibold text-foreground">総合レビュー</h2>
          </div>

          {/* レビューのタイトル */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">レビューのタイトル</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例：安定して勉強できる環境"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>

          {/* 満足度 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              満足度
            </label>
            <div className="space-y-4">
              {/* 星評価 */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFull = formData.satisfaction >= star
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, satisfaction: star as any })}
                      className="text-3xl focus:outline-none transition-transform hover:scale-110 relative"
                      title={`${star}点`}
                    >
                      {isFull ? "⭐" : "☆"}
                    </button>
                  )
                })}
                <span className="ml-2 text-lg font-semibold text-foreground">
                  {formData.satisfaction.toFixed(1)}/5
                </span>
              </div>
              
              {/* スライダー */}
              <div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={formData.satisfaction}
                  onChange={(e) => setFormData({ ...formData, satisfaction: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1.0</span>
                  <span>2.0</span>
                  <span>3.0</span>
                  <span>4.0</span>
                  <span>5.0</span>
                </div>
              </div>
              
              {/* 直接入力 */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  または数値を直接入力（1.0〜5.0）
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.satisfaction}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    if (!isNaN(value) && value >= 1 && value <= 5) {
                      setFormData({ ...formData, satisfaction: value })
                    }
                  }}
                  className="w-32 px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm"
                  placeholder="4.5"
                />
              </div>
            </div>
          </div>

          {/* 良かった点 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">良かった点</label>
            <p className="text-xs text-muted-foreground mb-2">この大学・国の良かった点を教えてください。</p>
            <textarea
              value={formData.positives}
              onChange={(e) => setFormData({ ...formData, positives: e.target.value })}
              placeholder="この大学・国の良かった点を教えてください..."
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>

          {/* 大変だった点 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">大変だった点</label>
            <p className="text-xs text-muted-foreground mb-2">困ったことや課題があれば教えてください。</p>
            <textarea
              value={formData.challenges}
              onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
              placeholder="困ったことや課題があれば教えてください..."
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>

        </section>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-4 pt-6">
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-muted/50 transition-colors font-medium"
            >
              中止する
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-6 py-2 border border-primary/30 rounded-lg text-primary hover:bg-primary/10 transition-colors font-medium"
            >
              一時保存
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium ml-auto"
            >
              {editReviewId ? "レビューを更新する" : "レビューを投稿する"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
