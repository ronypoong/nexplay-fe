import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { EventCard } from "@/components/event-card";
import { SectionHeading } from "@/components/section-heading";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "한국어 되는 데모",
  description: "지금 받아볼 수 있는 체험판·베타 중 한국어 지원이 확인된 것만 모았습니다. 스팀 넥스트 페스트처럼 데모가 쏟아질 때 언어부터 거르고 보세요.",
  alternates: { canonical: "/playtests/korean" },
};

/**
 * 한국어 되는 데모만.
 *
 * 넥스트 페스트 주간에는 체험판이 수백 개 쏟아진다. 한국 사람이 제일 먼저
 * 거르는 조건이 언어인데, 스팀 쪽 필터로는 데모의 언어를 한눈에 못 본다.
 * 우리는 카탈로그 전체의 언어 지원을 들고 있으니 이 목록을 만들 수 있다.
 *
 * "한국어 미확인" 은 섞지 않는다. 받아 봤더니 영어뿐이면 이 목록을 믿을 이유가
 * 없어진다. 확인된 것만 싣고, 몇 개를 걸렀는지는 숨기지 않는다.
 */
export default async function KoreanPlaytestsPage() {
  const events = await api.playtests();
  const playable = events.filter((event) => event.type === "DEMO" || event.type === "BETA" || event.hasDemo);
  const korean = playable.filter((event) => event.game?.koreanTextSupported === true);
  const unknown = playable.filter((event) => event.game?.koreanTextSupported == null).length;
  const demos = korean.filter((event) => event.type === "DEMO" || event.hasDemo);
  const demoIds = new Set(demos.map((event) => event.id));
  const betas = korean.filter((event) => !demoIds.has(event.id));

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">한국어 데모</span>
      <h1>한국어로 해볼 수 있는 체험판</h1>
      <p>
        지금 받아볼 수 있는 것 중 한국어 자막이 확인된 것만 골랐습니다.
        {" "}전부 보려면 <Link href="/playtests">데모 · 베타 전체</Link>로 가세요.
      </p>
    </div>

    {korean.length === 0
      ? <div className="empty-panel">
          <strong>한국어가 확인된 체험판이 아직 없어요.</strong>
          <p>확인되지 않은 것을 섞어 보여주지는 않습니다. 새로 확인되면 여기에 쌓입니다.</p>
        </div>
      : <>
        <div className="radar-stats">
          <div><strong>{korean.length}</strong><span>한국어 확인</span></div>
          <div><strong>{korean.filter((event) => event.game?.koreanAudioSupported === true).length}</strong><span>음성까지</span></div>
          <div><strong>{unknown}</strong><span>언어 미확인(제외)</span></div>
        </div>
        <p className="radar-note">모집 기간이 공지에 적히지 않는 경우가 많아 지금도 열려 있는지는 원문에서 확인해 주세요.</p>

        {demos.length > 0 && <section className="content-section">
          <SectionHeading eyebrow="체험판" title="받아서 바로 해볼 수 있어요"/>
          <div className="news-list">{demos.map((event) => <EventCard event={event} key={event.id}/>)}</div>
        </section>}

        {betas.length > 0 && <section className="content-section">
          <SectionHeading eyebrow="베타 · 플레이테스트" title="신청하면 해볼 수 있어요"/>
          <div className="news-list">{betas.map((event) => <EventCard event={event} key={event.id}/>)}</div>
        </section>}
      </>}
  </main>;
}
