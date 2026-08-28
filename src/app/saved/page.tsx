import type { Metadata } from "next";
import { api } from "@/lib/api";
import { SectionHeading } from "@/components/section-heading";
import { SavedList } from "./saved-list";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "담아둔 게임",
  description: "관심 있는 게임을 담아두고 한 자리에서 봅니다. 이 목록은 브라우저에만 저장되며 계정이 필요하지 않습니다.",
  alternates: { canonical: "/saved" },
  // 사람마다 다른 화면이라 색인할 것이 없다.
  robots: { index: false, follow: true },
};

export default async function SavedPage() {
  const catalog = await api.games().catch(() => []);
  return <main className="page-shell shell">
    <div className="page-hero compact">
      <span className="eyebrow">담아둔 게임</span>
      <h1>눈여겨보는 것들</h1>
      <p>이 목록은 이 브라우저에만 저장됩니다. 계정도, 로그인도 필요 없습니다.</p>
    </div>
    <section className="content-section">
      <SectionHeading eyebrow="내 목록" title="담아둔 게임"/>
      <SavedList catalog={catalog}/>
    </section>
  </main>;
}
