import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { ACCESSIBILITY_NOTES, ACCESSIBILITY_SLUGS } from "@/lib/accessibility";
import { ArrowIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "접근성 기능으로 게임 찾기",
  description: "난이도 조정, 색상 대체, 자막 옵션, 텍스트 크기 조정 같은 접근성 기능이 확인된 게임을 기능별로 모았습니다. Steam 스토어에서 확인한 항목입니다.",
  alternates: { canonical: "/accessibility" },
};

/**
 * 접근성 기능으로 게임을 찾는 길.
 *
 * 모아 두고도 게임 상세의 작은 칩으로만 쓰고 있었다. 그마저 좁은 화면에서는
 * 숨는 옆 기둥에 있어서, "난이도 조정 되는 게임" 을 찾는 사람이 닿을 방법이
 * 없었다. 수요가 큰 영역은 아니지만 필요한 사람에게는 대안이 없는 정보다.
 */
export default async function AccessibilityPage() {
  const { features, games } = await api.accessibility();

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">접근성</span>
      <h1>이 기능이 있는 게임을 찾습니다</h1>
      <p>Steam 스토어에서 확인한 접근성 항목입니다. 게임 {games.length.toLocaleString("ko-KR")}편에서 확인됐습니다.</p>
    </div>

    {features.length === 0
      ? <div className="empty-panel"><strong>아직 확인된 접근성 정보가 없어요.</strong></div>
      : <div className="record-links accessibility-grid">
        {features.map((item) => {
          const slug = ACCESSIBILITY_SLUGS[item.feature];
          const body = <span>
            <strong>{item.feature}</strong>
            <small>{ACCESSIBILITY_NOTES[item.feature] ?? "Steam 스토어에서 확인한 항목입니다."}</small>
            <small>{item.gameCount.toLocaleString("ko-KR")}편</small>
          </span>;
          // 표에 없는 기능은 전용 주소가 없다. 세어는 주되 링크를 지어내지 않는다.
          return slug
            ? <Link key={item.feature} href={`/accessibility/${slug}`}>{body}<ArrowIcon/></Link>
            : <div key={item.feature} className="accessibility-plain">{body}</div>;
        })}
      </div>}
  </main>;
}
