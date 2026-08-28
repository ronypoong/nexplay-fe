"use client";

import { useMemo, useState } from "react";
import type { GameCard as GameCardData } from "@/lib/types";
import { GameCard } from "./game-card";
import { SearchIcon } from "./icons";

export function SearchView({ games }: { games: GameCardData[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return games;
    return games.filter((game) => [game.title, game.developer, game.publisher, ...game.genres, ...game.platforms].some((value) => value.toLowerCase().includes(normalized)));
  }, [games, query]);
  return <>
    <label className="search-field"><SearchIcon size={25}/><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="게임, 개발사, 장르를 검색하세요"/><kbd>ESC</kbd></label>
    <div className="popular-searches"><span>인기 검색</span>{["오픈월드", "협동", "Switch 2", "2026 기대작"].map((term) => <button key={term} onClick={() => setQuery(term)}>{term}</button>)}</div>
    <div className="result-meta"><span>{query ? <><strong>{results.length}</strong>개의 검색 결과</> : "지금 주목받는 게임"}</span></div>
    {results.length ? <div className="card-grid discover-card-grid">{results.map((game) => <GameCard key={game.id} game={game}/>)}</div> : <div className="empty-panel"><strong>“{query}” 검색 결과가 없어요.</strong><p>게임명이나 장르를 조금 다르게 입력해보세요.</p></div>}
  </>;
}
