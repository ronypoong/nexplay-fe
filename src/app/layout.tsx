import type { Metadata } from "next";
import { Header } from "@/components/header";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  // 절대 URL 기준점. 이게 없으면 OG 이미지와 canonical 이 상대경로로 나가 크롤러가 못 읽는다.
  metadataBase: new URL(SITE_URL),
  title: { default: "NEXPLAY — 다음 게임을 발견하는 곳", template: "%s · NEXPLAY" },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
    url: SITE_URL,
    title: "NEXPLAY — 다음 게임을 발견하는 곳",
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: "NEXPLAY — 다음 게임을 발견하는 곳", description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko" data-scroll-behavior="smooth"><body><Header/>{children}<footer className="site-footer"><div className="shell"><span className="footer-brand">NEX<span>PLAY</span></span><p>다음에 플레이할 게임을 발견하는 가장 빠른 방법.</p><span>© 2026 RUBI-ON</span></div></footer></body></html>;
}
