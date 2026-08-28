import type { Metadata } from "next";
import { api } from "@/lib/api";
export const dynamic = "force-dynamic";
import { DiscoverGrid } from "@/components/discover-grid";

export const metadata: Metadata = {
  title: "디스커버",
  description: "장르·플랫폼·게임 모드로 올해 신작과 기대작을 찾아봅니다. 한국어 지원 여부도 함께 표시합니다.",
  alternates: { canonical: "/discover" },
};

export default async function DiscoverPage() {
  const games = await api.games();
  return <main className="page-shell shell"><div className="page-hero"><span className="eyebrow">게임 탐색</span><h1>취향에 맞는 다음 게임</h1><p>2026년 신작을 중심으로 플랫폼과 장르를 좁혀 새로운 게임을 발견해보세요.</p></div><DiscoverGrid games={games}/></main>;
}
