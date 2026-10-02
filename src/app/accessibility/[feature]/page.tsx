import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { GAMES_PER_PAGE } from "@/lib/site";
import { pageNumber } from "@/components/game-index-list";
import { ACCESSIBILITY_NOTES, featureForSlug } from "@/lib/accessibility";

export const dynamic = "force-dynamic";

/**
 * 기능 하나로 추린 게임.
 *
 * 목록 모양은 전체 목록(/games)과 같지만 GameIndexList 를 쓰지 않는다. 그쪽은
 * GameCard 를 받는데 여기 오는 줄에는 플랫폼도 장르도 없고 대신 그 게임이 가진
 * 접근성 기능이 붙는다. 억지로 한 컴포넌트에 밀어 넣으면 둘 다 지저분해진다.
 */
async function load(featureSlug: string, page: number) {
  const feature = featureForSlug(featureSlug);
  if (!feature || !page) notFound();
  const { games } = await api.accessibility();
  const rows = games.filter((game) => game.features.includes(feature));
  if (rows.length === 0) notFound();
  const totalPages = Math.max(1, Math.ceil(rows.length / GAMES_PER_PAGE));
  if (page > totalPages) notFound();
  return { feature, rows, totalPages };
}

export async function generateMetadata({ params, searchParams }: {
  params: Promise<{ feature: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { feature: featureSlug } = await params;
  const page = pageNumber((await searchParams).page);
  const { feature, rows } = await load(featureSlug, page);
  const suffix = page > 1 ? ` (${page}쪽)` : "";
  return {
    title: `${feature} 되는 게임${suffix}`,
    description: `${ACCESSIBILITY_NOTES[feature] ?? ""} Steam 스토어에서 확인한 ${rows.length}편을 모았습니다.${suffix}`.trim(),
    alternates: { canonical: page > 1 ? `/accessibility/${featureSlug}?page=${page}` : `/accessibility/${featureSlug}` },
  };
}

export default async function AccessibilityFeaturePage({ params, searchParams }: {
  params: Promise<{ feature: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { feature: featureSlug } = await params;
  const page = pageNumber((await searchParams).page);
  const { feature, rows, totalPages } = await load(featureSlug, page);
  const visible = rows.slice((page - 1) * GAMES_PER_PAGE, page * GAMES_PER_PAGE);
  const href = (target: number) => (target > 1 ? `/accessibility/${featureSlug}?page=${target}` : `/accessibility/${featureSlug}`);

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">접근성</span>
      <h1>{feature} 되는 게임</h1>
      <p>
        {ACCESSIBILITY_NOTES[feature] ?? "Steam 스토어에서 확인한 항목입니다."} 모두 {rows.length.toLocaleString("ko-KR")}편입니다.
        {" "}다른 기능은 <Link href="/accessibility">접근성 기능 목록</Link>에서 봅니다.
      </p>
    </div>

    <ol className="game-index" start={(page - 1) * GAMES_PER_PAGE + 1}>
      {visible.map((game) => <li key={game.slug}>
        <Link href={`/games/${game.slug}`}>
          <strong>{game.title}</strong>
          <small>
            {game.developer || "개발사 미상"} · {game.releaseLabel || "출시일 미정"}
            {game.koreanTextSupported === true ? " · 한국어" : ""}
            {game.features.length > 1 ? ` · 접근성 ${game.features.length}가지` : ""}
          </small>
        </Link>
      </li>)}
    </ol>

    {totalPages > 1 && <nav className="index-pager" aria-label="목록 쪽 이동">
      {page > 1 ? <Link className="secondary-button" href={href(page - 1)} rel="prev">이전</Link> : <span/>}
      <span className="index-pages"><b aria-current="page">{page}</b> / {totalPages}</span>
      {page < totalPages ? <Link className="secondary-button" href={href(page + 1)} rel="next">다음</Link> : <span/>}
    </nav>}
  </main>;
}
