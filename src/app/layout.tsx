import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Sophia Atlas — 인류 지성의 인드라망",
  description:
    "신화에서 AI까지, 인류 지성의 그물을 시각화하는 인터랙티브 플랫폼. 철학·종교·과학·역사·문화 — 모든 사상의 연결을 탐험하세요.",
  keywords: [
    "철학",
    "신화",
    "종교",
    "사상",
    "인문학",
    "소크라테스",
    "플라톤",
    "그리스 신화",
    "동양 철학",
    "서양 철학",
    "philosophy",
    "mythology",
    "Sophia Atlas",
  ],
  authors: [{ name: "Sophia Atlas" }],
  openGraph: {
    title: "Sophia Atlas — 인류 지성의 인드라망",
    description:
      "신화에서 AI까지, 인류 지성의 그물을 시각화하는 인터랙티브 플랫폼",
    type: "website",
    locale: "ko_KR",
    siteName: "Sophia Atlas",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sophia Atlas — 인류 지성의 인드라망",
    description:
      "신화에서 AI까지, 인류 지성의 그물을 시각화하는 인터랙티브 플랫폼",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#FAF6E9" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1 page-enter">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
