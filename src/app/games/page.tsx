import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { GAMES_PER_PAGE } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * 게임 전체 목록.
 *
 * /discover 는 필터가 좋지만 "더 보기" 가 button 이라 href 가 없다. 크롤러는
 * 그 버튼을 누르지 못하므로 2,337개 중 36개까지만 보고 돌아섰다. 나머지로 가는
 * 길은 회사 상세뿐이었고, 그것도 회사마다 15개씩만 건다.
 *
 * 그래서 사람이 쓰는 화면과 별개로, 쪽마다 진짜 링크가 있는 목록을 둔다.
 * 이름순으로 고정해 같은 쪽이 늘 같은 구간을 보여주게 한다 — 쪽마다 내용이
 * 흔들리면 크롤러가 같은 URL 을 다시 올 이유를 찾지 못한다.
 */
function pageNumber(raw?: string) {
  const value = Number(raw ?? 1);
  return Number.isInteger(value) && value >= 1 ? value : 0;
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const page = pageNumber((await searchParams).page);
  const suffix = page > 1 ? ` (${page}쪽)` : "";
  return {
    title: `게임 전체 목록${suffix}`,
    description: `NEXPLAY 가 추적하는 게임을 이름순으로 모아 봅니다. 출시일, 플랫폼, 한국어 지원 여부를 한 줄로 확인하세요.${suffix}`,
    // 1쪽은 쿼리 없는 주소가 정본이다. ?page=1 로 들어와도 /games 하나로 모은다.
    alternates: { canonical: page > 1 ? `/games?page=${page}` : "/games" },
  };
}

export default async function GameIndexPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = pageNumber((await searchParams).page);
  if (!page) notFound();
  const games = await api.games();
  const sorted = [...games].sort((a, b) => a.title.localeCompare(b.title, "ko"));
  const totalPages = Math.max(1, Math.ceil(sorted.length / GAMES_PER_PAGE));
  if (page > totalPages) notFound();
  const rows = sorted.slice((page - 1) * GAMES_PER_PAGE, page * GAMES_PER_PAGE);
  const href = (target: number) => (target > 1 ? `/games?page=${target}` : "/games");
  // 첫 쪽·끝 쪽과 지금 쪽 둘레만 세운다. 20쪽을 다 세우면 어느 쪽에 있든
  // 링크 줄이 화면 한 칸을 먹는다.
  const near = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((target) => target === 1 || target === totalPages || Math.abs(target - page) <= 2);

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">게임 전체 목록</span>
      <h1>NEXPLAY 가 보고 있는 게임</h1>
      <p>{sorted.length.toLocaleString("ko-KR")}개를 이름순으로 모았습니다. 조건을 좁혀 찾으려면 <Link href="/discover">게임 탐색</Link>을 쓰세요.</p>
    </div>

    <ol className="game-index" start={(page - 1) * GAMES_PER_PAGE + 1}>
      {rows.map((game) => <li key={game.id}>
        <Link href={`/games/${game.slug}`}>
          <strong>{game.title}</strong>
          <small>
            {game.developer || "개발사 미상"} · {game.releaseLabel || game.releaseDate} · {game.platforms.join(" · ") || "플랫폼 미정"}
            {game.koreanTextSupported === true ? " · 한국어" : ""}
          </small>
        </Link>
      </li>)}
    </ol>

    <nav className="index-pager" aria-label="목록 쪽 이동">
      {page > 1 ? <Link className="secondary-button" href={href(page - 1)} rel="prev">이전</Link> : <span/>}
      <span className="index-pages">
        {near.map((target, index) => <span key={target}>
          {index > 0 && near[index - 1] !== target - 1 && <i aria-hidden="true">…</i>}
          {target === page
            ? <b aria-current="page">{target}</b>
            : <Link href={href(target)}>{target}</Link>}
        </span>)}
      </span>
      {page < totalPages ? <Link className="secondary-button" href={href(page + 1)} rel="next">다음</Link> : <span/>}
    </nav>
  </main>;
}
