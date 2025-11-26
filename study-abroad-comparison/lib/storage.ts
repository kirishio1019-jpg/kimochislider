import { Question, Answer } from '@/types'

const STORAGE_KEY = 'study-abroad-questions'

export function getQuestions(): Question[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load questions from storage:', error)
  }
  
  // 初期データを返す
  return [
    {
      id: 1,
      author: "あおい",
      country: "オーストラリア",
      university: "シドニー大学",
      question: "奨学金は取得しやすいですか？",
      answers: [
        {
          id: 1,
          author: "先輩1",
          content: "私の経験では、留学生向けの奨学金制度がいくつかあります。大学のウェブサイトで詳しく確認することをお勧めします。",
          points: 50,
          date: "2025年1月13日"
        },
        {
          id: 2,
          author: "先輩2",
          content: "キャンパスの国際学生支援センターに問い合わせるのが一番確実です。スタッフが親切に対応してくれます。",
          points: 50,
          date: "2025年1月14日"
        }
      ],
      points: 100,
      date: "2025年1月12日",
    },
    {
      id: 2,
      author: "りょう",
      country: "カナダ",
      university: "トロント大学",
      question: "冬の過ごし方のコツを教えてください",
      answers: [
        {
          id: 1,
          author: "先輩1",
          content: "カナダの冬は本当に寒いです。防寒具は必須です。特に手袋とマフラーは忘れずに！",
          points: 40,
          date: "2025年1月9日"
        },
        {
          id: 2,
          author: "先輩2",
          content: "室内は暖房が効いているので、脱ぎ着しやすい服装がおすすめです。",
          points: 30,
          date: "2025年1月9日"
        },
        {
          id: 3,
          author: "先輩3",
          content: "冬のアクティビティも楽しめます。スキーやスケートなど、カナダならではの体験ができますよ！",
          points: 50,
          date: "2025年1月10日"
        }
      ],
      points: 120,
      date: "2025年1月8日",
    },
    {
      id: 3,
      author: "ひかり",
      country: "イギリス",
      university: "ロンドン大学",
      question: "アルバイトはできますか？",
      answers: [
        {
          id: 1,
          author: "先輩1",
          content: "学生ビザで週20時間までアルバイトが可能です。キャンパス内のカフェや図書館で働いている留学生が多いです。",
          points: 40,
          date: "2025年1月2日"
        },
        {
          id: 2,
          author: "先輩2",
          content: "オンラインでの仕事も選択肢の一つです。時間の融通が利くので、勉強との両立がしやすいです。",
          points: 30,
          date: "2025年1月3日"
        },
        {
          id: 3,
          author: "先輩3",
          content: "日本語を教える仕事も需要があります。時給も良いのでおすすめです。",
          points: 50,
          date: "2025年1月4日"
        }
      ],
      points: 120,
      date: "2025年1月1日",
    },
  ]
}

export function saveQuestions(questions: Question[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))
  } catch (error) {
    console.error('Failed to save questions to storage:', error)
  }
}

export function addQuestion(question: Omit<Question, 'id' | 'answers' | 'points' | 'date'>): Question {
  const questions = getQuestions()
  const newQuestion: Question = {
    ...question,
    id: Math.max(...questions.map(q => q.id), 0) + 1,
    answers: [],
    points: 0,
    date: new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const updatedQuestions = [newQuestion, ...questions]
  saveQuestions(updatedQuestions)
  return newQuestion
}

export function addAnswer(questionId: number, answer: Omit<Answer, 'id' | 'date'>): void {
  const questions = getQuestions()
  const questionIndex = questions.findIndex(q => q.id === questionId)
  
  if (questionIndex === -1) return
  
  const question = questions[questionIndex]
  const newAnswer: Answer = {
    ...answer,
    id: Math.max(...question.answers.map(a => a.id), 0) + 1,
    date: new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  question.answers.push(newAnswer)
  question.points += answer.points
  
  saveQuestions(questions)
}

