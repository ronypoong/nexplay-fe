import Link from "next/link";
import { api } from "@/lib/api";
import { GameArt } from "@/components/game-art";
import { GameCard } from "@/components/game-card";
import { EventCard } from "@/components/event-card";
import { SectionHeading } from "@/components/section-heading";
import { ArrowIcon, CalendarIcon, SparkIcon } from "@/components/icons";
import { TrendingCarousel } from "@/components/trending-carousel";
import { EditorPicks } from "@/components/editor-picks";
import type { GameEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ games, events }, picks] = await Promise.all([
    api.feed(),
    api.editorPicks().catch(() => []),
  ]);
  const today = new Date();
  const todayLabel = today.toLocaleDateString("ko-KR", { month: "long", day: "numeric", timeZone: "Asia/Seoul" });
  const calendarParts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit" }).formatToParts(today);
  const currentYear = calendarParts.find((part) => part.type === "year")?.value ?? String(today.getFullYear());
  const calendarHref = `/releases/${currentYear}/${calendarParts.find((part) => part.type === "month")?.value}`;
  const hero = games[0];
  // 카탈로그가 비면 예전에는 throw 해서 홈이 500 이 났다. 첫 실행(동기화 전)에 바로 걸린다.
  if (!hero) {
    return <main className="page-shell shell"><div className="page-hero compact"><span className="eyebrow">NEXPLAY</span><h1>아직 보여드릴 게임이 없어요.</h1><p>카탈로그 동기화가 끝나면 올해 신작과 공식 소식이 이곳에 채워집니다.</p></div></main>;
  }
  // 백엔드 status 만 믿으면 이미 지난 날짜가 섞여 들어온다(연도만 아는 데이터는 1월 1일로 온다).
  // 화면에서도 오늘 이후만 남기고, 3개는 너무 적어 10개까지 보여준다.
  const todayIso = calendarParts.find((part) => part.type === "year")!.value
    + "-" + calendarParts.find((part) => part.type === "month")!.value
    + "-" + new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", day: "2-digit" }).format(today);
  const upcomingAll = games
    .filter((game) => game.status === "Upcoming" && game.releaseDate !== "TBA" && game.releaseDate >= todayIso)
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
  const upcoming = upcomingAll.slice(0, 10);
  const primaryEvent = events.find((event) => ["MAJOR_UPDATE", "EXPANSION", "DLC"].includes(event.type)) ?? events[0];
  const supportingCandidates = [
    events.find((event) => event.type === "PATCH" && event.gameSlug === primaryEvent?.gameSlug) ?? events.find((event) => event.type === "PATCH"),
    events.find((event) => ["EXPANSION", "DLC"].includes(event.type)),
    ...events,
  ];
  const supportingEvents = supportingCandidates
    .filter((event): event is GameEvent => Boolean(event))
    .filter((event, index, list) => event.id !== primaryEvent?.id && list.findIndex((item) => item.id === event.id) === index)
    .slice(0, 4);
  // 예전에는 games.slice(4, 6) 이라 "가장 안 숨은" 5·6번째가 숨은 기대작으로 나갔다.
  // 대형사 소속이 아니고 팔로워가 적은 순으로, 기대 지수가 높은 게임을 고른다.
  const hiddenGems = games
    .filter((game) => !game.featured && game.status === "Upcoming")
    .sort((a, b) => a.score - b.score || b.anticipationScore - a.anticipationScore)
    .slice(0, 2);
  const updateCount = events.filter((event) => ["MAJOR_UPDATE", "PATCH"].includes(event.type)).length;
  const expansionCount = events.filter((event) => ["EXPANSION", "DLC"].includes(event.type)).length;
  return <main>
    <section className="hero shell">
      <div className="hero-copy"><span className="live-pill"><i/> 오늘 · {todayLabel}</span><p className="hero-kicker">{currentYear}년 신작 발견</p><h1>다음 플레이를<br/><em>발견하세요.</em></h1><p className="hero-sub">올해 출시작부터 주요 게임사의 최신작까지.<br className="desktop-only"/> 중요한 일정과 공식 소식을 한곳에서 만나보세요.</p><div className="hero-actions"><Link className="primary-button" href="/discover">게임 둘러보기 <ArrowIcon/></Link><Link className="text-button" href={calendarHref}><CalendarIcon/> 출시 일정</Link></div><div className="today-stats"><div><strong>{games.filter((game) => game.releaseDate.startsWith(currentYear)).length}</strong><span>{currentYear}년 신작</span></div><div><strong>{events.length}</strong><span>공식 소식</span></div><div><strong>{upcomingAll.length}</strong><span>출시 임박</span></div></div></div>
      <Link href={`/games/${hero.slug}`} className="hero-feature"><GameArt game={hero}/><div className="hero-feature-overlay"><div><span className="official light">{currentYear} 신작</span><span className="hero-date">{hero.releaseLabel}</span></div><h2>{hero.title}</h2><p>{hero.tagline}</p><span className="feature-link">게임 자세히 보기 <ArrowIcon/></span></div></Link>
    </section>

    <section id="trending" className="content-section shell"><SectionHeading eyebrow="인기 급상승" title="지금 가장 주목받는 게임" href="/discover"/><TrendingCarousel games={games}/></section>

    {primaryEvent && <section id="announced" className="dark-band"><div className="shell"><div className="magazine-heading"><SectionHeading eyebrow="NEXPLAY 매거진" title="놓치면 안 될 게임 소식" href="/discover" action="전체 소식 보기"/><div className="magazine-index"><span><strong>{events.length}</strong> 최신 소식</span><span><strong>{updateCount}</strong> 패치·업데이트</span><span><strong>{expansionCount}</strong> 확장팩·DLC</span></div></div><div className="event-grid"><EventCard event={primaryEvent} game={games.find((game) => game.slug === primaryEvent.gameSlug) ?? hero} feature/><div className="event-stack">{supportingEvents.map((event) => <EventCard key={event.id} event={event} game={games.find((game) => game.slug === event.gameSlug) ?? hero}/>)}</div></div></div></section>}

    <EditorPicks picks={picks}/>

    <section id="upcoming" className="content-section shell"><SectionHeading eyebrow="출시 예정" title="곧 만날 수 있는 게임" href={calendarHref} action="캘린더 보기"/><div className="upcoming-list">{upcoming.map((game) => { const date = new Date(`${game.releaseDate}T00:00:00`); const yearOnly = game.releaseDate.endsWith("-01-01"); return <Link key={game.id} className="upcoming-item" href={`/games/${game.slug}`}><span className={yearOnly ? "date-block year" : "date-block"}>{yearOnly ? <><small>연내</small><strong>{date.getFullYear()}</strong></> : <><small>{date.getMonth() + 1}월</small><strong>{date.getDate()}</strong></>}</span><GameArt game={game}/><span className="upcoming-copy"><strong>{game.title}</strong><small>{game.genres.join(" · ")}</small></span><span className="platforms">{game.platforms.slice(0, 2).join(" · ")}</span><ArrowIcon/></Link>; })}</div></section>

    <section className="hidden-gems shell"><div className="gem-intro"><span className="gem-icon"><SparkIcon/></span><span className="eyebrow">숨은 기대작</span><h2>아직 모두가 알기 전,<br/>먼저 발견해보세요.</h2><p>규모보다 가능성을 봅니다. 관심은 적지만 반응이 빠르게 오르는 게임을 골랐어요.</p><Link className="text-button" href="/discover">숨은 기대작 더 보기 <ArrowIcon/></Link></div><div className="gem-cards">{hiddenGems.map((game) => <GameCard key={game.id} game={game}/>)}</div></section>
  </main>;
}
