import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { GameArt } from "@/components/game-art";
import { ArrowIcon } from "@/components/icons";

export const metadata: Metadata = { title: "출시 캘린더" };

const platforms = ["PC", "PS5", "Xbox", "Switch 2", "미정"];

function addMonths(date: Date, amount: number) { return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1)); }
function monthKey(date: Date) { return date.getUTCFullYear() * 12 + date.getUTCMonth(); }
// 서버가 UTC 로 돌면 getFullYear/getMonth/getDate 는 KST 00:00~09:00 동안 전날을 가리킨다.
// 달력 전체가 UTC 기준으로 계산되므로 "오늘"도 Asia/Seoul 로 읽어 UTC 로 맞춘다.
function seoulToday() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month") - 1, day: get("day") };
}
function monthHref(date: Date, platform?: string) {
  const base = `/releases/${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  return platform ? `${base}?platform=${encodeURIComponent(platform)}` : base;
}

export default async function ReleaseCalendar({ params, searchParams }: { params: Promise<{ year: string; month: string }>; searchParams: Promise<{ platform?: string }> }) {
  const { year, month } = await params;
  const { platform } = await searchParams;
  const monthNumber = Number(month);
  const yearNumber = Number(year);
  // Number("abc") 는 NaN 이라 < 1 과 > 12 를 둘 다 통과했다. 정수인지 먼저 확인한다.
  if (!Number.isInteger(yearNumber) || !Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) notFound();
  const now = seoulToday();
  const currentMonth = new Date(Date.UTC(now.year, now.month, 1));
  const requestedMonth = new Date(Date.UTC(yearNumber, monthNumber - 1, 1));
  const lastAllowedMonth = addMonths(currentMonth, 5);
  if (monthKey(requestedMonth) < monthKey(currentMonth) || monthKey(requestedMonth) > monthKey(lastAllowedMonth)) notFound();
  const selectedPlatform = platform && platforms.includes(platform) ? platform : undefined;
  const lastDay = new Date(Date.UTC(Number(year), monthNumber, 0)).getUTCDate();
  const previousMonthLastDay = new Date(Date.UTC(Number(year), monthNumber - 1, 0)).getUTCDate();
  const startOffset = new Date(Date.UTC(Number(year), monthNumber - 1, 1)).getUTCDay();
  const calendarDays = Array.from({ length: 42 }, (_, index) => index - startOffset + 1);
  const allReleases = await api.releases(`${year}-${month.padStart(2, "0")}-01`, `${year}-${month.padStart(2, "0")}-${lastDay}`);
  const apiReleases = selectedPlatform ? allReleases.filter((release) => release.platform === selectedPlatform) : allReleases;
  // 예전에는 Map<day, game> 이라 같은 날 출시작 중 마지막 1건만 달력에 남았다. 출시일은 화·금에 몰린다.
  const releases = new Map<number, (typeof apiReleases)[number]["game"][]>();
  apiReleases.forEach((release) => {
    const day = Number(release.releaseDate.slice(-2));
    const bucket = releases.get(day) ?? [];
    if (!bucket.some((game) => game.slug === release.game.slug)) bucket.push(release.game);
    releases.set(day, bucket);
  });
  const agenda = Array.from(new Map(apiReleases.map((release) => [release.game.slug, release])).values());
  const previousMonth = addMonths(requestedMonth, -1);
  const nextMonth = addMonths(requestedMonth, 1);
  const canGoPrevious = monthKey(previousMonth) >= monthKey(currentMonth);
  const canGoNext = monthKey(nextMonth) <= monthKey(lastAllowedMonth);
  const isToday = requestedMonth.getUTCFullYear() === now.year && requestedMonth.getUTCMonth() === now.month;
  return <main className="page-shell shell"><div className="calendar-head"><div className="page-hero compact"><span className="eyebrow">출시 캘린더</span><h1>{year}년 {monthNumber}월</h1><p>오늘부터 6개월간의 출시 예정작과 일정 변경을 확인하세요.</p></div><div className="month-nav">{canGoPrevious ? <Link aria-label="이전 달" href={monthHref(previousMonth, selectedPlatform)}>←</Link> : <span aria-label="이전 달로 이동할 수 없음" aria-disabled="true">←</span>}<Link className={isToday ? "current" : ""} href={monthHref(currentMonth, selectedPlatform)}>오늘</Link>{canGoNext ? <Link aria-label="다음 달" href={monthHref(nextMonth, selectedPlatform)}>→</Link> : <span aria-label="다음 달로 이동할 수 없음" aria-disabled="true">→</span>}</div></div><div className="filter-bar calendar-filter"><div className="chip-group"><Link className={!selectedPlatform ? "selected" : ""} href={monthHref(requestedMonth)}>전체 플랫폼</Link>{platforms.map((item) => <Link key={item} className={selectedPlatform === item ? "selected" : ""} href={monthHref(requestedMonth, item)}>{item}</Link>)}</div></div><div className="calendar"><div className="weekdays">{["일", "월", "화", "수", "목", "금", "토"].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{calendarDays.map((day, index) => { const dayGames = releases.get(day) ?? []; const inMonth = day > 0 && day <= lastDay; const isActualToday = isToday && day === now.day; return <div key={index} className={`calendar-day ${!inMonth ? "muted" : ""} ${isActualToday ? "today" : ""}`}><span className="day-number">{inMonth ? day : day <= 0 ? previousMonthLastDay + day : day - lastDay}</span>{dayGames.slice(0, 2).map((game) => <Link key={game.slug} href={`/games/${game.slug}`} className="calendar-game"><GameArt game={game}/><span><strong>{game.title}</strong><small>{game.platforms.slice(0, 2).join(" · ")}</small></span></Link>)}{dayGames.length > 2 && <span className="calendar-more">외 {dayGames.length - 2}개</span>}</div>; })}</div></div><section className="release-agenda"><div className="section-heading"><div><span className="eyebrow">이달의 출시작</span><h2>{selectedPlatform ? `${selectedPlatform} 출시 일정` : "다가오는 출시"}</h2></div></div>{agenda.length ? agenda.map((release) => <Link href={`/games/${release.game.slug}`} className="upcoming-item" key={release.id}><span className="date-block"><small>{Number(release.releaseDate.slice(5, 7))}월</small><strong>{Number(release.releaseDate.slice(-2))}</strong></span><GameArt game={release.game}/><span className="upcoming-copy"><strong>{release.game.title}</strong><small>{release.game.genres.join(" · ")}</small></span><span className="platforms">{release.game.platforms.join(" · ")}</span><ArrowIcon/></Link>) : <div className="empty-panel"><strong>선택한 조건의 출시작이 아직 없어요.</strong></div>}</section></main>;
}
