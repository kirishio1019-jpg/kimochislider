import type { Metadata } from "next"
import { Noto_Serif_JP, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["200", "300", "400"],
  variable: "--font-serif",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "きもちスライダー - イベントへの「参加したい度」を可視化するスライダー生成アプリ",
  description: "イベントへの「参加したい度」を可視化するスライダー生成アプリ。参加確定を求めず、直感的なスライダーで「今の気持ち」を安全に入力できます",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body 
        className={`${notoSerifJP.variable} ${inter.variable} font-serif antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}
