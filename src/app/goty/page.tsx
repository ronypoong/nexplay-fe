import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { SectionHeading } from "@/components/section-heading";
import { ArrowIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "GOTY 아카이브",
  description: "The Game Awards 올해의 게임 수상작과 후보를 연도별로 봅니다. 올해 눈여겨볼 작품도 이력에 근거해 함께 정리했습니다.",
  alternates: { canonical: "/goty" },
};

export default async function GotyPage() {
  const { winners, nominees, watchlist } = await api.goty();
  const byYear = new Map<number, { winner?: typeof winners[number]; nominees: typeof nominees }>();
  for (const w of winners) byYear.set(w.awardYear, { ...(byYear.get(w.awardYear) ?? { nominees: [] }), winner: w });
  for (const n of nominees) {
    const entry = byYear.get(n.awardYear) ?? { nominees: [] };
    entry.nominees = [...entry.nominees, n];
    byYear.set(n.awardYear, entry);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">GOTY 아카이브</span>
      <h1>올해의 게임은 무엇이었나</h1>
      <p>The Game Awards 올해의 게임 수상작과 후보입니다. Wikidata 에서 확인한 기록이며, 각 항목에 출처를 답니다.</p>
    </div>

    {watchlist.length > 0 && <section className="content-section">
      <SectionHeading eyebrow="올해" title="눈여겨볼 작품"/>
      <p className="section-note">예측이 아닙니다. 확인 가능한 이력만 근거로 골랐고, 왜 올랐는지 각 카드에 적었습니다.</p>
      <div className="forecast-grid">
        {watchlist.map((item) => <Link className="forecast-card" href={`/games/${item.slug}`} key={item.slug}>
          <strong>{item.title}</strong>
          <small>{item.releaseLabel}</small>
          <p>{item.reason}</p>
        </Link>)}
      </div>
    </section>}

    {years.length > 0 ? <section className="content-section">
      <SectionHeading eyebrow="역대" title="연도별 수상작과 후보"/>
      <div className="goty-years">
        {years.map((year) => {
          const entry = byYear.get(year)!;
          return <article className="goty-year" key={year}>
            <h3>{year}</h3>
            {entry.winner && <div className="goty-winner">
              <span className="goty-badge">수상</span>
              {entry.winner.slug
                ? <Link href={`/games/${entry.winner.slug}`}><strong>{entry.winner.title}</strong> <ArrowIcon/></Link>
                : <strong>{entry.winner.title}</strong>}
            </div>}
            {entry.nominees.length > 0 && <ul className="goty-nominees">
              {entry.nominees.map((n) => <li key={`${year}-${n.title}`}>
                {n.slug ? <Link href={`/games/${n.slug}`}>{n.title}</Link> : n.title}
              </li>)}
            </ul>}
          </article>;
        })}
      </div>
      <p className="section-note goty-source">출처: Wikidata · The Game Awards</p>
    </section> : <div className="empty-panel">
      <strong>아직 수상 기록을 모으는 중이에요.</strong>
      <p>Wikidata 동기화가 끝나면 연도별 수상작과 후보가 여기에 표시됩니다.</p>
    </div>}
  </main>;
}
