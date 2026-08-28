import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, NexplayNotFoundError } from "@/lib/api";
import { SectionHeading } from "@/components/section-heading";
import { ArrowIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = { ANNOUNCEMENT: "공식 소식", TRAILER: "트레일러", GAMEPLAY: "게임플레이", RELEASE_DATE: "출시일", DELAY: "출시 연기", RELEASE: "출시", DEMO: "데모", BETA: "베타", DLC: "DLC", EXPANSION: "확장팩", MAJOR_UPDATE: "대규모 업데이트", PATCH: "패치", DISCOUNT: "할인", PREORDER: "예약 구매" };
const CONFIDENCE_LABEL: Record<string, string> = { HIGH: "높음", MEDIUM: "보통", LOW: "낮음" };
const CLAIM_LABEL: Record<string, string> = { RELEASE_DATE: "출시 시점", KOREAN_SUPPORT: "한국어 지원", CONTENT: "콘텐츠", PLATFORM: "플랫폼", DEMO: "체험판" };
const STATUS_LABEL: Record<string, string> = { KEPT: "지켜짐", BROKEN: "어겨짐", SUPERSEDED: "미뤄짐", PENDING: "판정 전" };

async function load(id: string) {
  try {
    return await api.event(id);
  } catch (error) {
    if (error instanceof NexplayNotFoundError) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await load(id);
  return {
    title: `${event.title} · ${event.gameTitle}`,
    description: event.summaryKo ?? event.summary.slice(0, 150),
    alternates: { canonical: `/news/${id}` },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await load(id);
  const primary = event.sources[0];

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <div className="breadcrumb">
        <Link href="/news">공식 소식</Link><span>/</span>
        <Link href={`/games/${event.gameSlug}`}>{event.gameTitle}</Link>
      </div>
      <div className="event-labels">
        <span className={`event-type ${event.type.toLowerCase()}`}>{TYPE_LABEL[event.type] ?? "공식 소식"}</span>
        {primary?.official && <span className="official">✓ 공식</span>}
        {event.facts?.marketingNoise && <span className="event-flag muted-flag">홍보성</span>}
      </div>
      <h1>{event.title}</h1>
      {event.summaryKo && <p className="news-summary">{event.summaryKo}</p>}
      <p className="news-meta">
        {event.eventDate} 발표 · 출처 {event.sources.length}곳
        {event.summaryKo && <> · 한국어 요약은 원문에서 뽑은 것입니다</>}
      </p>
    </div>

    {/*
      원문은 옮기지 않는다. 기사 본문을 그대로 재게시하지 않는 것이 이 서비스의
      첫 번째 금지선이라, 여기서는 원문으로 가는 길만 크게 낸다.
    */}
    <section className="content-section">
      <div className="news-source-panel">
        <div>
          <strong>이 소식의 원문</strong>
          <p>NEXPLAY는 발표 전문을 옮기지 않습니다. 전체 내용은 게임사가 올린 원문에서 확인하세요.</p>
        </div>
        <div className="news-source-links">
          {event.sources.map((source) => <a key={source.url} className="primary-button" href={source.url} target="_blank" rel="noreferrer">
            {source.name}에서 보기 <ArrowIcon size={16}/>
          </a>)}
        </div>
      </div>
    </section>

    {event.facts && <section className="content-section">
      <SectionHeading eyebrow="확인한 것" title="원문에서 뽑은 사실"/>
      <p className="section-note">
        모델이 원문을 읽고 채운 항목입니다. 없는 내용은 지어내지 않고 비워 둡니다.
      </p>
      <div className="fact-grid">
        <div><small>분류 확신도</small><strong>{CONFIDENCE_LABEL[event.facts.confidence] ?? event.facts.confidence}</strong></div>
        <div><small>언급된 출시일</small><strong>{event.facts.mentionedReleaseDate ?? "없음"}</strong></div>
        <div><small>할인율</small><strong>{event.facts.discountPercent != null ? `${event.facts.discountPercent}%` : "없음"}</strong></div>
        <div><small>체험판 안내</small><strong>{event.facts.hasDemo ? "있음" : "없음"}</strong></div>
      </div>
      {event.facts.reason && <blockquote className="fact-reason">
        {event.facts.reason}
        <cite>그렇게 분류한 근거 · {event.facts.model}</cite>
      </blockquote>}
    </section>}

    {event.promises.length > 0 && <section className="content-section">
      <SectionHeading eyebrow="약속과 결과" title="이 발표가 담은 약속"/>
      <p className="section-note">앞으로 하겠다고 한 것만 뽑습니다. 지켜졌는지는 실제 출시일·언어 이력과 대조해 정합니다.</p>
      <ol className="promise-timeline">
        {event.promises.map((promise, index) => <li key={`${promise.claimType}-${index}`}>
          <div className="promise-when">
            <strong>{promise.announcedAt}</strong>
            <span className={`promise-badge ${promise.status.toLowerCase()}`}>{STATUS_LABEL[promise.status]}</span>
          </div>
          <div className="promise-what">
            <span className="promise-type">{CLAIM_LABEL[promise.claimType] ?? promise.claimType}</span>
            <strong>{promise.claimedValue}</strong>
            {promise.sourceQuote && <blockquote className="promise-quote">{promise.sourceQuote}</blockquote>}
            {promise.slipDays != null && promise.slipDays > 0 && <small><span className="promise-slip">{promise.slipDays}일 밀림</span></small>}
          </div>
        </li>)}
      </ol>
    </section>}

    <section className="content-section">
      <Link className="secondary-button" href={`/games/${event.gameSlug}`}>{event.gameTitle} 자세히 보기 <ArrowIcon size={16}/></Link>
    </section>
  </main>;
}
