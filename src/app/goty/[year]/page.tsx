import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

/**
 * 한 해의 올해의 게임.
 *
 * 아카이브 전체가 /goty 한 장에 들어 있었다. 2014~2025년 열두 해가 URL 하나를
 * 나눠 쓰는 셈이라, "2019 goty" 나 "2016 올해의 게임" 처럼 해를 찍어 찾는 사람이
 * 닿을 곳이 없었다. 해마다 한 장씩 세운다.
 *
 * 수상·후보는 Wikidata 에서 확인한 The Game Awards 올해의 게임 부문만 쓴다.
 * 최고 기대작 부문은 성격이 달라 섞지 않는다 — 섞으면 "수상" 의 뜻이 흐려진다.
 */
async function loadYear(yearText: string) {
  if (!/^\d{4}$/.test(yearText)) notFound();
  const year = Number(yearText);
  const { winners, nominees } = await api.goty();
  const winner = winners.find((row) => row.awardYear === year);
  const shortlist = nominees.filter((row) => row.awardYear === year);
  if (!winner && shortlist.length === 0) notFound();
  const years = [...new Set([...winners, ...nominees].map((row) => row.awardYear))].sort((a, b) => a - b);
  return { year, winner, shortlist, years };
}

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }): Promise<Metadata> {
  const { year: yearText } = await params;
  const { year, winner, shortlist } = await loadYear(yearText);
  // 수상작 이름을 설명에 넣는다. 해마다 다른 문장이 되고, 검색 결과에서도
  // "그래서 뭐가 받았는데" 에 바로 답한다.
  const summary = winner
    ? `${year}년 The Game Awards 올해의 게임은 ${winner.title}입니다. 함께 후보에 오른 ${shortlist.length}개 작품과 출처를 확인하세요.`
    : `${year}년 The Game Awards 올해의 게임 후보 ${shortlist.length}개를 정리했습니다.`;
  return {
    title: `${year}년 올해의 게임`,
    description: summary,
    alternates: { canonical: `/goty/${year}` },
  };
}

export default async function GotyYearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year: yearText } = await params;
  const { year, winner, shortlist, years } = await loadYear(yearText);
  const previous = years.filter((value) => value < year).pop();
  const next = years.find((value) => value > year);

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">{year}년 The Game Awards</span>
      <h1>{year}년 올해의 게임</h1>
      <p>
        Wikidata 에서 확인한 The Game Awards 올해의 게임 부문 기록입니다.
        {" "}다른 해는 <Link href="/goty">GOTY 아카이브</Link>에서 봅니다.
      </p>
    </div>

    {winner && <section className="content-section">
      <div className="goty-winner goty-winner-hero">
        <span className="goty-badge">수상</span>
        {winner.slug
          ? <Link href={`/games/${winner.slug}`}><strong>{winner.title}</strong> <ArrowIcon/></Link>
          : <strong>{winner.title}</strong>}
      </div>
    </section>}

    {shortlist.length > 0 && <section className="content-section">
      <div className="section-heading"><div><span className="eyebrow">함께 후보에 오른 작품</span><h2>{year}년 후보 {shortlist.length}개</h2></div></div>
      <ul className="goty-nominees goty-nominees-page">
        {shortlist.map((row) => <li key={`${year}-${row.title}`}>
          {row.slug ? <Link href={`/games/${row.slug}`}>{row.title}</Link> : row.title}
        </li>)}
      </ul>
    </section>}

    <nav className="year-hops" aria-label="다른 해">
      {previous && <Link href={`/goty/${previous}`}>{previous}년 올해의 게임</Link>}
      {next && <Link href={`/goty/${next}`}>{next}년 올해의 게임</Link>}
      <Link href="/goty">전체 아카이브</Link>
    </nav>

    <p className="section-note goty-source">출처: Wikidata · The Game Awards</p>
  </main>;
}
