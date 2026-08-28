import Link from "next/link";
import { GameArt } from "./game-art";
import type { GameCard, GameEvent } from "@/lib/types";
import { PlayIcon } from "./icons";

const labels = { ANNOUNCEMENT: "공식 소식", TRAILER: "트레일러", GAMEPLAY: "게임플레이", RELEASE_DATE: "출시일", DELAY: "출시 연기", RELEASE: "출시", DEMO: "데모", BETA: "베타", DLC: "DLC", EXPANSION: "확장팩", MAJOR_UPDATE: "대규모 업데이트", PATCH: "패치", DISCOUNT: "할인", PREORDER: "예약 구매" };

export function EventCard({ event, game, feature = false }: { event: GameEvent; game: GameCard; feature?: boolean }) {
  /*
   * 공식 발표는 대부분 영어나 일본어로 온다. 제목만 보여 주면 한국 사용자에게는
   * 무슨 일이 있었는지 전달되지 않는다. 모델이 원문에서 뽑은 한국어 한 줄이 있으면
   * 그걸 본문 자리에 놓고, 원문 제목은 그대로 위에 남긴다 — 요약은 원문을 대체하는
   * 것이 아니라 읽는 실마리다.
   */
  const body = event.summaryKo ?? event.summary;
  return <article className={`event-card ${feature ? "featured-event" : ""}`}>
    <Link href={`/games/${game.slug}`} className="event-art"><GameArt game={game}/>{["TRAILER", "GAMEPLAY"].includes(event.type) && <span className="play-badge"><PlayIcon fill="currentColor"/></span>}</Link>
    <div className="event-copy">
      <div className="event-labels">
        <span className={`event-type ${event.type.toLowerCase()}`}>{labels[event.type] ?? "공식 소식"}</span>
        {event.official && <span className="official">✓ 공식</span>}
        {event.hasDemo && <span className="event-flag">체험판</span>}
        {event.discountPercent != null && event.discountPercent > 0 && <span className="event-flag sale">{event.discountPercent}% 할인</span>}
        {event.marketingNoise && <span className="event-flag muted-flag">홍보성</span>}
      </div>
      <Link href={`/games/${game.slug}`}><h3>{event.title}</h3></Link>
      <p>{body}</p>
      <div className="event-footer">
        <strong>{game.title}</strong>
        <span>{event.dateLabel} · 출처 {event.sourceCount}개{event.summaryKo && " · AI 요약"}</span>
      </div>
    </div>
  </article>;
}
