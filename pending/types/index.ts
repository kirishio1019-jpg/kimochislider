export interface Event {
  id: string
  slug: string
  title: string
  description_short: string | null
  start_at: string
  end_at: string | null
  location_text: string | null
  location_type: 'online' | 'offline'
  fee_text: string | null
  organizer_name: string | null
  additional_info: string | null
  public_page_content: string | null
  admin_token: string
  created_at: string
  updated_at: string
}

export interface Response {
  id: string
  event_id: string
  score: number
  x_value: number | null
  y_value: number | null
  email: string | null
  edit_token: string
  created_at: string
  updated_at: string
}

export interface EventWithStats extends Event {
  response_count: number
  average_score: number
  category_distribution: {
    category: string
    count: number
  }[]
}

export type ScoreCategory = {
  label: string
  min: number
  max: number
}

export const SCORE_CATEGORIES: ScoreCategory[] = [
  { label: "今は行かなそう", min: 0, max: 20 },
  { label: "ちょっと迷う", min: 21, max: 40 },
  { label: "半々", min: 41, max: 60 },
  { label: "行きたい寄り", min: 61, max: 80 },
  { label: "かなり行きたい", min: 81, max: 100 },
]

export function getScoreCategory(score: number): string {
  const category = SCORE_CATEGORIES.find((cat) => score >= cat.min && score <= cat.max)
  return category?.label || "半々"
}
