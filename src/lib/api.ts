import type { SyncStatus, EditorPick, Feed, Game, GameCard, GameEvent, GameMetadata, GameRelease, Goty, KoreanRadar, PromiseLedger, PromiseRow, Trends } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_NEXPLAY_API_BASE_URL;

/** 백엔드가 404 를 준 경우. 페이지에서 notFound() 로 바꿔 쓰려고 따로 둔다. */
export class NexplayNotFoundError extends Error {
  constructor(path: string) {
    super(`NEXPLAY API 404: ${path}`);
    this.name = "NexplayNotFoundError";
  }
}

/**
 * 백엔드 데이터는 하루 한 번(06:00 KST 동기화) 바뀐다.
 *
 * 예전에는 `no-store` 라 방문 한 번이 그대로 원본 호출이 됐다. 서울에서 원본까지
 * 왕복이 0.7초쯤이라, 서버를 아무리 빠르게 해도 이 몫은 줄지 않았다.
 *
 * 백엔드가 `Cache-Control: public, max-age=600` 을 보내므로, 여기서 막지만 않으면
 * 워커의 바깥 호출이 Cloudflare 엣지에 캐시된다. 관리 화면에서 고친 것은
 * 백엔드가 캐시를 비우고 최대 10분 뒤에 따라온다.
 */
const REVALIDATE_SECONDS = 600;

async function request<T>(path: string): Promise<T> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_NEXPLAY_API_BASE_URL is required");
  const response = await fetch(`${API_BASE}${path}`, { next: { revalidate: REVALIDATE_SECONDS } });
  if (response.status === 404) throw new NexplayNotFoundError(path);
  if (!response.ok) throw new Error(`NEXPLAY API ${response.status}`);
  return (await response.json()) as T;
}

export const api = {
  feed: () => request<Feed>("/api/v1/feed"),
  games: (genre?: string) =>
    request<GameCard[]>(genre ? `/api/v1/games?genre=${encodeURIComponent(genre)}` : "/api/v1/games"),
  relatedGames: (slug: string) => request<GameCard[]>(`/api/v1/games/${slug}/related?limit=3`),
  game: (slug: string) => request<Game>(`/api/v1/games/${slug}`),
  gameMetadata: (slug: string) => request<GameMetadata>(`/api/v1/games/${slug}/metadata`),
  gameEvents: (slug: string) => request<GameEvent[]>(`/api/v1/games/${slug}/events`),
  releases: (from: string, to: string) => request<GameRelease[]>(`/api/v1/releases?from=${from}&to=${to}`),
  editorPicks: () => request<EditorPick[]>("/api/v1/editor-picks"),
  koreanRadar: () => request<KoreanRadar>("/api/v1/korean"),
  trends: () => request<Trends>("/api/v1/trends"),
  goty: () => request<Goty>("/api/v1/goty"),
  promises: () => request<PromiseLedger>("/api/v1/promises"),
  status: () => request<SyncStatus>("/api/v1/status"),
  gamePromises: (slug: string) => request<PromiseRow[]>(`/api/v1/promises/${slug}`),
};
