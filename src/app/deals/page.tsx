import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { GameArt } from "@/components/game-art";
import { SectionHeading } from "@/components/section-heading";
import type { Deal } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "지금 할인 중인 게임",
  description: "스팀에서 매일 아침 확인한 한국 가격 기준 할인 목록입니다. 눈여겨볼 만한 게임을 앞에 세웁니다.",
  alternates: { canonical: "/deals" },
};

const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;

/** 몇 시간 전에 본 값인지. 할인은 끝나면 사라지므로 이걸 숨기지 않는다. */
function checkedLabel(iso: string | null) {
  if (!iso) return null;
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hours < 1) return "방금 확인";
  if (hours < 24) return `${hours}시간 전 확인`;
  return `${Math.floor(hours / 24)}일 전 확인`;
}

function DealCard({ deal }: { deal: Deal }) {
  const art = {
    slug: deal.slug,
    title: deal.title,
    developer: deal.developer ?? "",
    coverImageUrl: deal.coverImageUrl,
    accent: deal.accent ?? "#2a63c8",
    accent2: deal.accent ?? "#744dff",
    symbol: deal.symbol ?? deal.title.slice(0, 2),
  };
  return <article className="deal-card">
    <Link href={`/games/${deal.slug}`} className="deal-art">
      <GameArt game={art}/>
      <span className="deal-badge">{deal.discountPercent}%</span>
    </Link>
    <div className="deal-body">
      <Link href={`/games/${deal.slug}`}><h3>{deal.title}</h3></Link>
      {deal.developer && <small>{deal.developer}</small>}
      <div className="deal-price">
        <strong>{won(deal.salePrice)}</strong>
        <s>{won(deal.originalPrice)}</s>
      </div>
      {/* 스토어로 바로 보낸다. 여기서 살 수 있다는 것이 이 화면의 전부다. */}
      <a className="deal-link" href={deal.storeUrl} target="_blank" rel="noopener noreferrer">스토어에서 보기</a>
    </div>
  </article>;
}

/**
 * 다른 목록과 성격이 다른 화면이다.
 *
 * 출시 예정작은 기다리는 것 말고 할 일이 없고 데모는 받아 보면 되는데, 이건
 * 값이 붙어 있고 기간이 끝나면 사라진다. 놓치면 손해라는 점에서 데모·베타와
 * 같은 자리에 있다.
 *
 * 가격은 하루 한 번 스팀에서 받는다. 그래서 "지금 이 값"이라고 장담하지 않고
 * 언제 본 값인지를 적어 둔 다음, 확인은 스토어에서 하도록 링크를 남긴다.
 */
export default async function DealsPage() {
  const { deals, total, maxDiscount, checkedAt } = await api.deals();
  const checked = checkedLabel(checkedAt);
  // 크게 깎인 것과 그냥 싸진 것을 나눈다. 50% 를 넘으면 반값 아래라 성격이 다르다.
  const big = deals.filter((deal) => deal.discountPercent >= 50);
  const rest = deals.filter((deal) => deal.discountPercent < 50);

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">할인</span>
      <h1>지금 할인 중인 게임</h1>
      <p>스팀에서 확인한 한국 가격 기준입니다. 기다리는 목록과 달리 지금 바로 살 수 있지만, 할인은 기간이 끝나면 사라집니다.</p>
    </div>

    {total === 0
      ? <div className="empty-panel"><strong>지금 확인된 할인이 없어요.</strong><p>매일 오전에 가격을 다시 확인합니다.</p></div>
      : <>
        <div className="radar-stats">
          <div><strong>{total}</strong><span>할인 중</span></div>
          <div><strong>{big.length}</strong><span>반값 이하</span></div>
          <div><strong>{maxDiscount}%</strong><span>가장 큰 할인</span></div>
        </div>
        {/* 하루 한 번 본 값이라는 것을 숨기지 않는다. 이미 끝난 할인을 지금도 한다고 말하는 편이 훨씬 나쁘다. */}
        <p className="radar-note">가격은 하루 한 번 확인합니다{checked ? ` (${checked})` : ""}. 그 사이에 끝난 할인이 있을 수 있으니 결제 전에 스토어에서 확인해 주세요.</p>

        {big.length > 0 && <section className="content-section">
          <SectionHeading eyebrow="반값 이하" title="많이 깎였어요"/>
          <div className="deal-grid">{big.map((deal) => <DealCard deal={deal} key={deal.slug}/>)}</div>
        </section>}

        {rest.length > 0 && <section className="content-section">
          <SectionHeading eyebrow="할인 중" title="조금 싸졌어요"/>
          <div className="deal-grid">{rest.map((deal) => <DealCard deal={deal} key={deal.slug}/>)}</div>
        </section>}
      </>}
  </main>;
}
