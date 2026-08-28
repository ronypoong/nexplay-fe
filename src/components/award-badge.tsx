import type { AwardBadge as AwardBadgeData } from "@/lib/types";

/**
 * 수상 배지.
 *
 * 한 게임이 여러 기록을 가질 수 있어 서버가 가장 무게 있는 것 하나만 골라 보낸다
 * (GOTY 수상 > GOTY 후보 > 최고 기대작). 카드에 배지를 여러 개 달면 정작
 * 제목이 안 보인다.
 */
export function AwardBadge({ badge, compact = false }: { badge?: AwardBadgeData | null; compact?: boolean }) {
  if (!badge) return null;
  return (
    <span className={`award-badge ${compact ? "compact" : ""}`} data-kind={badge.kind}>
      {badge.kind === "GOTY_WINNER" && <b aria-hidden="true">★</b>}
      {badge.label}
      <small>{badge.year}</small>
    </span>
  );
}
