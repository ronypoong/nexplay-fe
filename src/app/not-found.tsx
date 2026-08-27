import Link from "next/link";

export default function NotFound() { return <main className="not-found shell"><span>404</span><h1>이 게임은 아직 발견되지 않았어요.</h1><p>다른 기대작을 둘러보거나 홈으로 돌아가세요.</p><Link className="primary-button" href="/">홈으로 돌아가기</Link></main>; }
