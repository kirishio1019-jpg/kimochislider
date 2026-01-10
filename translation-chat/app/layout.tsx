import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Translation Chat - リアルタイム自動翻訳メッセージアプリ",
  description: "異なる母語同士でも翻訳を意識せず会話できるメッセージアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

