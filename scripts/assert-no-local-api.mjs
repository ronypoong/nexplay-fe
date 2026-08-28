/**
 * 상용 번들에 로컬 주소가 박혔는지 검사한다.
 *
 * `NEXT_PUBLIC_*` 은 빌드 시점에 클라이언트 번들로 **인라인된다.** 런타임
 * 환경변수로 못 덮는다. 그런데 Next 는 `.env.local` 을 `.env.production` 보다
 * 우선하므로, 로컬에서 상용 빌드를 하면 개발용 주소가 그대로 박힌다.
 *
 * 그 사고는 조용하다. 화면은 그려지는데 데이터만 안 온다. 배포 전에 막는다.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const CHUNKS = ".open-next/assets/_next/static/chunks";
const FORBIDDEN = [/localhost:\d+/, /127\.0\.0\.1:\d+/];

if (!existsSync(CHUNKS)) {
  console.error(`빌드 산출물을 찾을 수 없습니다: ${CHUNKS}`);
  process.exit(1);
}

const offenders = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) { walk(path); continue; }
    if (!entry.name.endsWith(".js")) continue;
    const body = readFileSync(path, "utf8");
    for (const pattern of FORBIDDEN) {
      const found = body.match(pattern);
      if (found) offenders.push(`${path}: ${found[0]}`);
    }
  }
};
walk(CHUNKS);

if (offenders.length > 0) {
  console.error(
    "\n상용 번들에 로컬 주소가 박혀 있습니다. 배포하면 브라우저가 그 주소를 부릅니다.\n" +
      offenders.map((o) => `  - ${o}`).join("\n") +
      "\n\n.env.local 이 .env.production 을 덮었을 가능성이 큽니다.\n",
  );
  process.exit(1);
}
console.log("번들 검사 통과: 로컬 주소 없음");
