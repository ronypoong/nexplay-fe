"use client";

/**
 * 레이아웃까지 터졌을 때의 마지막 그물.
 *
 * 이 경계는 레이아웃 밖에 있으므로 html 과 body 를 직접 그려야 한다. 여기서
 * 외부 파일을 참조하면 그것도 못 불러올 수 있으니 최소한의 스타일만 인라인으로 둔다.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="ko">
    <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f5f6fa", color: "#141824" }}>
      <main style={{ maxWidth: 560, margin: "18vh auto", padding: "0 24px" }}>
        <h1 style={{ fontSize: 26, marginBottom: 12 }}>화면을 그리지 못했습니다</h1>
        <p style={{ color: "#525c70", lineHeight: 1.7 }}>
          잠시 후 다시 시도해 주세요. 계속 이러면 알려 주시면 고치겠습니다.
          {error.digest && <> (오류 번호 {error.digest})</>}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{ marginTop: 20, padding: "12px 20px", borderRadius: 4, border: 0, background: "#5326c4", color: "#fff", fontWeight: 700, cursor: "pointer" }}
        >
          다시 시도
        </button>
      </main>
    </body>
  </html>;
}
