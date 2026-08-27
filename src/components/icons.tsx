import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };
const base = (size: number) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export function SearchIcon({ size = 20, ...props }: IconProps) { return <svg {...base(size)} {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>; }
export function BookmarkIcon({ size = 20, ...props }: IconProps) { return <svg {...base(size)} {...props}><path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-3.7L6 21Z"/></svg>; }
export function ArrowIcon({ size = 18, ...props }: IconProps) { return <svg {...base(size)} {...props}><path d="M5 12h14M14 7l5 5-5 5"/></svg>; }
export function CalendarIcon({ size = 20, ...props }: IconProps) { return <svg {...base(size)} {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>; }
export function PlayIcon({ size = 18, ...props }: IconProps) { return <svg {...base(size)} {...props}><path d="m8 5 11 7-11 7Z"/></svg>; }
export function SparkIcon({ size = 18, ...props }: IconProps) { return <svg {...base(size)} {...props}><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5Z"/></svg>; }
export function MenuIcon({ size = 22, ...props }: IconProps) { return <svg {...base(size)} {...props}><path d="M4 7h16M4 12h16M4 17h16"/></svg>; }
export function HomeIcon({ size = 18, ...props }: IconProps) { return <svg {...base(size)} {...props}><path d="m3.5 10 8.5-7 8.5 7"/><path d="M5.5 9v11h13V9M9.5 20v-6h5v6"/></svg>; }
export function TrendingIcon({ size = 18, ...props }: IconProps) { return <svg {...base(size)} {...props}><path d="m4 16 5-5 4 4 7-8"/><path d="M15 7h5v5"/></svg>; }
export function NewsIcon({ size = 18, ...props }: IconProps) { return <svg {...base(size)} {...props}><path d="M5 4h12a2 2 0 0 1 2 2v14H6a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2Z"/><path d="M7 8h8M7 12h8M7 16h5"/></svg>; }
export function DiscoverIcon({ size = 18, ...props }: IconProps) { return <svg {...base(size)} {...props}><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5Z"/></svg>; }
