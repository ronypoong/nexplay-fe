import Link from "next/link";
import { ArrowIcon } from "./icons";

export function SectionHeading({ eyebrow, title, href, action = "전체 보기" }: { eyebrow?: string; title: string; href?: string; action?: string }) {
  return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{href && <Link href={href}>{action}<ArrowIcon/></Link>}</div>;
}
