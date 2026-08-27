import type { Metadata } from "next";
import { api } from "@/lib/api";
export const dynamic = "force-dynamic";
import { SearchView } from "@/components/search-view";

export const metadata: Metadata = { title: "검색" };

export default async function SearchPage() {
  const games = await api.games();
  return <main className="page-shell shell search-page"><div className="page-hero compact"><span className="eyebrow">통합 검색</span><h1>무엇을 찾고 있나요?</h1></div><SearchView games={games}/></main>;
}
