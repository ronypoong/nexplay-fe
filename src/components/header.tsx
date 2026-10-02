"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { useEffect, useState } from "react";
import { CalendarIcon, DiscoverIcon, HomeIcon, MenuIcon, NewsIcon, PlayIcon, SearchIcon, SparkIcon, TagIcon, TrendingIcon, BookmarkIcon } from "./icons";

const homeSections = ["trending", "announced", "editor-picks", "upcoming"];

function currentCalendarHref() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit" }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `/releases/${year}/${month}`;
}

export function Header() {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");
  /*
   * 평평한 열세 줄이었다. 그중 셋(#trending, #editor-picks, #upcoming)은 홈 안의
   * 자리로 가는 앵커라 메뉴 한 칸씩을 차지하면서도 갈 곳은 같은 화면이었고,
   * 정작 이 사이트만 가진 화면(한국어 목록, 접근성, 약속과 결과)은 메뉴에
   * 없었다. 앵커를 빼고 성격별로 묶는다.
   *
   * 묶음 이름은 "무엇을 하러 왔나" 로 나눈다 — 둘러보러 왔나, 지금 할 것을
   * 찾나, 지난 기록을 보러 왔나.
   *
   * 한국어는 둘러보기에 두되 따로 표시한다. 스팀도 국내 매체도 카탈로그 전체의
   * 언어를 모아 두지 않아서, 이 사이트가 유일하게 답할 수 있는 질문이 그것이다.
   */
  const navGroups: Array<{ title: string; items: Array<{ href: string; label: string; icon: React.ReactNode; feature?: boolean }> }> = [
    {
      title: "둘러보기",
      items: [
        { href: "/", label: "홈", icon: <HomeIcon size={16}/> },
        { href: "/korean", label: "한국어 지원", icon: <SparkIcon size={16}/>, feature: true },
        { href: "/discover", label: "게임 탐색", icon: <DiscoverIcon size={16}/> },
        { href: currentCalendarHref(), label: "출시 캘린더", icon: <CalendarIcon size={16}/> },
      ],
    },
    {
      title: "지금",
      items: [
        { href: "/news", label: "공식 소식", icon: <NewsIcon size={16}/> },
        // 둘 다 기간이 끝나면 사라진다. "지금" 아래 묶이는 이유가 그것이다.
        { href: "/playtests", label: "데모 · 베타", icon: <PlayIcon size={16}/> },
        { href: "/deals", label: "할인 중", icon: <TagIcon size={16}/> },
      ],
    },
    {
      title: "기록",
      items: [
        { href: "/promises", label: "약속과 결과", icon: <NewsIcon size={16}/> },
        { href: "/trends", label: "추세와 연기", icon: <TrendingIcon size={16}/> },
        { href: "/goty", label: "GOTY 아카이브", icon: <SparkIcon size={16}/> },
      ],
    },
  ];
  // 내 것은 성격이 달라 묶음 밖에 따로 둔다.
  const personal = { href: "/saved", label: "담아둔 게임", icon: <BookmarkIcon size={16}/> };
  const nav = [...navGroups.flatMap((group) => group.items), personal];

  useEffect(() => {
    if (pathname !== "/") return;
    const updateFromHash = () => setActiveHash(window.location.hash.slice(1));
    const sections = homeSections.map((id) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveHash(visible.target.id);
      else if (window.scrollY < 240) setActiveHash("");
    }, { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.15, 0.4] });
    sections.forEach((section) => observer.observe(section));
    window.addEventListener("hashchange", updateFromHash);
    return () => { observer.disconnect(); window.removeEventListener("hashchange", updateFromHash); };
  }, [pathname]);

  const isActive = (href: string) => {
    if (pathname === "/") {
      const hash = href.includes("#") ? href.split("#")[1] : "";
      return hash ? activeHash === hash : href === "/" && !activeHash;
    }
    return href !== "/" && !href.includes("#") && (pathname === href || (href.startsWith("/releases/") && pathname.startsWith("/releases/")));
  };
  return <header className="site-header">
    <div className="header-inner shell">
      <Link className="brand" href="/" aria-label="NEXPLAY 홈"><span className="brand-mark"><i/><b/></span><span><strong>NEX<span>PLAY</span></strong><small>by RUBI-ON</small></span></Link>
      <nav className="desktop-nav" aria-label="주요 메뉴">
        {navGroups.map((group) => <div className="nav-group" key={group.title}>
          <span className="nav-group-title">{group.title}</span>
          {group.items.map((item) => <Link
            key={item.label}
            className={`${isActive(item.href) ? "active" : ""}${item.feature ? " feature" : ""}`.trim()}
            href={item.href}
            onClick={() => { const hash = item.href.split("#")[1]; if (pathname === "/") setActiveHash(hash ?? ""); }}
          ><span className="nav-icon">{item.icon}</span>{item.label}</Link>)}
        </div>)}
        <div className="nav-group nav-group-personal">
          <Link className={isActive(personal.href) ? "active" : ""} href={personal.href}><span className="nav-icon">{personal.icon}</span>{personal.label}</Link>
        </div>
      </nav>
      <div className="header-actions">
        <ThemeToggle/>
        <Link className="sidebar-search" href="/search"><SearchIcon size={17}/><span>게임과 회사를 검색</span></Link>
        <button className="icon-button mobile-only" aria-label="메뉴"><MenuIcon /></button>
      </div>
    </div>
  </header>;
}
