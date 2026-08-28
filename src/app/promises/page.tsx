import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { SectionHeading } from "@/components/section-heading";
import type { PromiseRow } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "약속과 결과",
  description: "게임사가 공식 발표에서 한 약속과 실제로 일어난 일을 대조합니다. 출시일이 얼마나 밀렸는지, 한국어 지원 약속이 지켜졌는지 기록으로 남깁니다.",
  alternates: { canonical: "/promises" },
};

const CLAIM_LABEL: Record<PromiseRow["claimType"], string> = {
  RELEASE_DATE: "출시 시점",
  KOREAN_SUPPORT: "한국어 지원",
  CONTENT: "콘텐츠",
  PLATFORM: "플랫폼",
  DEMO: "체험판",
};

const STATUS_LABEL: Record<PromiseRow["status"], string> = {
  KEPT: "지켜짐",
  BROKEN: "어겨짐",
  SUPERSEDED: "미뤄짐",
  PENDING: "판정 전",
};

function years(days: number) {
  if (days < 60) return `${days}일`;
  if (days < 365) return `약 ${Math.round(days / 30)}개월`;
  return `약 ${(days / 365).toFixed(1)}년`;
}

export default async function PromisesPage() {
  const { totals, scorecards, recentSlips, note } = await api.promises();
  const counted = (totals.KEPT ?? 0) + (totals.BROKEN ?? 0) + (totals.SUPERSEDED ?? 0) + (totals.PENDING ?? 0);

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">약속과 결과</span>
      <h1>말한 대로 되었나</h1>
      <p>게임사가 공식 발표에서 &ldquo;하겠다&rdquo;고 한 것과 실제로 일어난 일을 대조합니다. {note}</p>
    </div>

    {counted === 0 ? <section className="content-section">
      <SectionHeading eyebrow="아직" title="모으는 중입니다"/>
      <p className="section-note">
        대조표는 시간이 지나야 채워집니다. 오늘 적은 약속은 오늘 채점할 수 없고, 결말이 나야 비로소 한 줄이 됩니다.
        지금은 발표를 모으는 단계입니다.
      </p>
    </section> : <>
      <section className="content-section">
        <SectionHeading eyebrow="집계" title="지금까지의 판정"/>
        <div className="radar-stats">
          {(["KEPT", "SUPERSEDED", "BROKEN", "PENDING"] as const).map((status) => <div key={status}>
            <strong>{totals[status] ?? 0}</strong>
            <span>{STATUS_LABEL[status]}</span>
          </div>)}
        </div>
      </section>

      {scorecards.length > 0 && <section className="content-section">
        <SectionHeading eyebrow="퍼블리셔" title="약속을 얼마나 지켰나"/>
        <p className="section-note">약속이 3건 이상 쌓인 곳만 싣습니다. 한두 건으로 매긴 점수는 그 자체가 거짓말이기 때문입니다.</p>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr>
              <th scope="col">퍼블리셔</th><th scope="col">약속</th><th scope="col">지킴</th>
              <th scope="col">미뤄짐</th><th scope="col">어김</th><th scope="col">지킨 비율</th><th scope="col">밀린 기간(중앙값)</th>
            </tr></thead>
            <tbody>
              {scorecards.map((card) => <tr key={card.companyId}>
                <th scope="row">{card.name}</th>
                <td>{card.promises}</td>
                <td>{card.kept}</td>
                <td>{card.superseded}</td>
                <td>{card.broken}</td>
                <td>{card.keptRate === null ? <span className="muted">판정 부족</span> : `${Math.round(card.keptRate * 100)}%`}</td>
                <td>{card.medianSlipDays === null ? <span className="muted">—</span> : years(card.medianSlipDays)}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </section>}

      {recentSlips.length > 0 && <section className="content-section">
        <SectionHeading eyebrow="기록" title="가장 오래 밀린 약속"/>
        <div className="promise-list">
          {recentSlips.map((row, index) => <article className="promise-card" key={`${row.gameSlug}-${row.announcedAt}-${index}`}>
            <header>
              <Link href={`/games/${row.gameSlug}`}><strong>{row.gameTitle}</strong></Link>
              <span className={`promise-badge ${row.status.toLowerCase()}`}>{STATUS_LABEL[row.status]}</span>
            </header>
            <p className="promise-claim">
              <span className="promise-type">{CLAIM_LABEL[row.claimType]}</span>
              {row.announcedAt} 발표 &middot; &ldquo;{row.claimedValue}&rdquo;
            </p>
            {row.sourceQuote && <blockquote className="promise-quote">{row.sourceQuote}</blockquote>}
            <footer>
              {row.slipDays !== null && <span className="promise-slip">{years(row.slipDays)} 밀림</span>}
              {row.evidence && <span className="muted">{row.evidence}</span>}
            </footer>
          </article>)}
        </div>
      </section>}
    </>}
  </main>;
}
