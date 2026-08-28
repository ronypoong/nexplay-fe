import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Cloudflare Workers 어댑터 설정.
 *
 * 증분 캐시(R2)는 아직 붙이지 않았다. NEXPLAY 의 모든 페이지가
 * `export const dynamic = "force-dynamic"` 이고 fetch 도 `cache: "no-store"` 라
 * ISR 캐시에 들어갈 것이 없다. 지금 붙이면 R2 버킷만 만들고 아무 일도 하지 않는다.
 *
 * 데이터는 하루 한 번(06:00 KST 동기화) 바뀐다. 페이지를 revalidate 기반으로
 * 옮기면 그때 R2 를 함께 붙여야 한다. 그 전에는 방문 한 번이 그대로 백엔드
 * 호출 두 번(피드, 주인장 픽)이 된다.
 */
export default defineCloudflareConfig({});
