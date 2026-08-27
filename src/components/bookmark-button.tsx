"use client";

import { useState } from "react";
import { BookmarkIcon } from "./icons";

export function BookmarkButton({ large = false }: { large?: boolean }) {
  const [saved, setSaved] = useState(false);
  return <button className={`bookmark-button ${large ? "large" : ""} ${saved ? "saved" : ""}`} onClick={() => setSaved((value) => !value)} aria-pressed={saved}>
    <BookmarkIcon size={large ? 19 : 17} fill={saved ? "currentColor" : "none"}/>{large && <span>{saved ? "관심 게임 등록됨" : "관심 게임"}</span>}
  </button>;
}
