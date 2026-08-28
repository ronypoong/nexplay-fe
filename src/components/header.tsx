"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { useEffect, useState } from "react";
import { CalendarIcon, DiscoverIcon, HomeIcon, MenuIcon, NewsIcon, SearchIcon, SparkIcon, TrendingIcon, BookmarkIcon } from "./icons";

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
  const nav = [
    { href: "/", label: "홈", icon: <HomeIcon size={16}/> },
    { href: "/#trending", label: "인기 급상승", icon: <TrendingIcon size={16}/> },
    { href: "/#announced", label: "새 소식", icon: <NewsIcon size={16}/> },
    { href: "/#editor-picks", label: "주인장 픽", icon: <SparkIcon size={16}/> },
    { href: "/#upcoming", label: "출시 예정", icon: <CalendarIcon size={16}/> },
    { href: "/korean", label: "한국어 레이더", icon: <SparkIcon size={16}/> },
    { href: "/trends", label: "추세와 연기", icon: <TrendingIcon size={16}/> },
    { href: "/goty", label: "GOTY 아카이브", icon: <SparkIcon size={16}/> },
    { href: "/promises", label: "약속과 결과", icon: <NewsIcon size={16}/> },
    { href: "/saved", label: "담아둔 게임", icon: <BookmarkIcon size={16}/> },
    { href: "/discover", label: "게임 탐색", icon: <DiscoverIcon size={16}/> },
    { href: currentCalendarHref(), label: "출시 캘린더", icon: <CalendarIcon size={16}/> },
  ];

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
        {nav.map((item) => <Link key={item.label} className={isActive(item.href) ? "active" : ""} href={item.href} onClick={() => { const hash = item.href.split("#")[1]; if (pathname === "/") setActiveHash(hash ?? ""); }}><span className="nav-icon">{item.icon}</span>{item.label}</Link>)}
      </nav>
      <div className="header-actions">
        <ThemeToggle/>
        <Link className="sidebar-search" href="/search"><SearchIcon size={17}/><span>게임과 회사를 검색</span></Link>
        <button className="icon-button mobile-only" aria-label="메뉴"><MenuIcon /></button>
      </div>
    </div>
  </header>;
}
