"use client";

import { BookmarkIcon } from "./icons";
import { isSaved, toggleSaved, useSavedGames } from "@/lib/saved-games";

export function BookmarkButton({ slug, large = false }: { slug: string; large?: boolean }) {
  const saved = useSavedGames();
  const on = isSaved(saved, slug);
  return (
    <button
      type="button"
      className={`bookmark-button ${large ? "large" : ""} ${on ? "saved" : ""}`}
      onClick={() => toggleSaved(slug)}
      aria-pressed={on}
      aria-label={on ? "담아둔 게임에서 빼기" : "담아둔 게임에 넣기"}
    >
      <BookmarkIcon size={large ? 19 : 17} fill={on ? "currentColor" : "none"}/>
      {large && <span>{on ? "담아둔 게임" : "담아두기"}</span>}
    </button>
  );
}
