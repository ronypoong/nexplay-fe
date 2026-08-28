"use client";

import { useMemo, useState } from "react";
import type { GameCard as GameCardData, Platform } from "@/lib/types";
import { GameCard } from "./game-card";

const platforms: Array<"전체" | Platform> = ["전체", "PC", "PS5", "Xbox", "Switch 2", "미정"];

export function DiscoverGrid({ games }: { games: GameCardData[] }) {
  const [platform, setPlatform] = useState<(typeof platforms)[number]>("전체");
  const [genre, setGenre] = useState("전체 장르");
  const [mode, setMode] = useState("전체 모드");
  const [koreanOnly, setKoreanOnly] = useState(false);
  const genres = useMemo(() => Array.from(new Set(games.flatMap((game) => game.genres))).sort(), [games]);
  const modes = useMemo(() => Array.from(new Set(games.flatMap((game) => game.gameModes ?? []))).sort(), [games]);
  const filtered = useMemo(() => games.filter((game) =>
    (platform === "전체" || game.platforms.includes(platform)) &&
    (genre === "전체 장르" || game.genres.includes(genre)) &&
    (mode === "전체 모드" || game.gameModes?.includes(mode)) &&
    (!koreanOnly || game.koreanTextSupported === true)
  ), [games, platform, genre, mode, koreanOnly]);
  return <>
    <div className="filter-bar"><div className="chip-group" role="group" aria-label="플랫폼 필터">{platforms.map((item) => <button key={item} className={platform === item ? "selected" : ""} onClick={() => setPlatform(item)}>{item}</button>)}</div><div className="select-filters"><select aria-label="장르" value={genre} onChange={(event) => setGenre(event.target.value)}><option>전체 장르</option>{genres.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="게임 모드" value={mode} onChange={(event) => setMode(event.target.value)}><option>전체 모드</option>{modes.map((item) => <option key={item}>{item}</option>)}</select><button className={koreanOnly ? "selected compact-filter" : "compact-filter"} onClick={() => setKoreanOnly((value) => !value)}>한국어 지원</button></div></div>
    <div className="result-meta"><span><strong>{filtered.length}</strong>개의 게임</span><span>2026 신작 우선</span></div>
    {filtered.length ? <div className="card-grid discover-card-grid">{filtered.map((game) => <GameCard key={game.id} game={game}/>)}</div> : <div className="empty-panel"><strong>조건에 맞는 게임이 없어요.</strong><p>다른 플랫폼이나 장르를 선택해보세요.</p></div>}
  </>;
}
