import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { GAMES_PER_PAGE, SITE_URL } from "@/lib/site";

// 카탈로그가 매일 바뀌므로 사이트맵도 요청 시점에 만든다.
export const dynamic = "force-dynamic";

function calendarMonths(count = 6) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit" })
    .formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1 + index, 1));
    return `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  });
}

/**
 * 날짜까지만 남긴 오늘(서울). 예전에는 `new Date()` 를 2,352줄에 그대로 박아서,
 * 사이트맵을 부를 때마다 모든 URL 이 "방금 바뀌었다" 고 말했다. 고유한 lastmod 가
 * 하나뿐인 사이트맵은 구글이 값을 믿지 않고, 안 바뀐 페이지를 계속 다시 긁는다.
 * 하루 단위로 굳히면 적어도 그날 안에서는 같은 답이 나간다.
 */
function seoulToday() {
  const [date] = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date())
    .split(" ");
  return new Date(`${date}T00:00:00Z`);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = seoulToday();
  const fixed: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: today, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/discover`, lastModified: today, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/korean`, lastModified: today, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/trends`, lastModified: today, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/goty`, lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/promises`, lastModified: today, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/news`, lastModified: today, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/terms`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    ...calendarMonths().map((month) => ({
      url: `${SITE_URL}/releases/${month}`,
      lastModified: today,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];

  // 백엔드가 죽어도 사이트맵은 나가야 한다. 고정 경로라도 색인되는 편이 낫다.
  const games = await api.games().catch(() => []);
  // 전체 목록 페이지. 게임 상세로 가는 유일한 크롤 경로가 회사 상세뿐이었다.
  const indexPages: MetadataRoute.Sitemap = Array.from(
    { length: Math.max(1, Math.ceil(games.length / GAMES_PER_PAGE)) },
    (_, index) => ({
      url: index === 0 ? `${SITE_URL}/games` : `${SITE_URL}/games?page=${index + 1}`,
      lastModified: today,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }),
  );

  return [
    ...fixed,
    ...indexPages,
    // 게임 상세에는 lastmod 를 적지 않는다. 언제 바뀌었는지 모르기 때문이다.
    // 모르는 것을 오늘로 적으면 위에서 없앤 거짓말을 여기서 되살리는 꼴이다.
    ...games.map((game) => ({
      url: `${SITE_URL}/games/${game.slug}`,
      changeFrequency: "weekly" as const,
      priority: game.featured ? 0.8 : 0.6,
    })),
  ];
}
