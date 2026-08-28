"use client";

import { useState } from "react";
import Image from "next/image";
import type { GameArtRef } from "@/lib/types";

export function GameArt({ game, className = "" }: { game: GameArtRef; className?: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showCover = Boolean(game.coverImageUrl) && !imageFailed;
  return <div className={`game-art ${showCover ? "has-cover" : ""} ${className}`} style={{ "--accent": game.accent, "--accent-2": game.accent2 } as React.CSSProperties}>
    {showCover && <>
      <Image className="art-cover art-cover-backdrop" src={game.coverImageUrl!} alt="" fill sizes="(max-width: 600px) 100vw, 50vw" unoptimized aria-hidden="true"/>
      <Image className="art-cover art-cover-main" src={game.coverImageUrl!} alt="" fill sizes="(max-width: 600px) 50vw, (max-width: 900px) 50vw, 30vw" unoptimized onError={() => setImageFailed(true)}/>
    </>}
    <div className="art-orb art-orb-one"/><div className="art-orb art-orb-two"/>
    <span className="art-grid"/><span className="art-symbol">{game.symbol}</span>
    <div className="art-title"><small>{game.developer}</small><strong>{game.title}</strong></div>
  </div>;
}
