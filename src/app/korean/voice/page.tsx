import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { GAMES_PER_PAGE } from "@/lib/site";
import { GameIndexList, pageNumber } from "@/components/game-index-list";

export const dynamic = "force-dynamic";

/**
 * 한국어 음성까지 나오는 게임.
 *
 * 자막은 흔해졌지만 더빙은 여전히 드물어서, 찾는 사람은 분명한데 정리된 곳이
 * 없다. 좁은 목록이라 오히려 이길 수 있는 자리다.
 */
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const page = pageNumber((await searchParams).page);
  const suffix = page > 1 ? ` (${page}쪽)` : "";
  return {
    title: `한국어 음성 지원 게임${suffix}`,
    description: `자막이 아니라 한국어 음성까지 나오는 게임을 모았습니다. 한국어 더빙으로 즐길 수 있는 작품을 출시일 순으로 봅니다.${suffix}`,
    alternates: { canonical: page > 1 ? `/korean/voice?page=${page}` : "/korean/voice" },
  };
}

export default async function KoreanVoicePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = pageNumber((await searchParams).page);
  if (!page) notFound();
  const games = await api.games();
  const voiced = games
    .filter((game) => game.koreanAudioSupported === true)
    .sort((a, b) => (b.releaseDate || "").localeCompare(a.releaseDate || ""));
  const totalPages = Math.max(1, Math.ceil(voiced.length / GAMES_PER_PAGE));
  if (page > totalPages) notFound();

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">한국어 음성</span>
      <h1>한국어 더빙으로 즐기는 게임</h1>
      <p>
        자막을 넘어 음성까지 한국어로 나오는 {voiced.length}개입니다.
        {" "}자막까지 포함한 전체는 <Link href="/korean/games">한국어 지원 게임 목록</Link>에 있습니다.
      </p>
    </div>

    <GameIndexList
      games={voiced.slice((page - 1) * GAMES_PER_PAGE, page * GAMES_PER_PAGE)}
      page={page}
      totalPages={totalPages}
      start={(page - 1) * GAMES_PER_PAGE + 1}
      hrefFor={(target) => (target > 1 ? `/korean/voice?page=${target}` : "/korean/voice")}
    />
  </main>;
}
