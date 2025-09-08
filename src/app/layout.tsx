import "@/styles/globals.css";
import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/autoplay";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Nanum_Gothic } from "next/font/google";
import localFont from "next/font/local";

import { QueryProvider } from "@/shared/providers";
import AuthProvider from "@/shared/providers/auth-provider";
import { ChatProvider } from "@/shared/providers/chat-provider";
import NextAuthSessionProvider from "@/shared/providers/session-provider";

// SEO를 위한 기본 메타데이터 객체
export const metadata: Metadata = {
  title: {
    template: "%s | ArtChive", // 페이지별 제목이 %s 위치에 들어갑니다.
    default: "ArtChive - 문화와 지식을 잇는 아카이브", // 기본 제목
  },
  description:
    "공연, 전시 정보부터 중고 서적 거래까지. ArtChive에서 당신의 문화적 경험과 지식의 선순환을 만들어보세요.",
  keywords: ["중고서적", "공연", "전시", "문화예술", "책거래", "채팅"],
  openGraph: {
    title: "ArtChive - 문화와 지식을 잇는 아카이브",
    description:
      "다양한 문화 예술 정보를 탐색하고, 중고 서적을 거래하며 지식의 가치를 발견하는 공간입니다.",
    url: "http://artchive-front-dun.vercel.app", // 실제 서비스 URL
    siteName: "ArtChive",
    images: [
      {
        url: "/imgs/artchive.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArtChive - 문화와 지식을 잇는 아카이브",
    description:
      "공연, 전시, 중고 서적 거래를 한 곳에서. 당신의 문화 생활을 업그레이드하세요.",
    images: ["/imgs/artchive.png"], // 트위터 카드 이미지 경로
  },
};

const nanum_gothic = Nanum_Gothic({
  weight: ["400", "700", "800"],
  variable: "--font-nanum-gothic",
  display: "swap",
  preload: false,
});

const pretendard = localFont({
  src: "../../public/fonts/pretendard/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  preload: false,
});

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${nanum_gothic.variable}`}
    >
      <body style={{ fontFamily: "var(--font-pretendard)" }}>
        <NextAuthSessionProvider>
          <AuthProvider>
            <QueryProvider>
              <ChatProvider>{children}</ChatProvider>
            </QueryProvider>
          </AuthProvider>
        </NextAuthSessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
