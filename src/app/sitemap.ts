import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { SITE_URL } from "@/lib/site";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const fixed: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/discover`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/korean`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/trends`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/goty`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...calendarMonths().map((month) => ({
      url: `${SITE_URL}/releases/${month}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];

  // 백엔드가 죽어도 사이트맵은 나가야 한다. 고정 경로라도 색인되는 편이 낫다.
  const games = await api.games().catch(() => []);
  return [
    ...fixed,
    ...games.map((game) => ({
      url: `${SITE_URL}/games/${game.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: game.featured ? 0.8 : 0.6,
    })),
  ];
}
