// @ts-check
/**
 * OpenNext 워커를 감싸 렌더된 HTML 을 콜로의 엣지 캐시에 통째로 저장한다.
 *
 * API JSON 캐시(src/lib/api.ts)로 원본 왕복은 줄였지만, 남은 TTFB 의 대부분이
 * SSR 렌더와 isolate 콜드 스타트(번들 5.5MB) 몫이었다. 페이지에 사용자별 상태가
 * 없어서(테마·담아둔 게임 모두 브라우저 localStorage) HTML 을 그대로 나눠 줄 수
 * 있다. 특히 출시 캘린더는 달·플랫폼 조합마다 새로 렌더하던 것이 URL 별로
 * 한 번씩만 렌더된다.
 *
 * api.ts 와 같은 stale-while-revalidate: 신선(10분) 지난 저장본도 즉시 내주고
 * 갱신은 waitUntil 로 응답 뒤에 한다. 저장소는 엣지 디스크라 워커 메모리를 쓰지
 * 않는다.
 *
 * OpenNext 번들은 캐시 미스에서만 동적 import 한다. top-level 로 들면 히트만
 * 받는 isolate 도 기동 때 5.5MB 를 평가한다.
 */

const FRESH_SECONDS = 600;
const STALE_MAX_SECONDS = 86400;

/** @type {Promise<{ fetch: (request: Request, env: unknown, ctx: ExecutionContext) => Promise<Response> }> | undefined} */
let handlerPromise;
function nextHandler() {
  return (handlerPromise ??= import("./.open-next/worker.js").then((mod) => mod.default));
}

/**
 * @param {Request} request
 * @param {URL} url
 */
function cacheable(request, url) {
  if (request.method !== "GET") return false;
  // 클라이언트 내비게이션의 RSC 페이로드는 HTML 과 응답 형식이 다르다. 섞어 주면
  // 화면 전환이 깨지므로 SSR 로 흘려보낸다. (Vary 헤더가 가리키는 축들)
  if (request.headers.has("rsc") || request.headers.has("next-router-prefetch") || request.headers.has("next-router-state-tree") || request.headers.has("next-router-segment-prefetch")) return false;
  if (url.pathname.startsWith("/_next/")) return false; // 정적 자산은 ASSETS 바인딩이 처리
  if (url.pathname.startsWith("/admin")) return false;
  if (url.pathname.startsWith("/api/")) return false;
  return true;
}

/**
 * 존의 Browser Cache TTL 이 max-age=0 을 4시간으로 올려 버린다(실측). 브라우저가
 * HTML 을 물고 있으면 배포 때마다 옛 청크를 찾는 버전 스큐가 나므로, 원래
 * 사이트와 같은 no-store 를 내보낸다. no-store 응답은 존 설정이 건드리지 않는
 * 것도 실측으로 확인했다.
 * @param {Response} hit
 */
function serveHit(hit) {
  const response = new Response(hit.body, hit);
  response.headers.set("cache-control", "private, no-cache, no-store, max-age=0, must-revalidate");
  response.headers.set("x-edge-cache", "hit");
  return response;
}

/**
 * @param {Request} request
 * @param {unknown} env
 * @param {ExecutionContext} ctx
 * @param {Request} key
 * @param {Cache} cache
 */
async function renderAndStore(request, env, ctx, key, cache) {
  const handler = await nextHandler();
  const response = await handler.fetch(request, env, ctx);
  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || !contentType.includes("text/html") || response.headers.has("set-cookie")) return response;
  const copy = response.clone();
  ctx.waitUntil((async () => {
    const body = await copy.arrayBuffer();
    const headers = new Headers(copy.headers);
    // 엣지 TTL 은 s-maxage 로 정한다. 신선도는 x-rendered-at 으로 직접 재므로
    // 만료를 여기에 맡기지 않고, 손님에게 나갈 때는 serveHit 이 no-store 로 바꾼다.
    headers.set("cache-control", `public, max-age=0, s-maxage=${STALE_MAX_SECONDS}`);
    headers.set("x-rendered-at", String(Date.now()));
    // Vary 를 남기면 저장·조회 키가 요청 헤더에 갈라진다. RSC 축은 cacheable 에서
    // 이미 걸렀으므로 지운다.
    headers.delete("vary");
    await cache.put(key, new Response(body, { status: copy.status, headers })).catch(() => {});
  })());
  return response;
}

export default {
  /**
   * 원본(Railway)이 잠들지 않게 5분마다 찔러 둔다(wrangler.jsonc 의 crons).
   * 엣지 캐시가 밤새 축출된 뒤의 첫 방문이 원본 기상 10초를 통째로 물던 것을
   * 원본을 늘 깨워 두는 것으로 1초 안쪽으로 줄인다. 콜로마다 도는 게 아니라
   * 캐시 프리워밍은 못 하고, 원본 온도만 관리한다.
   * @param {unknown} _event
   * @param {{ NEXT_PUBLIC_NEXPLAY_API_BASE_URL?: string }} env
   */
  async scheduled(_event, env) {
    const base = env.NEXT_PUBLIC_NEXPLAY_API_BASE_URL;
    if (!base) return;
    // status 는 인증 없는 가장 싼 DB 왕복이라 JVM 과 커넥션 풀을 함께 데운다.
    await fetch(`${base}/api/v1/status`).catch(() => {});
  },

  /**
   * @param {Request} request
   * @param {unknown} env
   * @param {ExecutionContext} ctx
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!cacheable(request, url)) return (await nextHandler()).fetch(request, env, ctx);
    const cache = caches.default;
    const key = new Request(`${url.origin}${url.pathname}${url.search}`, { method: "GET" });
    const hit = await cache.match(key).catch(() => undefined);
    if (hit) {
      const ageSeconds = (Date.now() - Number(hit.headers.get("x-rendered-at") ?? 0)) / 1000;
      if (ageSeconds <= STALE_MAX_SECONDS) {
        // 배경 갱신은 원래 요청을 그대로 다시 렌더한다. 이 요청의 응답은 이미
        // 저장본으로 나갔으므로 렌더 결과는 저장에만 쓰인다.
        if (ageSeconds > FRESH_SECONDS) ctx.waitUntil(renderAndStore(new Request(key, { headers: request.headers }), env, ctx, key, cache).then(() => {}));
        return serveHit(hit);
      }
    }
    return renderAndStore(request, env, ctx, key, cache);
  },
};
