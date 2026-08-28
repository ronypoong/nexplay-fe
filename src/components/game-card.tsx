import Link from "next/link";
import type { GameCard as GameCardData } from "@/lib/types";
import { GameArt } from "./game-art";
import { BookmarkButton } from "./bookmark-button";
import { AwardBadge } from "./award-badge";
import { SparkIcon, EyeIcon } from "./icons";

export function GameCard({ game, rank }: { game: GameCardData; rank?: number }) {
  return <article className="game-card">
    <Link href={`/games/${game.slug}`} className="game-card-art" aria-label={`${game.title} 상세 보기`}><GameArt game={game}/><AwardBadge badge={game.awardBadge}/>{rank && <span className="rank">{rank}</span>}</Link>
    <div className="game-card-body">
      <div className="game-card-top"><div><Link href={`/games/${game.slug}`}><h3>{game.title}</h3></Link><p>{game.developer}</p></div><BookmarkButton slug={game.slug}/></div>
      <div className="tag-row genre-row">{game.genres.slice(0, 3).map((genre) => <span key={genre} className="micro-tag genre-tag">{genre}</span>)}</div>
      <div className="card-meta"><span>{game.releaseLabel}</span><span>{game.platforms.slice(0, 3).join(" · ")}</span></div>
      {/* 수가 적을 때는 서버가 null 을 준다. "기대 3" 은 없느니만 못하다. */}
      {(game.anticipations != null || game.views != null) && <div className="card-audience">
        {game.anticipations != null && <span><SparkIcon size={13}/> 기대 {game.anticipations.toLocaleString()}</span>}
        {game.views != null && <span><EyeIcon size={13}/> {game.views.toLocaleString()}</span>}
      </div>}
      <div className="score-pair"><span><small>NEXPLAY 지수</small><strong>{game.score}</strong></span><span><small>기대 지수</small><strong>{game.anticipationScore}</strong></span></div>
    </div>
  </article>;
}
