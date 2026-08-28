"use client";

import { useCallback, useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_NEXPLAY_API_BASE_URL;
const TOKEN_KEY = "nexplay-admin-token";

/*
 * 관리 토큰은 sessionStorage 에 둔다. localStorage 에 두면 탭을 닫아도 남아,
 * 남의 기기나 공용 브라우저에서 그대로 열린다. 탭을 닫으면 사라지는 편이 낫다.
 */
function readToken() {
  try { return window.sessionStorage.getItem(TOKEN_KEY) ?? ""; } catch { return ""; }
}

type Job = { label: string; path: string; limit?: number; note?: string };

const JOBS: Array<{ group: string; items: Job[] }> = [
  {
    group: "매일 도는 것 (직접 돌리기)",
    items: [
      { label: "공식 소식 수집", path: "/collectors/steam/run", note: "445개 피드 · 5분 넘게 걸려 화면에서는 시간 초과로 보일 수 있음" },
      { label: "Steam 확장 정보", path: "/catalog/steam/extended", limit: 25, note: "소개문·언어·가격·대표 이미지" },
      { label: "카탈로그 동기화", path: "/catalog/wikidata/sync", note: "새 게임 등록 + 구독 확대" },
      { label: "인기 지수 기록", path: "/catalog/popularity/snapshot" },
    ],
  },
  {
    group: "모델을 쓰는 것 (토큰 소모)",
    items: [
      { label: "소식 분류", path: "/events/extract", limit: 20, note: "한국어 요약·유형·잡음 판정" },
      { label: "약속 추출", path: "/promises/extract", limit: 20, note: "발표문에서 약속만" },
      { label: "약속 채점", path: "/promises/resolve", note: "모델을 쓰지 않음 · 공짜" },
    ],
  },
  {
    group: "가끔 하는 것",
    items: [
      { label: "원문 되받기", path: "/collectors/steam/backfill-bodies", limit: 30, note: "본문이 빈 소식 채우기" },
      { label: "위키백과 소개문", path: "/catalog/wikipedia/descriptions", limit: 50 },
      { label: "수상 이력", path: "/awards/sync" },
    ],
  },
];

export function AdminConsole() {
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [missing, setMissing] = useState<Array<Record<string, unknown>>>([]);
  const [covers, setCovers] = useState<Record<string, string>>({});

  useEffect(() => { setToken(readToken()); setReady(true); }, []);

  const say = (line: string) => setLog((prev) => [`${new Date().toLocaleTimeString("ko-KR")} ${line}`, ...prev].slice(0, 40));

  const call = useCallback(async (path: string, init?: RequestInit) => {
    const response = await fetch(`${API}/api/v1/admin${path}`, {
      ...init,
      headers: { ...(init?.headers ?? {}), "X-NEXPLAY-Admin-Token": token },
    });
    const text = await response.text();
    return { ok: response.ok, status: response.status, text };
  }, [token]);

  const loadStatus = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/v1/status`, { cache: "no-store" });
      if (r.ok) setStatus(await r.json());
    } catch { /* 상태를 못 읽어도 나머지는 쓸 수 있다 */ }
  }, []);

  const loadMissing = useCallback(async () => {
    if (!token) return;
    const r = await call("/catalog/games/missing-cover");
    if (r.ok) { try { setMissing(JSON.parse(r.text)); } catch { /* 형식이 다르면 무시 */ } }
    else say(`사진 없는 게임 조회 실패 (${r.status})`);
  }, [call, token]);

  useEffect(() => { loadStatus(); }, [loadStatus]);
  useEffect(() => { if (token) loadMissing(); }, [token, loadMissing]);

  const saveToken = (value: string) => {
    setToken(value);
    try { window.sessionStorage.setItem(TOKEN_KEY, value); } catch { /* 저장 못 해도 이번 탭에서는 쓴다 */ }
  };

  const run = async (job: Job) => {
    if (!token) { say("먼저 관리 토큰을 넣어주세요."); return; }
    setBusy(job.path);
    say(`${job.label} 시작…`);
    const query = job.limit ? `?limit=${job.limit}` : "";
    try {
      const r = await call(`${job.path}${query}`, { method: "POST" });
      say(`${job.label} → ${r.status} ${r.text.slice(0, 160)}`);
      await loadStatus();
      if (job.path.includes("steam/extended")) await loadMissing();
    } catch {
      say(`${job.label} → 응답을 받지 못했습니다. 오래 걸리는 작업은 서버에서 계속 돌고 있을 수 있습니다.`);
    } finally {
      setBusy(null);
    }
  };

  const setCover = async (slug: string) => {
    const url = (covers[slug] ?? "").trim();
    if (!url) return;
    setBusy(slug);
    const r = await call(`/catalog/games/${slug}/cover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    say(`${slug} 이미지 → ${r.status} ${r.text.slice(0, 120)}`);
    if (r.ok) { setCovers((p) => ({ ...p, [slug]: "" })); await loadMissing(); }
    setBusy(null);
  };

  if (!ready) return null;

  const llm = (status?.llmToday ?? {}) as { calls?: number; totalTokens?: number; budget?: number };
  const totals = (status?.totals ?? {}) as Record<string, number>;
  const failed = (status?.failedSteps ?? []) as string[];

  return <div className="console">
    <section className="console-block">
      <h2>관리 토큰</h2>
      <p className="console-note">탭을 닫으면 지워집니다. 공용 기기에서는 쓰지 마세요.</p>
      <div className="console-row">
        <input
          type="password"
          value={token}
          onChange={(event) => saveToken(event.target.value)}
          placeholder="X-NEXPLAY-Admin-Token"
          aria-label="관리 토큰"
        />
        <span className={token ? "console-pill on" : "console-pill"}>{token ? "입력됨" : "없음"}</span>
      </div>
    </section>

    <section className="console-block">
      <h2>지금 상태</h2>
      <div className="console-stats">
        <div><small>게임</small><strong>{totals.games ?? "-"}</strong></div>
        <div><small>소식</small><strong>{totals.events ?? "-"}</strong></div>
        <div><small>보관 원문</small><strong>{totals.archivedBodies ?? "-"}</strong></div>
        <div><small>약속</small><strong>{totals.promises ?? "-"}</strong></div>
        <div>
          <small>오늘 모델</small>
          <strong>{(llm.totalTokens ?? 0).toLocaleString()}</strong>
          <span>{llm.calls ?? 0}회 · 상한 {(llm.budget ?? 0).toLocaleString()}</span>
        </div>
        <div>
          <small>마지막 동기화</small>
          <strong>{status?.lastSuccessAt ? `${status.hoursSinceSuccess}시간 전` : "기록 없음"}</strong>
          {status?.stale === true && <span className="console-warn">밀려 있음</span>}
        </div>
      </div>
      {failed.length > 0 && <p className="console-warn">실패한 단계: {failed.join(", ")}</p>}
    </section>

    {JOBS.map((group) => <section className="console-block" key={group.group}>
      <h2>{group.group}</h2>
      <div className="console-jobs">
        {group.items.map((job) => <div className="console-job" key={job.path}>
          <div>
            <strong>{job.label}</strong>
            {job.note && <small>{job.note}</small>}
          </div>
          <button type="button" onClick={() => run(job)} disabled={busy !== null}>
            {busy === job.path ? "도는 중…" : job.limit ? `실행 (${job.limit}건)` : "실행"}
          </button>
        </div>)}
      </div>
    </section>)}

    <section className="console-block">
      <h2>사진 없는 게임 ({missing.length})</h2>
      <p className="console-note">
        Steam 에 없거나 어느 지역에서도 안 열리는 게임입니다. 스토어나 공식 페이지의 이미지 주소를 넣어주세요(https 만).
      </p>
      {missing.length === 0
        ? <p className="console-note">없습니다.</p>
        : <div className="console-missing">
            {missing.map((game) => {
              const slug = String(game.slug);
              return <div key={slug}>
                <div><strong>{String(game.title)}</strong><small>{slug}{game.steam_app_id ? ` · steam ${game.steam_app_id}` : " · 스팀 없음"}</small></div>
                <input
                  value={covers[slug] ?? ""}
                  onChange={(event) => setCovers((p) => ({ ...p, [slug]: event.target.value }))}
                  placeholder="https://..."
                  aria-label={`${game.title} 이미지 주소`}
                />
                <button type="button" onClick={() => setCover(slug)} disabled={busy !== null || !(covers[slug] ?? "").trim()}>저장</button>
              </div>;
            })}
          </div>}
    </section>

    <section className="console-block">
      <h2>기록</h2>
      {log.length === 0 ? <p className="console-note">아직 실행한 것이 없습니다.</p>
        : <ol className="console-log">{log.map((line, index) => <li key={index}>{line}</li>)}</ol>}
    </section>
  </div>;
}
