"use client";

import { useEffect, useState } from "react";
import { SparkIcon } from "./icons";

const API_BASE = process.env.NEXT_PUBLIC_NEXPLAY_API_BASE_URL;

type State = { count: number | null; mine: boolean };

/**
 * "기대돼요".
 *
 * 계정이 없다. 서버가 소금을 섞은 IP 해시로 같은 사람인지만 가른다.
 *
 * 처음 그릴 때는 아무 상태도 모른다. 서버가 그린 HTML 에는 누가 눌렀는지 담길
 * 수 없으므로, 마운트 뒤에 물어본다. 렌더 중에 정하면 서버가 그린 것과 어긋난다.
 */
export function AnticipateButton({ slug }: { slug: string }) {
  const [state, setState] = useState<State | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/api/v1/games/${slug}/anticipate`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d) setState({ count: d.count, mine: d.mine }); })
      .catch(() => { /* 못 물어봐도 버튼은 눌러볼 수 있다 */ });
    return () => { alive = false; };
  }, [slug]);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/games/${slug}/anticipate`, { method: "POST" });
      if (response.status === 429) {
        setMessage("오늘은 여기까지예요. 내일 다시 눌러주세요.");
        return;
      }
      if (!response.ok) {
        setMessage("지금은 기록하지 못했어요. 잠시 후 다시 시도해주세요.");
        return;
      }
      const data = await response.json();
      setState({ count: data.count, mine: data.mine });
    } catch {
      setMessage("지금은 기록하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  };

  return <div className="anticipate">
    <button
      type="button"
      className={`anticipate-button ${state?.mine ? "on" : ""}`}
      onClick={toggle}
      disabled={busy}
      aria-pressed={state?.mine ?? false}
    >
      <SparkIcon size={17}/>
      <span>{state?.mine ? "기대하고 있어요" : "기대돼요"}</span>
      {/* 수가 적을 때는 감춘다. "3명이 기대합니다" 는 없느니만 못하다. */}
      {state?.count != null && <b>{state.count}</b>}
    </button>
    {message && <small className="anticipate-note">{message}</small>}
  </div>;
}
