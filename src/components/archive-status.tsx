import { api } from "@/lib/api";

/**
 * 이 아카이브가 언제 갱신됐는지.
 *
 * 데이터를 파는 화면이 아니라 데이터를 모으는 화면이라, 언제 모았는지가 곧
 * 신뢰의 근거다. 갱신이 밀리면 그것도 그대로 보인다 — 숨기면 우리만 모른다.
 */
export async function ArchiveStatus() {
  const status = await api.status().catch(() => null);
  if (!status) return null;

  const totals = status.totals ?? {};
  const counted = `게임 ${totals.games ?? 0} · 소식 ${totals.events ?? 0} · 보관 원문 ${totals.archivedBodies ?? 0} · 약속 ${totals.promises ?? 0}`;

  // 기록이 아직 없는 것과 갱신이 밀린 것은 다르다. 섞어서 말하면 둘 다 못 믿게 된다.
  const when = status.hoursSinceSuccess == null
    ? "갱신 기록 준비 중"
    : status.hoursSinceSuccess < 1
      ? "방금 갱신"
      : `${status.hoursSinceSuccess}시간 전 갱신`;

  return <p className="archive-status">
    <span>{counted}</span>
    <span className={status.stale && status.hoursSinceSuccess != null ? "archive-stale" : undefined}>{when}</span>
  </p>;
}
