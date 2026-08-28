"use client";

import { useEffect, useRef, useState } from "react";
import type { GameCard as GameCardData } from "@/lib/types";
import { GameCard } from "./game-card";

export function TrendingCarousel({ games }: { games: GameCardData[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canGoPrevious, setCanGoPrevious] = useState(false);
  const [canGoNext, setCanGoNext] = useState(games.length > 4);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const updateNavigation = () => {
      setCanGoPrevious(track.scrollLeft > 8);
      setCanGoNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 8);
    };
    const resizeObserver = new ResizeObserver(updateNavigation);
    resizeObserver.observe(track);
    track.addEventListener("scroll", updateNavigation, { passive: true });
    return () => {
      resizeObserver.disconnect();
      track.removeEventListener("scroll", updateNavigation);
    };
  }, []);

  function move(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.max(track.clientWidth * 0.82, 280), behavior: "smooth" });
  }

  return <div className="trending-carousel">
    <div className="trending-track" ref={trackRef}>
      {games.slice(0, 10).map((game, index) => <GameCard key={game.id} game={game} rank={index + 1}/>) }
    </div>
    <div className="carousel-controls" aria-label="주목받는 게임 이동">
      <button className="previous" type="button" aria-label="이전 게임 보기" disabled={!canGoPrevious} onClick={() => move(-1)}>←</button>
      <button className="next" type="button" aria-label="다음 게임 보기" disabled={!canGoNext} onClick={() => move(1)}>→</button>
    </div>
  </div>;
}
