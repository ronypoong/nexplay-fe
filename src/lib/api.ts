import type { Game, GameEvent, GameMetadata, GameRelease } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_NEXPLAY_API_BASE_URL;

/** 백엔드가 404 를 준 경우. 페이지에서 notFound() 로 바꿔 쓰려고 따로 둔다. */
export class NexplayNotFoundError extends Error {
  constructor(path: string) {
    super(`NEXPLAY API 404: ${path}`);
    this.name = "NexplayNotFoundError";
  }
}

async function request<T>(path: string): Promise<T> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_NEXPLAY_API_BASE_URL is required");
  const response = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (response.status === 404) throw new NexplayNotFoundError(path);
  if (!response.ok) throw new Error(`NEXPLAY API ${response.status}`);
  return (await response.json()) as T;
}

export const api = {
  feed: () => request<{ games: Game[]; events: GameEvent[] }>("/api/v1/feed"),
  games: (genre?: string) =>
    request<Game[]>(genre ? `/api/v1/games?genre=${encodeURIComponent(genre)}` : "/api/v1/games"),
  game: (slug: string) => request<Game>(`/api/v1/games/${slug}`),
  gameMetadata: (slug: string) => request<GameMetadata>(`/api/v1/games/${slug}/metadata`),
  gameEvents: (slug: string) => request<GameEvent[]>(`/api/v1/games/${slug}/events`),
  releases: (from: string, to: string) => request<GameRelease[]>(`/api/v1/releases?from=${from}&to=${to}`),
};
