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

  /*
   * "이 회사는 한국어를 챙기나", "말한 건 지키나".
   *
   * 둘 다 이미 사이트 어딘가에 있던 숫자다. 한국어 비율은 한국어 레이더에,
   * 약속 성적표는 약속과 결과에 각각 흩어져 있었다. 정작 그 회사를 보러 온
   * 사람이 서 있는 화면에는 없었다. 수집을 더 하는 게 아니라 있는 것을 여기로
   * 모은다.
   *
   * 약속 대조표는 작은 회사까지 다 세지 않는다. 없으면 그 칸을 비운다 —
   * 모르는 것을 0%로 적으면 "약속을 하나도 안 지켰다" 는 말이 된다.
   */
  const checked = all.filter((game) => game.koreanTextSupported != null);
  const koreanSupported = checked.filter((game) => game.koreanTextSupported === true).length;
  const koreanRate = checked.length > 0 ? Math.round((koreanSupported / checked.length) * 100) : null;
  const ledger = await api.promises().catch(() => null);
  const scorecard = ledger?.scorecards.find((row) => row.companyId === company.id) ?? null;
  const judged = scorecard ? scorecard.kept + scorecard.broken + scorecard.superseded : 0;

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

    {(koreanRate !== null || judged > 0) && <section className="content-section company-record">
      <SectionHeading eyebrow="이 회사의 기록" title="한국어와 약속"/>
      <div className="record-pair">
        {koreanRate !== null && <div>
          <span className="record-value">{koreanRate}%</span>
          <strong>한국어 지원률</strong>
          <small>언어를 확인한 {checked.length}편 중 {koreanSupported}편이 한국어를 지원합니다.</small>
          <Link href="/korean">퍼블리셔별 비교 <ArrowIcon size={13}/></Link>
        </div>}
        {scorecard && judged > 0 && <div>
          <span className="record-value">{scorecard.keptRate === null ? "—" : `${Math.round(scorecard.keptRate * 100)}%`}</span>
          <strong>약속 이행률</strong>
          <small>
            판정된 {judged}건 중 지킴 {scorecard.kept} · 어김 {scorecard.broken} · 말 바꿈 {scorecard.superseded}
            {scorecard.medianSlipDays !== null ? ` · 중간 지연 ${scorecard.medianSlipDays}일` : ""}
            {scorecard.pending > 0 ? ` (아직 미정 ${scorecard.pending}건은 제외)` : ""}
          </small>
          <Link href="/promises">약속과 결과 <ArrowIcon size={13}/></Link>
        </div>}
      </div>
    </section>}

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
