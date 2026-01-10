export interface Question {
  id: number
  author: string
  country: string
  university: string
  question: string
  answers: Answer[]
  points: number
  date: string
}

export interface Answer {
  id: number
  author: string
  content: string
  points: number
  date: string
}















