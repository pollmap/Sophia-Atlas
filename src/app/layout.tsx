import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Sophia Atlas - 인류 사상의 지도",
  description:
    "인류의 위대한 사상과 지혜를 탐험하는 인터랙티브 플랫폼. 철학, 신화, 종교의 연결고리를 시각적으로 발견하고, 시대와 문화를 넘나드는 사상의 흐름을 이해하세요.",
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
    title: "Sophia Atlas - 인류 사상의 지도",
    description:
      "철학, 신화, 종교의 연결고리를 시각적으로 발견하는 인터랙티브 플랫폼",
    type: "website",
    locale: "ko_KR",
    siteName: "Sophia Atlas",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sophia Atlas - 인류 사상의 지도",
    description:
      "철학, 신화, 종교의 연결고리를 시각적으로 발견하는 인터랙티브 플랫폼",
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
    <html lang="ko" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/Sophia-Atlas/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0F172A" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <Header />
        <main className="flex-1 page-enter">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
