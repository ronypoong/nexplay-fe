import { api } from "@/lib/api";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * 공식 소식 RSS.
 *
 * 만드는 데 드는 것이 거의 없는데 얻는 것이 둘이다. 피드 리더를 쓰는 사람은
 * 한 번 구독하면 다시 찾아오고, 다른 사이트가 이 사이트를 인용할 접점이 생긴다.
 *
 * 본문은 모델이 뽑은 한국어 한 줄을 먼저 쓴다. 원문이 영어·일본어면 그게 없을
 * 때 제목만 남으므로 summary 로 물러선다. 원문 링크는 반드시 함께 낸다 —
 * 우리가 쓴 글이 아니라 게임사의 발표다.
 */
const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[char] as string));

export async function GET() {
  // 백엔드가 죽어도 피드는 빈 채로 나가는 편이 낫다. 500 은 구독을 끊는다.
  const events = await api.events(0).catch(() => []);
  const items = events.slice(0, 40).map((event) => {
    const link = `${SITE_URL}/games/${event.gameSlug}`;
    const body = [event.summaryKo || event.summary, event.sourceUrl ? `원문: ${event.sourceUrl}` : null]
      .filter(Boolean)
      .join("\n\n");
    return `    <item>
      <title>${escapeXml(event.game?.title ? `${event.game.title} · ${event.title}` : event.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">nexplay-event-${escapeXml(event.id)}</guid>
      <pubDate>${new Date(`${event.date}T00:00:00+09:00`).toUTCString()}</pubDate>
      <description>${escapeXml(body)}</description>
      <source url="${escapeXml(`${SITE_URL}/feed.xml`)}">${escapeXml(event.source)}</source>
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${SITE_NAME} — 공식 소식`)}</title>
    <link>${SITE_URL}/news</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ko</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // 소식은 하루 한 번 들어온다. 리더가 10분마다 두드려도 원본까지 가지 않게 둔다.
      "Cache-Control": "public, max-age=600",
    },
  });
}
