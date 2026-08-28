import type { Metadata } from "next";
import { AdminConsole } from "./admin-console";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "관리 콘솔",
  // 색인하지 않는다. 토큰이 없으면 아무것도 못 하지만, 검색에 뜰 이유도 없다.
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">관리 콘솔</span>
      <h1>수집과 상태</h1>
      <p>토큰이 있어야 동작합니다. 토큰은 이 탭에만 남고 닫으면 지워집니다.</p>
    </div>
    <AdminConsole/>
  </main>;
}
