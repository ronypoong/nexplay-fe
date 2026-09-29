/** 배포 주소. 사이트맵·canonical·OG 태그가 절대 URL 을 요구한다. */
export const SITE_URL = "https://nexplay.rubi-on.com";

/**
 * 전체 목록(/games) 한 쪽에 세우는 게임 수. 사이트맵이 같은 값으로 쪽 수를
 * 세므로 한곳에 둔다. 2,337개 기준 20쪽이고, 한 쪽이 링크 120개 + 텍스트라
 * 크롤러가 한 번에 삼키기에 무리가 없다.
 */
export const GAMES_PER_PAGE = 120;

/**
 * 연도별 목록을 사이트맵에 올릴 최소 게임 수. 2013년 1개, 2024년 1개처럼 자료가
 * 우연히 한두 줄 남은 해가 있다. 그런 페이지까지 색인해 달라고 내밀면 얇은
 * 페이지만 늘어난다. 페이지 자체는 막지 않는다 — 내미는 것만 하지 않는다.
 */
export const YEAR_PAGE_MIN_GAMES = 10;

export const SITE_NAME = "NEXPLAY";
export const SITE_DESCRIPTION =
  "올해 신작과 대형 게임사의 주요 작품을 발견하고, 출시 일정·패치·확장팩 소식을 한곳에서 봅니다. 한국어 지원 여부까지 확인하세요.";
