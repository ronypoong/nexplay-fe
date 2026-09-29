import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { GAMES_PER_PAGE } from "@/lib/site";
import { GameIndexList, pageNumber } from "@/components/game-index-list";

export const dynamic = "force-dynamic";

/**
 * 한 해에 나오는 게임 전부.
 *
 * 달력(/releases/{year}/{month})은 이번 달부터 여섯 달까지만 연다. 그래서
 * "2026년 출시 게임" 처럼 해 단위로 찾는 사람이 닿을 곳이 없었고, /releases 는
 * 아예 404 였다.
 *
 * 날짜 오름차순이다. 해를 통째로 보는 화면이라 1월부터 훑는 편이 자연스럽다.
 */
function gamesOfYear(games: Awaited<ReturnType<typeof api.games>>, year: string) {
  return games
    .filter((game) => (game.releaseDate || "").slice(0, 4) === year)
    .sort((a, b) => (a.releaseDate || "").localeCompare(b.releaseDate || ""));
}

export async function generateMetadata({ params, searchParams }: {
  params: Promise<{ year: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  const page = pageNumber((await searchParams).page);
  const suffix = page > 1 ? ` (${page}쪽)` : "";
  return {
    title: `${year}년 출시 게임${suffix}`,
    description: `${year}년에 나오는 게임을 출시일 순으로 모았습니다. 플랫폼과 한국어 지원 여부, 일정 변경까지 함께 봅니다.${suffix}`,
    alternates: { canonical: page > 1 ? `/releases/${year}?page=${page}` : `/releases/${year}` },
  };
}

export default async function ReleaseYearPage({ params, searchParams }: {
  params: Promise<{ year: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { year } = await params;
  const page = pageNumber((await searchParams).page);
  // 네 자리 해만 받는다. /releases/abc 가 빈 목록으로 열리면 색인에 빈 페이지가 남는다.
  if (!page || !/^\d{4}$/.test(year)) notFound();
  const games = await api.games();
  const rows = gamesOfYear(games, year);
  if (rows.length === 0) notFound();
  const totalPages = Math.max(1, Math.ceil(rows.length / GAMES_PER_PAGE));
  if (page > totalPages) notFound();
  const korean = rows.filter((game) => game.koreanTextSupported === true).length;
  // 이웃 해는 실제로 게임이 있는 해만 건다. 없는 해로 걸면 내부 링크가 404 가 되고,
  // 크롤러는 그걸 사이트 품질로 읽는다.
  const yearNumber = Number(year);
  const neighbours = [yearNumber - 1, yearNumber + 1]
    .filter((target) => gamesOfYear(games, String(target)).length > 0);
  // 달력은 이번 달부터 여섯 달까지만 연다. 그 밖의 해로 걸면 역시 404 다.
  const seoulMonth = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit" }).format(new Date());
  const calendarHref = seoulMonth.startsWith(year) ? `/releases/${seoulMonth.replace("-", "/")}` : null;

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">{year}년 출시</span>
      <h1>{year}년에 나오는 게임</h1>
      <p>
        {rows.length.toLocaleString("ko-KR")}개를 출시일 순으로 모았습니다. 그중 {korean}개는 <Link href="/korean/games">한국어 지원</Link>이 확인됐습니다.
        {calendarHref && <> 달 단위로 보려면 <Link href={calendarHref}>출시 캘린더</Link>를 쓰세요.</>}
      </p>
    </div>

    <GameIndexList
      games={rows.slice((page - 1) * GAMES_PER_PAGE, page * GAMES_PER_PAGE)}
      page={page}
      totalPages={totalPages}
      start={(page - 1) * GAMES_PER_PAGE + 1}
      hrefFor={(target) => (target > 1 ? `/releases/${year}?page=${target}` : `/releases/${year}`)}
    />

    {neighbours.length > 0 && <nav className="year-hops" aria-label="다른 해">
      {neighbours.map((target) => <Link key={target} href={`/releases/${target}`}>{target}년 출시 게임</Link>)}
    </nav>}
  </main>;
}
