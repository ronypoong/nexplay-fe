import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { SectionHeading } from "@/components/section-heading";
import { ArrowIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "추세와 연기",
  description: "기대 지수가 오르는 게임과 출시일이 바뀐 게임을 추적합니다. 개발사가 일정을 얼마나 지키는지도 함께 봅니다.",
  alternates: { canonical: "/trends" },
};

const changeLabels: Record<string, string> = { DELAY: "연기", DATE_CHANGE: "일정 변경", PLATFORM_ADDED: "플랫폼 추가" };

/** 재료가 아직 없을 때 그럴듯한 숫자를 지어내는 대신 며칠째인지 그대로 보여준다. */
function Collecting({ title, days, readyAt, unit }: { title: string; days: number; readyAt: number; unit: string }) {
  const percent = Math.min(100, Math.round((days / readyAt) * 100));
  return <div className="collecting">
    <strong>{title}</strong>
    <p>지금 {days}{unit} 모았습니다. {readyAt}{unit}가 되면 이 자리에 결과가 나타납니다.</p>
    <i><b style={{ width: `${percent}%` }}/></i>
  </div>;
}

export default async function TrendsPage() {
  const { momentumMaturity, delayMaturity, risingGames, recentChanges, studios, silentGames } = await api.trends();

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">추세와 연기</span>
      <h1>숫자가 움직이는 걸 봅니다</h1>
      <p>매일 기대 지수를 기록하고, 출시일이 바뀌면 이력을 남깁니다. 한 장의 목록으로는 보이지 않는 변화를 여기서 봅니다.</p>
    </div>

    <section className="content-section">
      <SectionHeading eyebrow="기대 지수" title="이번 주 가장 많이 오른 게임"/>
      {momentumMaturity.ready && risingGames.length > 0
        ? <div className="rise-list">
            {risingGames.map((game, index) => <Link className="rise-row" href={`/games/${game.slug}`} key={game.slug}>
              <span className="rise-rank">{index + 1}</span>
              <span className="rise-copy"><strong>{game.title}</strong><small>{game.releaseLabel}</small></span>
              <span className="rise-delta">▲ {game.delta}</span>
              <span className="rise-score">{game.previous} → {game.current}</span>
              <ArrowIcon/>
            </Link>)}
          </div>
        : <Collecting title="아직 추세를 말할 만큼 쌓이지 않았어요" days={momentumMaturity.days} readyAt={momentumMaturity.readyAt} unit="일치"/>}
    </section>

    <section className="content-section">
      <SectionHeading eyebrow="관측" title="조용해진 기대작"/>
      <p className="section-note">
        꾸준히 소식을 올리던 미출시작이 평소보다 오래 말이 없는 경우입니다.
        연기될 것이라는 뜻은 아닙니다 — 개발을 접은 팀도, 그냥 조용한 팀도 같은 모습입니다.
        관측한 사실만 적으니 판단은 직접 하세요.
      </p>
      {silentGames.length > 0
        ? <div className="silence-list">
            {silentGames.map((g) => <Link className="silence-row" href={`/games/${g.slug}`} key={g.slug}>
              <span className="silence-copy">
                <strong>{g.title}</strong>
                <small>{g.releaseLabel} · 마지막 소식 {g.lastNewsAt}</small>
              </span>
              <span className="silence-rhythm">
                평소 <b>{g.typicalGapDays}일</b>마다
                <small>소식 {g.newsCount}건 기준</small>
              </span>
              <span className="silence-days"><b>{g.silentDays}</b>일째</span>
            </Link>)}
          </div>
        : <div className="empty-panel"><strong>지금은 눈에 띄게 조용해진 게임이 없어요.</strong></div>}
    </section>

    <section className="content-section">
      <SectionHeading eyebrow="출시일" title="일정이 바뀐 게임"/>
      {recentChanges.length > 0
        ? <div className="change-list">
            {recentChanges.map((change, index) => <Link className="change-row" href={`/games/${change.slug}`} key={`${change.slug}-${index}`}>
              <span className={`change-tag ${change.changeType === "DELAY" ? "delay" : ""}`}>{changeLabels[change.changeType] ?? change.changeType}</span>
              <span className="change-copy">
                <strong>{change.title}</strong>
                <small>{change.previousDate} → {change.newDate} · {change.platform}</small>
              </span>
              <span className="change-shift">{change.shiftDays > 0 ? `+${change.shiftDays}일` : `${change.shiftDays}일`}</span>
            </Link>)}
          </div>
        : <Collecting title="아직 일정이 바뀐 게임이 없어요" days={delayMaturity.days} readyAt={delayMaturity.readyAt} unit="건"/>}
    </section>

    {studios.length > 0 && <section className="content-section">
      <SectionHeading eyebrow="개발사" title="일정을 얼마나 지키나"/>
      <p className="section-note">추적을 시작한 뒤의 변경만 셉니다. 그 전 이력은 포함되지 않습니다.</p>
      <div className="rate-list">
        {studios.map((studio) => <div className="rate-row" key={studio.studio}>
          <span className="rate-name">{studio.studio}</span>
          <span className="rate-value">{studio.delays}회 연기</span>
          <small className="rate-sample">추적 {studio.trackedGames}작 · 평균 {studio.averageShiftDays > 0 ? "+" : ""}{studio.averageShiftDays}일</small>
        </div>)}
      </div>
    </section>}
  </main>;
}
