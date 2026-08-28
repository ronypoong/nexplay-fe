"use client";

import Link from "next/link";
import { GameCard } from "@/components/game-card";
import { useSavedGames } from "@/lib/saved-games";
import type { GameCard as GameCardType } from "@/lib/types";

/**
 * 담아둔 게임 목록.
 *
 * 목록은 브라우저에만 있고 카탈로그는 서버에 있으므로, 서버가 보내 준 전체
 * 카탈로그에서 담아둔 것만 골라 그린다. 서버는 무엇을 담았는지 알 수 없어
 * 첫 렌더는 항상 비어 있고, 브라우저에서 채워진다.
 */
export function SavedList({ catalog }: { catalog: GameCardType[] }) {
  const saved = useSavedGames();
  const bySlug = new Map(catalog.map((game) => [game.slug, game]));
  // 담은 순서대로 둔다. 최근에 담은 것이 아래로 쌓이는 편이 목록을 찾기 쉽다.
  const games = saved.map((slug) => bySlug.get(slug)).filter((g): g is GameCardType => Boolean(g));
  const missing = saved.length - games.length;

  if (saved.length === 0) {
    return <div className="empty-panel">
      <strong>아직 담아둔 게임이 없어요.</strong>
      <p>게임 카드나 상세 화면에서 북마크를 누르면 여기 모입니다. 이 목록은 이 브라우저에만 저장됩니다.</p>
      <Link className="primary-button" href="/discover">게임 둘러보기</Link>
    </div>;
  }

  return <>
    <div className="card-grid three">
      {games.map((game) => <GameCard key={game.slug} game={game}/>)}
    </div>
    {missing > 0 && <p className="section-note" style={{ marginTop: 20 }}>
      담아둔 {missing}개는 지금 카탈로그에 없어 표시하지 못했습니다. 아카이브로 옮겨졌거나 이름이 바뀐 게임입니다.
    </p>}
  </>;
}
