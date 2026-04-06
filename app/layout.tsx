import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "주식 정보 자동 수집 AI",
  description: "관심 종목의 뉴스를 자동으로 수집하고 AI가 요약해드립니다.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
