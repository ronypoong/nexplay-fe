import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "한국어 지원이 새로 잡힌 게임",
  description: "없던 한국어가 붙은 게임과, 언어 지원을 새로 확인한 게임을 최근 순으로 봅니다. Steam 스토어의 언어 목록을 매일 다시 보고 달라진 것만 남깁니다.",
  alternates: { canonical: "/korean/recent" },
};

/**
 * 한국어 지원이 새로 잡힌 게임.
 *
 * 이 사이트가 스팀을 이길 수 있는 몇 안 되는 화면이다. 스팀은 지금 상태만
 * 보여주고 "언제 한국어가 붙었는지" 는 남기지 않는다. 우리는 매일 언어 목록을
 * 다시 보고 달라진 것을 기록하므로 그 질문에 답할 수 있다.
 *
 * 다만 "붙었다"(ADDED)와 "처음 확인했다"(CONFIRMED)는 다른 말이다. 8월 말 첫
 * 수집은 전부 CONFIRMED 이고, 그걸 "한국어 추가" 라고 적으면 거짓말이 된다.
 * 둘을 갈라 놓고, 진짜 추가가 생기면 그것만 위에 세운다.
 */
export default async function KoreanRecentPage() {
  const changes = await api.koreanRecent(80);
  const added = changes.filter((row) => row.changeType === "ADDED");
  const confirmed = changes.filter((row) => row.changeType === "CONFIRMED");

  const rows = (list: typeof changes) => <ol className="game-index">
    {list.map((row) => <li key={`${row.slug}-${row.observedOn}`}>
      <Link href={`/games/${row.slug}`}>
        <strong>{row.title}</strong>
        <small>
          {row.publisher || "제작사 미상"} · {row.releaseLabel || "출시일 미정"} · {row.observedOn}
          {row.audioSupported ? " · 한국어 음성" : " · 한국어 자막"}
        </small>
      </Link>
    </li>)}
  </ol>;

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">한국어 지원</span>
      <h1>한국어가 새로 생긴 게임</h1>
      <p>
        Steam 스토어의 언어 목록을 다시 보고 달라진 것만 남깁니다.
        {" "}지금 한국어로 할 수 있는 게임 전부는 <Link href="/korean/games">한국어 지원 게임 목록</Link>에 있습니다.
      </p>
    </div>

    <section className="content-section">
      <div className="section-heading"><div><span className="eyebrow">없던 한국어가 붙음</span><h2>한국어가 추가됐습니다</h2></div></div>
      {added.length > 0
        ? rows(added)
        : <div className="empty-panel">
            <strong>아직 추가로 확인된 게임이 없어요.</strong>
            <p>한국어가 없던 게임에 한국어가 붙는 순간만 여기 올립니다. 없는 날을 채우지는 않습니다.</p>
          </div>}
    </section>

    {confirmed.length > 0 && <section className="content-section">
      <div className="section-heading"><div><span className="eyebrow">처음 확인함</span><h2>한국어 지원을 새로 확인했습니다</h2></div></div>
      <p className="radar-note">게임이 바뀐 것이 아니라, 저희가 그 게임의 언어를 처음 들여다본 날입니다.</p>
      {rows(confirmed)}
    </section>}
  </main>;
}
