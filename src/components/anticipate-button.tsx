"use client";

import { useEffect, useState } from "react";
import { SparkIcon } from "./icons";

const API_BASE = process.env.NEXT_PUBLIC_NEXPLAY_API_BASE_URL;
const MAX = 140;

type Reason = { reason: string; writtenAt: string };
type State = { count: number | null; mine: boolean; myReason: string | null; reasons: Reason[] };

/**
 * "기대돼요" 와 그 이유 한 줄.
 *
 * 댓글창이 아니다. 게임 하나에 묶인 한 줄이고 서로 대화하지 않는다.
 * 그래서 싸울 구조가 아니고, 나중에 실제 결과와 대조해 채점할 수 있다 —
 * 게임사의 약속을 기록하고 채점하는 것과 같은 구조다.
 *
 * 처음 그릴 때는 아무 상태도 모른다. 서버가 그린 HTML 에는 누가 눌렀는지 담길
 * 수 없으므로 마운트 뒤에 물어본다. 렌더 중에 정하면 서버가 그린 것과 어긋난다.
 */
export function AnticipateButton({ slug }: { slug: string }) {
  const [state, setState] = useState<State | null>(null);
  const [draft, setDraft] = useState("");
  const [writing, setWriting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/api/v1/games/${slug}/anticipate`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d) return;
        setState(d);
        setDraft(d.myReason ?? "");
      })
      .catch(() => { /* 못 물어봐도 버튼은 눌러볼 수 있다 */ });
    return () => { alive = false; };
  }, [slug]);

  const send = async (reason?: string) => {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/games/${slug}/anticipate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason ?? null }),
      });
      if (response.status === 429) { setMessage("오늘은 여기까지예요. 내일 다시 눌러주세요."); return; }
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        // 400 이면 서버가 왜 막았는지 알려준다. 그대로 보여 주는 편이 친절하다.
        setMessage(data?.message ?? "지금은 기록하지 못했어요. 잠시 후 다시 시도해주세요.");
        return;
      }
      setState(data);
      setDraft(data.myReason ?? "");
      setWriting(false);
    } catch {
      setMessage("지금은 기록하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  };

  const on = state?.mine ?? false;

  return <div className="anticipate">
    <div className="anticipate-row">
      <button
        type="button"
        className={`anticipate-button ${on ? "on" : ""}`}
        onClick={() => send()}
        disabled={busy}
        aria-pressed={on}
      >
        <SparkIcon size={17}/>
        <span>{on ? "기대하고 있어요" : "기대돼요"}</span>
        {/* 수가 적을 때는 감춘다. "3명이 기대합니다" 는 없느니만 못하다. */}
        {state?.count != null && <b>{state.count}</b>}
      </button>
      {on && !writing && <button type="button" className="text-button small" onClick={() => setWriting(true)}>
        {state?.myReason ? "이유 고치기" : "이유 남기기"}
      </button>}
    </div>

    {on && writing && <div className="anticipate-write">
      <input
        value={draft}
        maxLength={MAX}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="왜 기대되나요? (한 줄)"
        aria-label="기대하는 이유"
      />
      <div className="anticipate-write-actions">
        <span className="anticipate-count">{draft.length}/{MAX}</span>
        <button type="button" className="text-button small" onClick={() => { setWriting(false); setDraft(state?.myReason ?? ""); }}>취소</button>
        <button type="button" className="primary-button small" onClick={() => send(draft)} disabled={busy || draft.trim().length < 2}>남기기</button>
      </div>
    </div>}

    {message && <small className="anticipate-note">{message}</small>}

    {state && state.reasons.length > 0 && <ul className="anticipate-reasons">
      {state.reasons.map((r, index) => <li key={`${r.writtenAt}-${index}`}>
        <p>{r.reason}</p>
        <small>{r.writtenAt}</small>
      </li>)}
    </ul>}
  </div>;
}
