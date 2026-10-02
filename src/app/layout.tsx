import type { Metadata } from "next";
import { Header } from "@/components/header";
import { NAVER_SITE_VERIFICATION, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";
import { ArchiveStatus } from "@/components/archive-status";
import Link from "next/link";

export const metadata: Metadata = {
  // 절대 URL 기준점. 이게 없으면 OG 이미지와 canonical 이 상대경로로 나가 크롤러가 못 읽는다.
  metadataBase: new URL(SITE_URL),
  title: { default: "NEXPLAY — 다음 게임을 발견하는 곳", template: "%s · NEXPLAY" },
  description: SITE_DESCRIPTION,
  // 피드 리더가 주소만 넣어도 구독할 수 있게 머리에 걸어 둔다. 링크로만 두면
  // 푸터까지 내려가 본 사람만 찾는다.
  alternates: { canonical: "/", types: { "application/rss+xml": [{ url: "/feed.xml", title: `${SITE_NAME} — 공식 소식` }] } },
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
  // 네이버는 구글과 별도로 소유확인을 요구한다. 값이 없으면 태그를 내지 않는다.
  ...(NAVER_SITE_VERIFICATION
    ? { verification: { other: { "naver-site-verification": NAVER_SITE_VERIFICATION } } }
    : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // 저장된 테마를 React 가 붙기 전에 적용한다. 이게 없으면 첫 프레임에
  // 반대 테마가 번쩍이고 나서 바뀐다.
  const themeBootstrap = `try{var t=localStorage.getItem("nexplay-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;
  return <html lang="ko" data-scroll-behavior="smooth" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }}/></head>
    <body><Header/>{children}<footer className="site-footer"><div className="shell"><span className="footer-brand">NEX<span>PLAY</span></span><p>다음에 플레이할 게임을 발견하는 가장 빠른 방법.</p><ArchiveStatus/>{/* 전체 목록은 모든 화면에서 한 번에 닿아야 한다. 사이드바는 이미 길어서 여기 둔다. */}<nav className="footer-legal" aria-label="사이트 링크"><Link href="/games">게임 전체 목록</Link><Link href="/korean/games">한국어 지원 게임</Link><Link href="/companies">개발사 · 퍼블리셔</Link><Link href="/accessibility">접근성</Link><a href="/feed.xml">RSS</a><Link href="/terms">이용약관</Link><Link href="/privacy">개인정보처리방침</Link></nav><span>© 2026 RUBI-ON</span></div></footer></body>
  </html>;
}
