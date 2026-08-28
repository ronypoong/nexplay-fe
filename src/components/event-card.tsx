import Link from "next/link";
import { GameArt } from "./game-art";
import type { GameArtRef, GameEvent } from "@/lib/types";
import { ArrowIcon, PlayIcon } from "./icons";

const labels: Record<string, string> = { ANNOUNCEMENT: "공식 소식", TRAILER: "트레일러", GAMEPLAY: "게임플레이", RELEASE_DATE: "출시일", DELAY: "출시 연기", RELEASE: "출시", DEMO: "데모", BETA: "베타", DLC: "DLC", EXPANSION: "확장팩", MAJOR_UPDATE: "대규모 업데이트", PATCH: "패치", DISCOUNT: "할인", PREORDER: "예약 구매" };

export function EventCard({ event, game, feature = false }: { event: GameEvent; game?: GameArtRef; feature?: boolean }) {
  /*
   * 소식이 자기 게임을 직접 들고 온다. 예전에는 화면이 게임 목록에서 찾았는데,
   * 목록은 40개고 소식은 405개 게임에서 와서 못 찾으면 엉뚱한 게임으로 대체됐다.
   */
  const art = event.game ?? game;
  const slug = art?.slug ?? event.gameSlug;
  /*
   * 제목과 그림은 소식 상세로 간다. 상세를 만들어 두고 거기로 가는 길을 아무
   * 데도 걸지 않아서, 화면은 있는데 닿을 수가 없었다.
   *
   * 게임으로 가는 길은 아래 게임 이름에 둔다. 소식을 보다가 그 게임이 궁금해지는
   * 것과, 소식 자체를 자세히 보는 것은 다른 일이다.
   */

  /*
   * 공식 발표는 대부분 영어나 일본어로 온다. 제목만 보여 주면 한국 사용자에게는
   * 무슨 일이 있었는지 전달되지 않는다. 요약은 원문을 대체하는 것이 아니라
   * 읽는 실마리이므로, 원문 제목은 위에 그대로 둔다.
   */
  const body = event.summaryKo ?? event.summary;

  return <article className={`event-card ${feature ? "featured-event" : ""}`}>
    <Link href={`/news/${event.id}`} className="event-art" aria-label={`${event.title} 자세히 보기`}>
      {art && <GameArt game={art}/>}
      {["TRAILER", "GAMEPLAY"].includes(event.type) && <span className="play-badge"><PlayIcon fill="currentColor"/></span>}
    </Link>
    <div className="event-copy">
      <div className="event-labels">
        <span className={`event-type ${event.type.toLowerCase()}`}>{labels[event.type] ?? "공식 소식"}</span>
        {event.official && <span className="official">✓ 공식</span>}
        {event.hasDemo && <span className="event-flag">체험판</span>}
        {event.discountPercent != null && event.discountPercent > 0 && <span className="event-flag sale">{event.discountPercent}% 할인</span>}
        {event.marketingNoise && <span className="event-flag muted-flag">홍보성</span>}
      </div>
      <Link href={`/news/${event.id}`} title={event.title}><h3>{event.title}</h3></Link>
      <p>{body}</p>
      <div className="event-footer">
        <Link href={`/games/${slug}`} className="event-game-link"><strong>{art?.title ?? ""}</strong></Link>
        <span>{event.dateLabel} · 출처 {event.sourceCount}개{event.summaryKo && " · AI 요약"}</span>
      </div>
      {/* 남의 발표를 옮긴 것이므로 원문으로 가는 길을 반드시 남긴다. */}
      {event.sourceUrl && <a className="event-source" href={event.sourceUrl} target="_blank" rel="noreferrer">
        {event.source}에서 원문 보기 <ArrowIcon size={14}/>
      </a>}
    </div>
  </article>;
}
