import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { GAMES_PER_PAGE } from "@/lib/site";
import { GameIndexList, pageNumber } from "@/components/game-index-list";

export const dynamic = "force-dynamic";

/**
 * 한국어 지원이 확인된 게임 목록.
 *
 * "한글 지원 게임" 은 이 사이트가 실제로 답할 수 있는 몇 안 되는 질문이다.
 * 스팀 소개문을 옮겨 적은 화면으로는 스팀을 이길 수 없지만, 언어 지원을
 * 카탈로그 전체에 대해 모아 둔 목록은 스팀에도 국내 매체에도 없다.
 *
 * /korean 은 퍼블리셔별 비율을 보는 화면이라 "그래서 뭐가 되는데" 에는
 * 답하지 않았다. 그 답을 여기에 둔다.
 *
 * 출시일 내림차순이다. 이름순이면 10년 전 게임이 맨 앞에 선다.
 */
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const page = pageNumber((await searchParams).page);
  const suffix = page > 1 ? ` (${page}쪽)` : "";
  return {
    title: `한국어 지원 게임 목록${suffix}`,
    description: `한국어 자막이나 음성이 확인된 게임을 출시일 순으로 모았습니다. 음성까지 지원하는지, 어느 플랫폼으로 나오는지 함께 봅니다.${suffix}`,
    alternates: { canonical: page > 1 ? `/korean/games?page=${page}` : "/korean/games" },
  };
}

export default async function KoreanGamesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = pageNumber((await searchParams).page);
  if (!page) notFound();
  const games = await api.games();
  const supported = games
    .filter((game) => game.koreanTextSupported === true)
    .sort((a, b) => (b.releaseDate || "").localeCompare(a.releaseDate || ""));
  const totalPages = Math.max(1, Math.ceil(supported.length / GAMES_PER_PAGE));
  if (page > totalPages) notFound();
  const fullVoice = supported.filter((game) => game.koreanAudioSupported === true).length;

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">한국어 지원</span>
      <h1>한국어로 즐길 수 있는 게임</h1>
      <p>
        한국어 자막이 확인된 {supported.length.toLocaleString("ko-KR")}개입니다. 그중 {fullVoice}개는 음성까지 나옵니다.
        {" "}퍼블리셔별로 누가 한국어를 잘 챙기는지는 <Link href="/korean">한국어 레이더</Link>에서 봅니다.
      </p>
    </div>

    <GameIndexList
      games={supported.slice((page - 1) * GAMES_PER_PAGE, page * GAMES_PER_PAGE)}
      page={page}
      totalPages={totalPages}
      start={(page - 1) * GAMES_PER_PAGE + 1}
      hrefFor={(target) => (target > 1 ? `/korean/games?page=${target}` : "/korean/games")}
    />
  </main>;
}
