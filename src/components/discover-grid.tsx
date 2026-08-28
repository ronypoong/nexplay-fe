"use client";

import { useEffect, useMemo, useState } from "react";
import type { GameCard as GameCardData, Platform } from "@/lib/types";
import { GameCard } from "./game-card";

const platforms: Array<"전체" | Platform> = ["전체", "PC", "PS5", "Xbox", "Switch 2", "미정"];

type SortKey = "recommended" | "soonest" | "newest" | "anticipated" | "title";

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: "recommended", label: "추천순" },
  { key: "soonest", label: "출시 임박" },
  { key: "newest", label: "최근 출시" },
  { key: "anticipated", label: "기대순" },
  { key: "title", label: "이름순" },
];

/** 한 번에 그리는 카드 수. 465개를 한꺼번에 그리면 HTML 이 1.5MB 가 된다. */
const PAGE = 36;

/** 출시일이 없는 게임은 정렬 끝으로 보낸다. "미정" 이 맨 앞에 오면 목록이 쓸모없다. */
const FAR_FUTURE = "9999-12-31";

export function DiscoverGrid({ games }: { games: GameCardData[] }) {
  const [platform, setPlatform] = useState<(typeof platforms)[number]>("전체");
  const [genre, setGenre] = useState("전체 장르");
  const [mode, setMode] = useState("전체 모드");
  const [koreanOnly, setKoreanOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [shown, setShown] = useState(PAGE);

  const genres = useMemo(() => Array.from(new Set(games.flatMap((game) => game.genres))).sort(), [games]);
  const modes = useMemo(() => Array.from(new Set(games.flatMap((game) => game.gameModes ?? []))).sort(), [games]);

  const filtered = useMemo(() => {
    const rows = games.filter((game) =>
      (platform === "전체" || game.platforms.includes(platform)) &&
      (genre === "전체 장르" || game.genres.includes(genre)) &&
      (mode === "전체 모드" || game.gameModes?.includes(mode)) &&
      (!koreanOnly || game.koreanTextSupported === true)
    );
    const today = new Date().toISOString().slice(0, 10);
    const date = (game: GameCardData) => (game.releaseDate === "TBA" ? FAR_FUTURE : game.releaseDate);
    switch (sort) {
      // 아직 안 나온 것 중 가장 가까운 순. 이미 나온 것은 뒤로 보낸다.
      case "soonest":
        return [...rows].sort((a, b) => {
          const [x, y] = [date(a), date(b)];
          const ax = x >= today ? 0 : 1;
          const by = y >= today ? 0 : 1;
          return ax !== by ? ax - by : (ax === 0 ? x.localeCompare(y) : y.localeCompare(x));
        });
      case "newest":
        return [...rows].sort((a, b) => date(b).localeCompare(date(a)));
      case "anticipated":
        return [...rows].sort((a, b) => (b.anticipations ?? -1) - (a.anticipations ?? -1) || b.anticipationScore - a.anticipationScore);
      case "title":
        return [...rows].sort((a, b) => a.title.localeCompare(b.title, "ko"));
      default:
        return rows;
    }
  }, [games, platform, genre, mode, koreanOnly, sort]);

  // 조건이 바뀌면 처음부터 다시 본다. 앞에서 200개를 펼쳐 둔 채로 장르를 바꾸면
  // 새 목록도 200개가 펼쳐진 상태로 나와서 무엇이 바뀌었는지 알 수 없다.
  useEffect(() => { setShown(PAGE); }, [platform, genre, mode, koreanOnly, sort]);

  const visible = filtered.slice(0, shown);
  const remaining = filtered.length - visible.length;

  return <>
    <div className="filter-bar">
      <div className="chip-group" role="group" aria-label="플랫폼 필터">
        {platforms.map((item) => <button key={item} type="button" className={platform === item ? "selected" : ""} onClick={() => setPlatform(item)}>{item}</button>)}
      </div>
      <div className="select-filters">
        {/*
          기본 셀렉트는 운영체제 모양이 그대로 나와 나머지와 따로 논다.
          화살표를 직접 그리려면 감싸는 요소가 필요하다 — select 에는 ::after 를
          붙일 수 없다. 감싼 쪽에 그리면 글자색을 따라가므로 테마도 같이 뒤집힌다.
        */}
        <span className="select-shell">
          <select aria-label="장르" value={genre} onChange={(event) => setGenre(event.target.value)}>
            <option>전체 장르</option>{genres.map((item) => <option key={item}>{item}</option>)}
          </select>
        </span>
        <span className="select-shell">
          <select aria-label="게임 모드" value={mode} onChange={(event) => setMode(event.target.value)}>
            <option>전체 모드</option>{modes.map((item) => <option key={item}>{item}</option>)}
          </select>
        </span>
        <span className="select-shell sorted">
          <select aria-label="정렬" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
            {SORTS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
          </select>
        </span>
        <button type="button" className={koreanOnly ? "selected compact-filter" : "compact-filter"} onClick={() => setKoreanOnly((value) => !value)}>한국어 지원</button>
      </div>
    </div>

    <div className="result-meta">
      <span><strong>{filtered.length}</strong>개의 게임</span>
      <span>{visible.length}개 보는 중</span>
    </div>

    {filtered.length
      ? <>
          <div className="card-grid discover-card-grid">{visible.map((game) => <GameCard key={game.id} game={game}/>)}</div>
          {remaining > 0 && <div className="more-row">
            <button type="button" className="secondary-button" onClick={() => setShown((value) => value + PAGE)}>
              {Math.min(remaining, PAGE)}개 더 보기 <small>(남은 {remaining}개)</small>
            </button>
          </div>}
        </>
      : <div className="empty-panel"><strong>조건에 맞는 게임이 없어요.</strong><p>다른 플랫폼이나 장르를 선택해보세요.</p></div>}
  </>;
}
