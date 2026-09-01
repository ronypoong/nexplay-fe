import type { Metadata } from "next";
import { api } from "@/lib/api";
import { EventCard } from "@/components/event-card";
import { SectionHeading } from "@/components/section-heading";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "지금 해볼 수 있는 게임",
  description: "공식 채널에서 확인한 데모와 베타, 플레이테스트를 모았습니다. 기간이 끝나면 사라지는 것들이라 최근 소식부터 보여줍니다.",
  alternates: { canonical: "/playtests" },
};

/**
 * 다른 목록과 성격이 다른 화면이다.
 *
 * 출시 예정작은 기다리는 것 말고는 할 일이 없지만, 여기 있는 것은 지금 눌러서
 * 해 볼 수 있다. 대신 기간이 끝나면 사라지므로 중요도가 아니라 최근순으로 세운다.
 *
 * 스팀 플레이테스트는 대개 기간을 공지 본문에 적지 않는다. 그래서 "지금 열려
 * 있음"을 우리가 장담할 수 없다. 장담하는 대신 언제 올라온 소식인지를 크게
 * 보여 주고, 확인은 원문에서 하도록 링크를 남긴다.
 */
export default async function PlaytestsPage() {
  const events = await api.playtests();
  const demos = events.filter((event) => event.type === "DEMO" || event.hasDemo);
  const demoIds = new Set(demos.map((event) => event.id));
  const betas = events.filter((event) => event.type === "BETA" && !demoIds.has(event.id));
  const betaIds = new Set(betas.map((event) => event.id));
  const others = events.filter((event) => !demoIds.has(event.id) && !betaIds.has(event.id));
  const thisWeek = events.filter((event) => event.dateLabel.includes("시간 전") || event.dateLabel === "어제").length;

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">데모 · 베타</span>
      <h1>지금 해볼 수 있는 게임</h1>
      <p>공식 채널에서 확인한 체험판과 테스트 모집입니다. 출시를 기다리는 것과 달리 지금 바로 해볼 수 있지만, 기간이 끝나면 사라집니다.</p>
    </div>

    {events.length === 0
      ? <div className="empty-panel"><strong>최근 확인된 데모나 베타가 없어요.</strong><p>공식 채널에서 새 소식이 오면 여기에 쌓입니다. 매일 오전에 확인합니다.</p></div>
      : <>
        <div className="radar-stats">
          <div><strong>{demos.length}</strong><span>체험판</span></div>
          <div><strong>{betas.length}</strong><span>베타 · 테스트 모집</span></div>
          <div><strong>{thisWeek}</strong><span>하루 안에 올라온 소식</span></div>
        </div>
        {/* 기간을 우리가 모른다는 것을 숨기지 않는다. 이미 닫힌 것을 열려 있다고 말하는 편이 훨씬 나쁘다. */}
        <p className="radar-note">모집 기간이 공지에 적히지 않는 경우가 많아 지금도 열려 있는지는 원문에서 확인해 주세요. 최근 45일 소식만 싣습니다.</p>

        {demos.length > 0 && <section className="content-section">
          <SectionHeading eyebrow="체험판" title="받아서 바로 해볼 수 있어요"/>
          <div className="news-list">
            {demos.map((event) => <EventCard event={event} key={event.id}/>)}
          </div>
        </section>}

        {betas.length > 0 && <section className="content-section">
          <SectionHeading eyebrow="베타 · 플레이테스트" title="신청하면 해볼 수 있어요"/>
          <p className="section-note">인원이나 기간이 정해진 모집이 많습니다. 원문에서 조건을 확인하세요.</p>
          <div className="news-list">
            {betas.map((event) => <EventCard event={event} key={event.id}/>)}
          </div>
        </section>}

        {others.length > 0 && <section className="content-section">
          <SectionHeading eyebrow="함께 언급된 소식" title="체험 관련 내용이 담긴 발표"/>
          <p className="section-note">데모나 테스트 이야기가 함께 실린 공식 발표입니다.</p>
          <div className="news-list">
            {others.map((event) => <EventCard event={event} key={event.id}/>)}
          </div>
        </section>}
      </>}
  </main>;
}
