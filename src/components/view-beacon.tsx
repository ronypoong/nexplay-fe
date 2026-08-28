"use client";

import { useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_NEXPLAY_API_BASE_URL;

/**
 * 이 게임을 한 번 봤다고 알린다.
 *
 * 서버 렌더에서 세지 않는 이유가 둘이다. 프론트가 응답을 캐시하므로 사람이 와도
 * 서버는 모르고, 크롤러까지 세게 된다.
 *
 * 같은 탭에서 새로고침한 것은 세지 않는다. 조회수를 부풀리는 가장 쉬운 방법이
 * 자기 화면을 다시 여는 것이라, 그것만 막아도 수가 훨씬 정직해진다.
 */
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `nexplay-viewed:${slug}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // 저장소가 막혀 있으면 중복을 못 막는다. 그래도 세는 편이 안 세는 것보다 낫다.
    }
    fetch(`${API_BASE}/api/v1/games/${slug}/view`, { method: "POST", keepalive: true })
      .catch(() => { /* 조회수는 못 세도 화면은 아무 일 없어야 한다 */ });
  }, [slug]);

  return null;
}
