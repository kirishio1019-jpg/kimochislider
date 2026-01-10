import type React from "react"

import type { Metadata } from "next"

import { Noto_Serif_JP, Geist_Mono } from "next/font/google"

import { Analytics } from "@vercel/analytics/next"

import "./globals.css"

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-serif",
})

const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "桐越至恩 | トビタテ！留学JAPAN 第17期",
  description: "オーストラリアにおける「サードプレイス・モザイク」の社会学的考察と日本地方への応用可能性",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSerifJP.variable} font-serif antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

