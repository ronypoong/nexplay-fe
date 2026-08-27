import type { Metadata } from "next";
import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = { title: { default: "NEXPLAY — 다음 게임을 발견하는 곳", template: "%s · NEXPLAY" }, description: "새로 공개된 게임, 트레일러, 출시일과 주요 업데이트를 한곳에서 발견하세요." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko" data-scroll-behavior="smooth"><body><Header/>{children}<footer className="site-footer"><div className="shell"><span className="footer-brand">NEX<span>PLAY</span></span><p>다음에 플레이할 게임을 발견하는 가장 빠른 방법.</p><span>© 2026 RUBI-ON</span></div></footer></body></html>;
}
