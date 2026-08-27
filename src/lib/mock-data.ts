import type { Game, GameEvent } from "./types";

export const games: Game[] = [
  {
    id: "g1", slug: "echoes-of-elysium", title: "Echoes of Elysium", tagline: "하늘 위에서 시작되는 마지막 탐험",
    description: "부유 군도를 횡단하며 사라진 문명의 기억을 복원하는 오픈월드 액션 RPG. 비행선 커스터마이징과 4인 협동 탐험을 지원합니다.",
    developer: "Northstar Works", publisher: "Arc & Vale", genres: ["Action RPG", "Open World"], platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2026-10-22", releaseLabel: "2026. 10. 22", status: "Upcoming", score: 98, anticipationScore: 99, followers: "42.8K", accent: "#6e51ff", accent2: "#fc7b45", symbol: "✦", featured: true,
  },
  {
    id: "g2", slug: "project-aurora", title: "Project Aurora", tagline: "혹한의 행성, 혼자가 아닌 생존",
    description: "끊임없이 변화하는 설원 기지에서 생존하고 탐사하는 내러티브 SF 어드벤처입니다.",
    developer: "Quiet Giant", publisher: "Self-published", genres: ["Adventure", "Survival"], platforms: ["PC", "PS5"],
    releaseDate: "2027-02-12", releaseLabel: "2027. 02. 12", status: "Upcoming", score: 94, anticipationScore: 96, followers: "28.1K", accent: "#1f78ff", accent2: "#6be7dd", symbol: "◈",
  },
  {
    id: "g3", slug: "little-witch-market", title: "Little Witch Market", tagline: "낮에는 장사, 밤에는 마법",
    description: "작은 마을에서 마법 상점을 운영하고 주민들의 비밀을 발견하는 아늑한 생활 시뮬레이션입니다.",
    developer: "Mossbell", publisher: "Bramble Games", genres: ["Simulation", "Cozy"], platforms: ["PC", "Switch 2"],
    releaseDate: "2026-09-18", releaseLabel: "2026. 09. 18", status: "Upcoming", score: 91, anticipationScore: 93, followers: "19.4K", accent: "#e84b8a", accent2: "#ffbb5c", symbol: "✿",
  },
  {
    id: "g4", slug: "dead-signal", title: "Dead Signal", tagline: "신호를 들었다면 이미 늦었다",
    description: "버려진 심우주 중계소에서 벌어지는 1인칭 심리 공포 게임입니다.",
    developer: "Null Field", publisher: "Obscura", genres: ["Horror", "Sci-Fi"], platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2026-11-06", releaseLabel: "2026. 11. 06", status: "Upcoming", score: 89, anticipationScore: 91, followers: "16.7K", accent: "#3d5364", accent2: "#e02f48", symbol: "⌁",
  },
  {
    id: "g5", slug: "kaiju-club", title: "Kaiju Club", tagline: "괴수도 퇴근 후엔 친구가 필요해",
    description: "괴수들의 비밀 아지트를 꾸미는 유쾌한 협동 파티 게임입니다.",
    developer: "GOGO Studio", publisher: "Playframe", genres: ["Party", "Co-op"], platforms: ["PC", "Switch 2", "PS5"],
    releaseDate: "2026-08-29", releaseLabel: "D-3 · 08. 29", status: "Upcoming", score: 87, anticipationScore: 90, followers: "12.3K", accent: "#ff5d3c", accent2: "#ffd542", symbol: "♢",
  },
  {
    id: "g6", slug: "velvet-circuit", title: "Velvet Circuit", tagline: "속도와 리듬이 만나는 밤",
    description: "네온 메트로폴리스를 질주하는 스타일리시 아케이드 레이싱 게임입니다.",
    developer: "Tempo Lab", publisher: "Neon Lace", genres: ["Racing", "Rhythm"], platforms: ["PC", "PS5"],
    releaseDate: "TBA", releaseLabel: "출시일 미정", status: "TBA", score: 84, anticipationScore: 86, followers: "8.9K", accent: "#a22bff", accent2: "#17d9ff", symbol: "⌁",
  },
];

export const events: GameEvent[] = [
  { id: "e1", gameSlug: "echoes-of-elysium", type: "GAMEPLAY", title: "12분 공식 게임플레이 최초 공개", summary: "비행선 전투, 협동 던전, 날씨 시스템을 한 번에 확인할 수 있습니다.", date: "2026-08-26", dateLabel: "2시간 전", source: "Northstar Works", official: true, sourceCount: 4 },
  { id: "e2", gameSlug: "little-witch-market", type: "RELEASE_DATE", title: "9월 18일 출시 확정", summary: "PC와 Switch 2 동시 출시. 예약 구매 특전도 함께 공개됐습니다.", date: "2026-08-26", dateLabel: "4시간 전", source: "Bramble Games", official: true, sourceCount: 6 },
  { id: "e3", gameSlug: "project-aurora", type: "TRAILER", title: "신규 스토리 트레일러 공개", summary: "얼어붙은 행성의 구조 요청과 탐사대의 과거를 다룹니다.", date: "2026-08-26", dateLabel: "오늘", source: "Quiet Giant", official: true, sourceCount: 3 },
  { id: "e4", gameSlug: "dead-signal", type: "ANNOUNCEMENT", title: "Dead Signal 깜짝 발표", summary: "SOMA와 Alien: Isolation에서 영감을 받은 심리 공포 신작입니다.", date: "2026-08-25", dateLabel: "어제", source: "Obscura Showcase", official: true, sourceCount: 8 },
  { id: "e5", gameSlug: "echoes-of-elysium", type: "RELEASE_DATE", title: "글로벌 출시일 발표", summary: "2026년 10월 22일, PC와 콘솔에 동시 출시됩니다.", date: "2026-08-19", dateLabel: "8월 19일", source: "Northstar Works", official: true, sourceCount: 12 },
  { id: "e6", gameSlug: "echoes-of-elysium", type: "ANNOUNCEMENT", title: "Echoes of Elysium 공식 발표", summary: "Northstar Works의 신규 IP가 Summer Game Stage에서 처음 공개됐습니다.", date: "2026-06-12", dateLabel: "6월 12일", source: "Summer Game Stage", official: false, sourceCount: 15 },
];

export const getGame = (slug: string) => games.find((game) => game.slug === slug) ?? games[0];
export const getGameEvents = (slug: string) => events.filter((event) => event.gameSlug === slug);
