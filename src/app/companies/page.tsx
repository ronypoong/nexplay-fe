import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { SectionHeading } from "@/components/section-heading";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "개발사와 퍼블리셔",
  description: "카탈로그에 있는 게임을 만든 곳과 낸 곳을 모았습니다. 회사 하나를 열면 그 회사의 게임을 한 번에 볼 수 있습니다.",
  alternates: { canonical: "/companies" },
};

const typeLabels: Record<string, string> = { DEVELOPER: "개발사", PUBLISHER: "퍼블리셔", MIXED: "개발 · 배급" };

/**
 * 등록된 회사는 1,900곳인데 그중 1,500곳이 게임 한 편짜리다.
 *
 * 전부 세우면 훑어볼 수 없는 전화번호부가 되므로 두 편 이상만 받는다.
 * 한 편짜리 회사는 게임 상세에서 이름으로 닿을 수 있고, 검색에도 남아 있다.
 */
export default async function CompaniesPage() {
  const companies = await api.companies(2);
  const major = companies.filter((company) => company.major);
  const rest = companies.filter((company) => !company.major);

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">개발사 · 퍼블리셔</span>
      <h1>누가 만들고 누가 내는가</h1>
      <p>카탈로그의 게임을 만든 곳과 낸 곳입니다. 회사를 열면 그곳의 게임을 한 번에 볼 수 있습니다.</p>
    </div>

    {companies.length === 0
      ? <div className="empty-panel"><strong>아직 보여 줄 회사가 없어요.</strong><p>카탈로그가 채워지면 회사도 함께 쌓입니다.</p></div>
      : <>
        <p className="radar-note">게임을 두 편 이상 가진 {companies.length}곳입니다. 한 편만 있는 곳은 게임 상세와 검색에서 찾을 수 있습니다.</p>

        {major.length > 0 && <section className="content-section">
          <SectionHeading eyebrow="주요 회사" title="이름만 들어도 아는 곳"/>
          <div className="company-grid">
            {major.map((company) => <Link className="company-card" href={`/companies/${company.slug}`} key={company.slug}>
              <strong>{company.name}</strong>
              <small>{typeLabels[company.type] ?? "회사"}{company.country ? ` · ${company.country}` : ""}</small>
              <span className="company-count">{company.gameCount}편</span>
            </Link>)}
          </div>
        </section>}

        {rest.length > 0 && <section className="content-section">
          <SectionHeading eyebrow="그 밖의 회사" title="게임 수가 많은 순서"/>
          <div className="company-grid">
            {rest.map((company) => <Link className="company-card" href={`/companies/${company.slug}`} key={company.slug}>
              <strong>{company.name}</strong>
              <small>{typeLabels[company.type] ?? "회사"}{company.country ? ` · ${company.country}` : ""}</small>
              <span className="company-count">{company.gameCount}편</span>
            </Link>)}
          </div>
        </section>}
      </>}
  </main>;
}
