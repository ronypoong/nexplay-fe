import type { AccessibilityOverview, Deals, Company, CompanyDetail, GameDetailBundle, EventDetail, SyncStatus, EditorPick, Feed, Game, GameCard, GameEvent, GameMetadata, GameRelease, Goty, KoreanRadar, KoreanSupportChange, PromiseLedger, PromiseRow, Trends } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_NEXPLAY_API_BASE_URL;

/** 백엔드가 404 를 준 경우. 페이지에서 notFound() 로 바꿔 쓰려고 따로 둔다. */
export class NexplayNotFoundError extends Error {
  constructor(path: string) {
    super(`NEXPLAY API 404: ${path}`);
    this.name = "NexplayNotFoundError";
  }
}

/**
 * 백엔드 데이터는 하루 한 번(06:00 KST 동기화) 바뀐다. 관리 화면에서 고친 것은
 * 최대 10분(FRESH_SECONDS) 뒤에 따라온다.
 */
const FRESH_SECONDS = 600;
// 이보다 오래된 저장본은 백그라운드 갱신이 계속 실패했다는 뜻이라 쓰지 않는다.
const STALE_MAX_SECONDS = 86400;

/**
 * 워커의 엣지 캐시. 원본이 미국(Railway)이라 왕복이 0.65초 — 잠들어 있으면
 * 10초 — 인데, 이걸 손님 요청 중에 내면 서버를 아무리 빠르게 해도 그 몫이
 * TTFB 에 그대로 박힌다.
 *
 * `next: { revalidate }` 는 여기서 무동작이다 — OpenNext 에 증분 캐시(R2)를 안
 * 붙였다. 백엔드의 `Cache-Control: public` 도 Cloudflare 가 캐시 룰 없이는 JSON
 * 을 캐시하지 않아 실측 `cf-cache-status: DYNAMIC` 이었다. 그래서 Cache API 로
 * 콜로에 직접 저장한다. 저장소가 엣지 디스크라 워커 메모리를 쓰지 않는다.
 *
 * 신선도가 지난 저장본도 일단 즉시 내주고 갱신은 응답 뒤로 미룬다(waitUntil).
 * Cache API 가 stale-while-revalidate 를 지원하지 않아 만료 시각을 직접 들고
 * 다닌다. 만료를 max-age 로 맡기면 그 순간의 손님이 원본 왕복을 통째로 문다.
 *
 * 로컬 Node 에는 `caches.default` 가 없으므로 있을 때만 쓴다.
 */
type EdgeCache = { match(url: string): Promise<Response | undefined>; put(url: string, response: Response): Promise<void> };
function edgeCache(): EdgeCache | undefined {
  return (globalThis as { caches?: { default?: EdgeCache } }).caches?.default;
}

async function fetchOrigin(url: string, path: string): Promise<string> {
  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 404) throw new NexplayNotFoundError(path);
  if (!response.ok) throw new Error(`NEXPLAY API ${response.status}`);
  return response.text();
}

async function refreshCache(cache: EdgeCache, url: string, path: string): Promise<string> {
  const body = await fetchOrigin(url, path);
  const headers = { "Cache-Control": `public, max-age=${STALE_MAX_SECONDS}`, "Content-Type": "application/json", "x-fetched-at": String(Date.now()) };
  await cache.put(url, new Response(body, { headers })).catch(() => {});
  return body;
}

/** 응답이 나간 뒤에도 갱신이 끊기지 않게 워커 수명에 묶는다. 못 묶으면 흘려보낸다. */
async function afterResponse(task: Promise<unknown>) {
  const guarded = task.catch(() => {});
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    getCloudflareContext().ctx.waitUntil(guarded);
  } catch { /* 워커 밖(로컬 Node)이거나 컨텍스트가 없으면 결과를 보장하지 않는다 */ }
}

async function request<T>(path: string): Promise<T> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_NEXPLAY_API_BASE_URL is required");
  const url = `${API_BASE}${path}`;
  const cache = edgeCache();
  if (!cache) return JSON.parse(await fetchOrigin(url, path)) as T;
  const hit = await cache.match(url).catch(() => undefined);
  if (hit) {
    const ageSeconds = (Date.now() - Number(hit.headers.get("x-fetched-at") ?? 0)) / 1000;
    if (ageSeconds <= STALE_MAX_SECONDS) {
      if (ageSeconds > FRESH_SECONDS) await afterResponse(refreshCache(cache, url, path));
      return (await hit.json()) as T;
    }
  }
  return JSON.parse(await refreshCache(cache, url, path)) as T;
}

export const api = {
  feed: () => request<Feed>("/api/v1/feed"),
  games: (genre?: string) =>
    request<GameCard[]>(genre ? `/api/v1/games?genre=${encodeURIComponent(genre)}` : "/api/v1/games"),
  relatedGames: (slug: string) => request<GameCard[]>(`/api/v1/games/${slug}/related?limit=3`),
  game: (slug: string) => request<Game>(`/api/v1/games/${slug}`),
  gameFull: (slug: string) => request<GameDetailBundle>(`/api/v1/games/${slug}/full`),
  gameMetadata: (slug: string) => request<GameMetadata>(`/api/v1/games/${slug}/metadata`),
  gameEvents: (slug: string) => request<GameEvent[]>(`/api/v1/games/${slug}/events`),
  releases: (from: string, to: string) => request<GameRelease[]>(`/api/v1/releases?from=${from}&to=${to}`),
  editorPicks: () => request<EditorPick[]>("/api/v1/editor-picks"),
  koreanRadar: () => request<KoreanRadar>("/api/v1/korean"),
  /** 한국어 지원이 새로 잡힌 게임. 붙은 것과 처음 확인한 것을 구분해 준다. */
  koreanRecent: (limit = 60) => request<KoreanSupportChange[]>(`/api/v1/korean/recent?limit=${limit}`),
  /** 접근성 기능별 게임. 난이도 조정·색상 대체 같은 것으로 찾는 길. */
  accessibility: () => request<AccessibilityOverview>("/api/v1/accessibility"),
  trends: () => request<Trends>("/api/v1/trends"),
  goty: () => request<Goty>("/api/v1/goty"),
  promises: () => request<PromiseLedger>("/api/v1/promises"),
  status: () => request<SyncStatus>("/api/v1/status"),
  events: (page = 0) => request<GameEvent[]>(`/api/v1/events?page=${page}`),
  event: (id: string) => request<EventDetail>(`/api/v1/events/${id}`),
  gamePromises: (slug: string) => request<PromiseRow[]>(`/api/v1/promises/${slug}`),
  /** 지금 해 볼 수 있는 데모·베타. 기간이 지나면 사라지므로 최근 것만 온다. */
  playtests: () => request<GameEvent[]>("/api/v1/playtests"),
  /** 지금 할인 중인 게임. 매일 아침 가격을 다시 받아 온다. */
  deals: (limit = 60) => request<Deals>(`/api/v1/deals?limit=${limit}`),
  /** 회사 목록. 게임 한 편짜리 1,500곳을 다 세우면 훑어볼 수 없어 기본을 2편으로 둔다. */
  companies: (minGames = 2) => request<Company[]>(`/api/v1/companies?minGames=${minGames}`),
  company: (slug: string) => request<CompanyDetail>(`/api/v1/companies/${slug}`),
};
