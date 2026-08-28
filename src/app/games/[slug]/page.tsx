import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, NexplayNotFoundError } from "@/lib/api";
import { GameArt } from "@/components/game-art";
import { BookmarkButton } from "@/components/bookmark-button";
import { EventCard } from "@/components/event-card";
import { GameCard } from "@/components/game-card";
import { SectionHeading } from "@/components/section-heading";
import { ArrowIcon, PlayIcon } from "@/components/icons";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const game = await api.game(slug);
    return { title: game.title };
  } catch (error) {
    if (error instanceof NexplayNotFoundError) return { title: "게임을 찾을 수 없어요" };
    throw error;
  }
}

const relationLabels: Record<string, string> = { DLC: "DLC", EXPANSION: "확장팩", SEQUEL: "후속작", PREQUEL: "전작", REMAKE: "리메이크", REMASTER: "리마스터" };
const releaseLabels: Record<string, string> = { INITIAL_CONFIRMATION: "최초 일정 확인", DELAY: "출시 연기", DATE_CHANGE: "일정 변경", PLATFORM_ADDED: "플랫폼 추가" };
const cleanText = (value?: string | null) => value?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const formatPrice = (value: number, currency: string) => new Intl.NumberFormat("ko-KR", { style: "currency", currency }).format(value / 100);

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let game: Awaited<ReturnType<typeof api.game>>;
  try {
    game = await api.game(slug);
  } catch (error) {
    // 없는 slug 는 500 이 아니라 404 여야 한다. not-found.tsx 가 이미 있다.
    if (error instanceof NexplayNotFoundError) notFound();
    throw error;
  }
  // 예전에는 관련작 3개를 뽑으려고 전체 카탈로그를 받아 상위 3개를 그대로 썼다.
  // 장르를 서버로 넘겨 실제로 "관련" 있는 게임만 받는다.
  const [events, metadata, sameGenre] = await Promise.all([
    api.gameEvents(slug),
    api.gameMetadata(slug),
    api.games(game.genres[0]),
  ]);
  const related = sameGenre.filter((item) => item.slug !== slug).slice(0, 3);
  const statusLabel = game.status === "Available" ? "출시됨" : game.status === "Upcoming" ? "출시 예정" : "일정 미정";
  const trailer = metadata.media.find((item) => item.official && (item.type === "TRAILER" || item.type === "GAMEPLAY"));
  const screenshots = metadata.media.filter((item) => item.type === "SCREENSHOT").slice(0, 6);
  const latestPopularity = metadata.popularityHistory[0];
  // 위키백과 본문은 CC BY-SA 라 출처와 링크를 반드시 보여야 한다.
  const descriptionSource = metadata.provenance.find((item) => item.field === "description");

  return <main>
    <section className="detail-hero"><div className="detail-backdrop" style={{ "--accent": game.accent, "--accent-2": game.accent2 } as React.CSSProperties}/><div className="detail-hero-inner shell"><GameArt game={game} className="detail-cover"/><div className="detail-copy"><div className="breadcrumb"><Link href="/discover">게임 탐색</Link><span>/</span><span>{game.title}</span></div><div className="event-labels"><span className="official">✓ 출처 확인</span><span className="micro-tag">{statusLabel}</span>{game.koreanTextSupported && <span className="micro-tag">한국어</span>}</div><h1>{game.title}</h1><p className="detail-tagline">{game.tagline}</p><div className="detail-facts"><div><small>출시일</small><strong>{game.releaseLabel}</strong></div><div><small>개발</small><strong>{game.developer}</strong></div><div><small>플랫폼</small><strong>{game.platforms.join(" · ")}</strong></div></div><div className="detail-actions"><BookmarkButton large/>{trailer && <a className="secondary-button" href={trailer.url} target="_blank" rel="noreferrer"><PlayIcon/> 공식 영상 보기</a>}</div></div></div></section>
    <div className="detail-layout shell"><div className="detail-main">
      <section><span className="eyebrow">게임 소개</span><h2>이 게임에 대해</h2><p className="long-copy">{game.description}</p>{descriptionSource && <p className="copy-source">출처: {descriptionSource.sourceUrl ? <a href={descriptionSource.sourceUrl} target="_blank" rel="noreferrer">{descriptionSource.source}</a> : descriptionSource.source}{descriptionSource.source === "Wikipedia" && <span> · CC BY-SA</span>}</p>}<div className="tag-row large">{game.genres.map((genre) => <span className="micro-tag" key={genre}>{genre}</span>)}{game.gameModes?.map((mode) => <span className="micro-tag mode-tag" key={mode}>{mode}</span>)}</div></section>
      {screenshots.length > 0 && <section><SectionHeading eyebrow="공식 미디어" title="스크린샷과 영상"/><div className="media-grid">{screenshots.map((item) => <a href={item.url} target="_blank" rel="noreferrer" key={item.id}><Image src={item.thumbnailUrl ?? item.url} alt={`${game.title} 공식 스크린샷`} width={640} height={360}/><span>{item.source}</span></a>)}</div></section>}
      {metadata.systemRequirements.length > 0 && <section><SectionHeading eyebrow="PC 정보" title="시스템 요구사항"/><div className="requirement-grid">{metadata.systemRequirements.map((item) => <article className="data-panel" key={`${item.platform}-${item.level}`}><small>{item.level === "MINIMUM" ? "최소 사양" : "권장 사양"}</small><p>{cleanText(item.rawText)}</p><footer>{item.source} 확인</footer></article>)}</div></section>}
      {metadata.relations.length > 0 && <section><SectionHeading eyebrow="게임 세계" title="관련 게임과 콘텐츠"/><div className="relation-list">{metadata.relations.map((item, index) => <a href={item.slug ? `/games/${item.slug}` : item.url ?? "#"} key={`${item.title}-${index}`}><span>{relationLabels[item.type] ?? item.type}</span><strong>{item.title}</strong><ArrowIcon/></a>)}</div></section>}
      <section><SectionHeading eyebrow="출시 기록" title="플랫폼별 일정 이력"/><div className="release-history">{metadata.releaseHistory.slice(0, 12).map((item, index) => <div key={`${item.platform}-${index}`}><span>{item.platform}</span><strong>{item.newDate ?? "일정 미정"}</strong><small>{releaseLabels[item.type] ?? item.type} · {item.source}</small></div>)}</div></section>
      <section><SectionHeading eyebrow="게임 타임라인" title="주요 이벤트"/>{events.length ? <div className="timeline">{events.map((event) => <div className="timeline-row" key={event.id}><span className="timeline-dot"/><EventCard event={event} game={game}/></div>)}</div> : <div className="empty-panel"><strong>아직 기록된 이벤트가 없어요.</strong></div>}</section>
    </div><aside className="detail-aside"><div className="info-panel"><h3>게임 정보</h3><div className="detail-scores"><div><small>NEXPLAY 지수</small><strong>{game.score}</strong><span>작품 정보와 화제성 종합</span></div><div><small>기대 지수</small><strong>{game.anticipationScore}</strong><span>출시 전 관심도</span></div></div><div className="completeness"><div><span>데이터 완성도</span><strong>{metadata.completenessScore}%</strong></div><i><b style={{ width: `${metadata.completenessScore}%` }}/></i>{metadata.missingData.length > 0 && <small>보강 중: {metadata.missingData.join(" · ")}</small>}</div><dl><div><dt>퍼블리셔</dt><dd>{game.publisher}</dd></div><div><dt>출시 상태</dt><dd>{statusLabel}</dd></div><div><dt>게임 모드</dt><dd>{game.gameModes?.join(" · ") || "확인 중"}</dd></div><div><dt>한국어</dt><dd>{game.koreanTextSupported == null ? "확인 중" : game.koreanTextSupported ? `자막${game.koreanAudioSupported ? " · 음성" : ""}` : "미지원"}</dd></div>{latestPopularity && <div><dt>30일 공식 소식</dt><dd>{latestPopularity.officialNews30d}건</dd></div>}</dl>{metadata.prices[0] && <div className="price-box"><small>{metadata.prices[0].store} · {metadata.prices[0].region}</small><strong>{formatPrice(metadata.prices[0].finalPrice, metadata.prices[0].currency)}</strong>{metadata.prices[0].discountPercent > 0 && <span>{metadata.prices[0].discountPercent}% 할인</span>}</div>}{(metadata.ageRatings.length > 0 || metadata.accessibility.length > 0) && <div className="trust-data">{metadata.ageRatings.map((item) => <span key={item.system}>{item.system} {item.rating}</span>)}{metadata.accessibility.slice(0, 4).map((item) => <span key={item.feature}>{item.feature}</span>)}</div>}<hr/>{game.officialUrl && <a href={game.officialUrl} target="_blank" rel="noreferrer">공식 웹사이트 <ArrowIcon/></a>}{game.steamAppId && <a href={`https://store.steampowered.com/app/${game.steamAppId}`} target="_blank" rel="noreferrer">Steam 페이지 <ArrowIcon/></a>}<small className="verified-note">최근 검증: {metadata.provenance[0]?.verifiedAt.slice(0, 10) ?? "확인 중"}</small></div></aside></div>
    <section className="content-section shell"><SectionHeading eyebrow="함께 볼 게임" title="이런 게임도 살펴보세요"/><div className="card-grid three">{related.map((item) => <GameCard key={item.id} game={item}/>)}</div></section>
  </main>;
}
