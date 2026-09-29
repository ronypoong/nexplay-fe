import Link from "next/link";
import type { GameCard } from "@/lib/types";

/**
 * 쪽 나뉜 게임 목록.
 *
 * 전체 목록·한국어 지원·연도별이 같은 모양을 쓴다. 세 곳에 같은 마크업을 두면
 * 한 곳만 고쳐지고 나머지가 뒤처진다. 크롤러에게 보이는 링크가 이 화면의 전부라
 * 특히 어긋나면 안 된다.
 */
export function GameIndexList({ games, page, totalPages, hrefFor, start }: {
  games: GameCard[];
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  start: number;
}) {
  // 첫 쪽·끝 쪽과 지금 쪽 둘레만 세운다. 열한 쪽을 다 세우면 어느 쪽에 있든
  // 링크 줄이 화면 한 칸을 먹는다.
  const near = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((target) => target === 1 || target === totalPages || Math.abs(target - page) <= 2);

  return <>
    <ol className="game-index" start={start}>
      {games.map((game) => <li key={game.id}>
        <Link href={`/games/${game.slug}`}>
          <strong>{game.title}</strong>
          <small>
            {game.developer || "개발사 미상"} · {game.releaseLabel || game.releaseDate} · {game.platforms.join(" · ") || "플랫폼 미정"}
            {game.koreanAudioSupported === true ? " · 한국어 음성" : game.koreanTextSupported === true ? " · 한국어 자막" : ""}
          </small>
        </Link>
      </li>)}
    </ol>

    {totalPages > 1 && <nav className="index-pager" aria-label="목록 쪽 이동">
      {page > 1 ? <Link className="secondary-button" href={hrefFor(page - 1)} rel="prev">이전</Link> : <span/>}
      <span className="index-pages">
        {near.map((target, index) => <span key={target}>
          {index > 0 && near[index - 1] !== target - 1 && <i aria-hidden="true">…</i>}
          {target === page
            ? <b aria-current="page">{target}</b>
            : <Link href={hrefFor(target)}>{target}</Link>}
        </span>)}
      </span>
      {page < totalPages ? <Link className="secondary-button" href={hrefFor(page + 1)} rel="next">다음</Link> : <span/>}
    </nav>}
  </>;
}

/** 쪽 번호를 읽는다. 정수가 아니거나 1보다 작으면 0 — 부르는 쪽에서 404 로 보낸다. */
export function pageNumber(raw?: string) {
  const value = Number(raw ?? 1);
  return Number.isInteger(value) && value >= 1 ? value : 0;
}
