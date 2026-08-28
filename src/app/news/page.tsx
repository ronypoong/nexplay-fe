import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { EventCard } from "@/components/event-card";
import { SectionHeading } from "@/components/section-heading";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "공식 소식",
  description: "게임사가 직접 발표한 소식을 모아 중요한 것부터 보여줍니다. 원문 링크를 함께 남기고, 영어·일본어 발표에는 한국어 요약을 답니다.",
  alternates: { canonical: "/news" },
};

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const current = Math.max(0, Number(page ?? 0) || 0);
  const events = await api.events(current);

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">공식 소식</span>
      <h1>게임사가 직접 한 이야기</h1>
      <p>
        기사를 옮겨 적지 않습니다. 게임사가 공식 채널에 올린 발표만 모으고, 원문으로 가는 링크를 함께 답니다.
        영어·일본어로 온 발표에는 한국어 한 줄을 붙입니다.
      </p>
    </div>

    <section className="content-section">
      <SectionHeading eyebrow={`${current + 1}쪽`} title="중요한 것부터"/>
      {events.length > 0
        ? <div className="news-list">{events.map((event) => <EventCard key={event.id} event={event}/>)}</div>
        : <div className="empty-panel"><strong>더 볼 소식이 없어요.</strong><Link className="primary-button" href="/news">첫 쪽으로</Link></div>}

      {(current > 0 || events.length > 0) && <div className="news-pager">
        {current > 0
          ? <Link className="secondary-button" href={`/news?page=${current - 1}`}>이전</Link>
          : <span/>}
        {events.length > 0 && <Link className="secondary-button" href={`/news?page=${current + 1}`}>다음</Link>}
      </div>}
    </section>
  </main>;
}
