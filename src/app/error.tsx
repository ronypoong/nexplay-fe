"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * 데이터를 못 불러왔을 때.
 *
 * 이게 없으면 화면이 통째로 비고 500 만 남는다. 백엔드는 배포할 때마다 90초쯤
 * 자리를 비우는데, 그동안 들어온 사람에게는 사이트가 죽은 것으로 보인다.
 *
 * 무슨 일인지 적고, 다시 시도할 길을 준다. 헤더와 푸터는 레이아웃에 있으므로
 * 여기서 되살릴 필요가 없다 — 이 경계는 본문만 대신한다.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // 브라우저 콘솔에라도 남겨야 나중에 무엇이 터졌는지 물어볼 수 있다.
    console.error("NEXPLAY page error", error);
  }, [error]);

  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">잠시 문제가 있었어요</span>
      <h1>데이터를 불러오지 못했습니다</h1>
      <p>
        서버가 갱신 중이거나 잠시 응답하지 않는 상태입니다. 대개 1~2분이면 돌아옵니다.
        {error.digest && <> 오류 번호 <code>{error.digest}</code></>}
      </p>
    </div>
    <div className="error-actions">
      <button type="button" className="primary-button" onClick={reset}>다시 시도</button>
      <Link className="secondary-button" href="/">홈으로</Link>
    </div>
  </main>;
}
