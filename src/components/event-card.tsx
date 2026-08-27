import Link from "next/link";
import { GameArt } from "./game-art";
import type { Game, GameEvent } from "@/lib/types";
import { PlayIcon } from "./icons";

const labels = { ANNOUNCEMENT: "공식 소식", TRAILER: "트레일러", GAMEPLAY: "게임플레이", RELEASE_DATE: "출시일", DELAY: "출시 연기", RELEASE: "출시", DEMO: "데모", BETA: "베타", DLC: "DLC", EXPANSION: "확장팩", MAJOR_UPDATE: "대규모 업데이트", PATCH: "패치" };

export function EventCard({ event, game, feature = false }: { event: GameEvent; game: Game; feature?: boolean }) {
  return <article className={`event-card ${feature ? "featured-event" : ""}`}>
    <Link href={`/games/${game.slug}`} className="event-art"><GameArt game={game}/>{["TRAILER", "GAMEPLAY"].includes(event.type) && <span className="play-badge"><PlayIcon fill="currentColor"/></span>}</Link>
    <div className="event-copy">
      <div className="event-labels"><span className={`event-type ${event.type.toLowerCase()}`}>{labels[event.type]}</span>{event.official && <span className="official">✓ 공식</span>}</div>
      <Link href={`/games/${game.slug}`}><h3>{event.title}</h3></Link>
      <p>{event.summary}</p>
      <div className="event-footer"><strong>{game.title}</strong><span>{event.dateLabel} · 출처 {event.sourceCount}개</span></div>
    </div>
  </article>;
}
