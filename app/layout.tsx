import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "第三回 喜怒哀楽全開マルシェ｜2026年11月29日",
  description: "あなたの『好き』、ちゃんと生きてる？ 好き・熱・未完成の自己表現を持ち寄る、第三回 喜怒哀楽全開マルシェ。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
}

