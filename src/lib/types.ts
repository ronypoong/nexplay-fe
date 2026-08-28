export type Platform = "PC" | "PS5" | "Xbox" | "Switch 2" | "미정";
export type EventType = "ANNOUNCEMENT" | "TRAILER" | "GAMEPLAY" | "RELEASE_DATE" | "DELAY" | "RELEASE" | "DEMO" | "BETA" | "DLC" | "EXPANSION" | "MAJOR_UPDATE" | "PATCH";

export type Game = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  developer: string;
  publisher: string;
  genres: string[];
  gameModes?: string[];
  platforms: Platform[];
  koreanTextSupported?: boolean | null;
  koreanAudioSupported?: boolean | null;
  releaseDate: string;
  releaseLabel: string;
  officialUrl?: string | null;
  steamAppId?: number | null;
  wikidataId?: string | null;
  catalogSource?: string;
  coverImageUrl?: string | null;
  imageSource?: string | null;
  status: "Available" | "Upcoming" | "TBA";
  score: number;
  anticipationScore: number;
  followers: string;
  accent: string;
  accent2: string;
  symbol: string;
  featured?: boolean;
};

export type GameMetadata = {
  languages: Array<{ code: string; name: string; text: boolean; audio: boolean; source: string; verifiedAt: string }>;
  media: Array<{ id: number; type: string; title?: string | null; url: string; thumbnailUrl?: string | null; official: boolean; source: string }>;
  relations: Array<{ type: string; slug?: string | null; title: string; url?: string | null; source: string }>;
  releaseHistory: Array<{ platform: string; previousDate?: string | null; newDate?: string | null; type: string; announcedAt: string; source: string; sourceUrl?: string | null }>;
  popularityHistory: Array<{ date: string; score: number; anticipationScore: number; followers: number; officialNews30d: number; trailerViews?: number | null }>;
  systemRequirements: Array<{ platform: string; level: string; rawText?: string | null; source: string }>;
  prices: Array<{ store: string; region: string; currency: string; initialPrice: number; finalPrice: number; discountPercent: number; storeUrl: string; capturedAt: string }>;
  ageRatings: Array<{ system: string; rating: string; descriptors?: string | null; source: string }>;
  accessibility: Array<{ category: string; feature: string; source: string }>;
  provenance: Array<{ field: string; source: string; sourceUrl?: string | null; confidence: string; verifiedAt: string }>;
  completenessScore: number;
  missingData: string[];
};

export type GameEvent = {
  id: string;
  gameSlug: string;
  type: EventType;
  title: string;
  summary: string;
  date: string;
  dateLabel: string;
  source: string;
  official: boolean;
  sourceCount: number;
};

export type GameRelease = {
  id: string;
  game: Game;
  platform: Platform;
  releaseDate: string;
  status: "CONFIRMED" | "EXPECTED" | "DELAYED" | "RELEASED";
  region: string;
};

export type EditorPick = {
  game: Game;
  note: string;
  headline?: string | null;
  pickedAt: string;
};

export type KoreanForecast = {
  slug: string;
  title: string;
  publisher: string;
  releaseLabel: string;
  probabilityPercent: number;
  basis: string;
};

export type KoreanRadar = {
  coverage: { totalGames: number; checked: number; supported: number; fullVoice: number; unchecked: number };
  publishers: Array<{ publisher: string; checked: number; supported: number; fullVoice: number; ratePercent: number }>;
  forecasts: KoreanForecast[];
  fullVoiceGames: KoreanForecast[];
};
