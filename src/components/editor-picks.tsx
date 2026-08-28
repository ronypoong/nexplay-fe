import Link from "next/link";
import { GameArt } from "@/components/game-art";
import { ArrowIcon } from "@/components/icons";
import type { EditorPick } from "@/lib/types";

/**
 * 다른 목록은 전부 점수와 날짜로 정렬된다. 여기만 사람이 고르고 이유를 남긴다.
 * 고른 게 없으면 빈 카드로 채우지 않고 섹션 자체를 숨긴다.
 */
export function EditorPicks({ picks }: { picks: EditorPick[] }) {
  if (picks.length === 0) return null;
  const [lead, ...rest] = picks;
  return <section id="editor-picks" className="content-section shell editor-picks">
    <div className="editor-head">
      <span className="eyebrow">주인장이 눈여겨보는 작품</span>
      <h2>지금 제가 기다리는 게임</h2>
      <p>점수로 뽑은 목록이 아닙니다. 직접 고르고, 왜 기다리는지 적었습니다.</p>
    </div>
    <div className="editor-grid">
      <Link className="editor-lead" href={`/games/${lead.game.slug}`}>
        <GameArt game={lead.game}/>
        <div className="editor-lead-copy">
          {lead.headline && <span className="editor-tag">{lead.headline}</span>}
          <strong>{lead.game.title}</strong>
          <span className="editor-date">{lead.game.releaseLabel}</span>
          <p>{lead.note}</p>
          <span className="feature-link">게임 자세히 보기 <ArrowIcon/></span>
        </div>
      </Link>
      {rest.length > 0 && <div className="editor-rest">
        {rest.map((pick) => <Link className="editor-item" href={`/games/${pick.game.slug}`} key={pick.game.slug}>
          <GameArt game={pick.game}/>
          <span className="editor-item-copy">
            {pick.headline && <small className="editor-tag small">{pick.headline}</small>}
            <strong>{pick.game.title}</strong>
            <p>{pick.note}</p>
          </span>
        </Link>)}
      </div>}
    </div>
  </section>;
}
