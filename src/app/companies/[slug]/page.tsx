import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, NexplayNotFoundError } from "@/lib/api";
import { GameCard } from "@/components/game-card";
import { SectionHeading } from "@/components/section-heading";
import { ArrowIcon } from "@/components/icons";
import type { CompanyDetail, GameCard as GameCardData } from "@/lib/types";

const typeLabels: Record<string, string> = { DEVELOPER: "개발사", PUBLISHER: "퍼블리셔", MIXED: "개발 · 배급" };

/** 없는 회사는 500 이 아니라 404 여야 한다. */
async function loadCompany(slug: string): Promise<CompanyDetail> {
  try {
    return await api.company(slug);
  } catch (error) {
    if (error instanceof NexplayNotFoundError) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { company } = await loadCompany(slug);
    return {
      title: company.name,
      description: `${company.name}의 게임 ${company.gameCount}편을 모았습니다. 출시 일정과 지수를 한 번에 확인하세요.`,
      alternates: { canonical: `/companies/${company.slug}` },
    };
  } catch {
    return { title: "회사" };
  }
}

/*
 * 아직 안 나온 게임을 위에 둔다. 이 화면에 오는 이유는 대개 "이 회사가 다음에
 * 뭘 내나"이지 예전에 뭘 냈나가 아니다.
 *
 * 출시 예정끼리는 가까운 날짜가 먼저다. 이미 나온 것끼리는 최근 것이 먼저다.
 * 날짜를 모르는 것(TBA)은 예정 중에서도 뒤로 보낸다 — 언제인지 모르는 것을
 * 다음 달에 나올 것보다 위에 두면 목록이 거짓말을 한다.
 */
function forCompanyPage(games: GameCardData[]): GameCardData[] {
  const rank = (game: GameCardData) => (game.status === "Upcoming" ? 0 : game.status === "TBA" ? 1 : 2);
  return [...games].sort((a, b) => {
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    if (a.releaseDate === "TBA" || b.releaseDate === "TBA") return a.releaseDate === "TBA" ? 1 : -1;
    return rank(a) === 2 ? b.releaseDate.localeCompare(a.releaseDate) : a.releaseDate.localeCompare(b.releaseDate);
  });
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { company, developed: rawDeveloped, published: rawPublished } = await loadCompany(slug);
  const developed = forCompanyPage(rawDeveloped);
  const published = forCompanyPage(rawPublished);
  const all = [...developed, ...published];
  const upcoming = all.filter((game) => game.status === "Upcoming").length;

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">{typeLabels[company.type] ?? "회사"}{company.country ? ` · ${company.country}` : ""}</span>
      <h1>{company.name}</h1>
      <p>카탈로그에서 확인한 {company.name}의 게임 {company.gameCount}편입니다.</p>
      {company.officialUrl && <a className="hero-link" href={company.officialUrl} target="_blank" rel="noreferrer">
        공식 사이트 <ArrowIcon size={14}/>
      </a>}
    </div>

    <div className="radar-stats">
      <div><strong>{company.gameCount}</strong><span>카탈로그의 게임</span></div>
      <div><strong>{upcoming}</strong><span>출시 예정</span></div>
      {developed.length > 0 && <div><strong>{developed.length}</strong><span>직접 개발</span></div>}
      {published.length > 0 && <div><strong>{published.length}</strong><span>배급만</span></div>}
    </div>

    {developed.length > 0 && <section className="content-section">
      <SectionHeading eyebrow="개발" title={`${company.name}이(가) 만든 게임`}/>
      <div className="card-grid">
        {developed.map((game) => <GameCard game={game} key={game.slug}/>)}
      </div>
    </section>}

    {published.length > 0 && <section className="content-section">
      <SectionHeading eyebrow="배급" title="다른 곳이 만들고 이 회사가 낸 게임"/>
      <div className="card-grid">
        {published.map((game) => <GameCard game={game} key={game.slug}/>)}
      </div>
    </section>}

    {all.length === 0 && <div className="empty-panel">
      <strong>아직 등록된 게임이 없어요.</strong>
      <p>카탈로그가 채워지면 이 회사의 게임도 함께 쌓입니다.</p>
      <Link className="primary-button" href="/companies">회사 목록으로</Link>
    </div>}
  </main>;
}
