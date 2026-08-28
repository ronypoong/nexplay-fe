"use client";

import { useSyncExternalStore } from "react";

const KEY = "nexplay-saved";

/**
 * 담아둔 게임.
 *
 * 계정 없이 브라우저에만 둔다. 기기 간 동기화와 알림부터는 계정이 필요하지만,
 * 담아두는 사람이 실제로 생긴 뒤에 정할 일이다.
 *
 * 예전 버튼은 컴포넌트 안 useState 였다. 눌리기는 하는데 저장되지 않고 게임
 * slug 조차 받지 않아서, 페이지를 옮기면 잊었다. 약속과 결과를 다루는 서비스가
 * 저장하겠다고 해놓고 안 한 셈이다.
 */

let cache: string[] | null = null;
const listeners = new Set<() => void>();

function read(): string[] {
    if (cache) return cache;
    try {
        const raw = window.localStorage.getItem(KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        cache = Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
    } catch {
        // 사용자가 저장소를 막아 둔 경우다. 담기가 안 될 뿐 화면은 살아 있어야 한다.
        cache = [];
    }
    return cache;
}

function write(next: string[]) {
    cache = next;
    try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
        /* 저장이 막혀 있어도 이번 화면에서는 담긴 것처럼 보인다 */
    }
    listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
    listeners.add(fn);
    // 다른 탭에서 담거나 뺀 것도 따라간다.
    const onStorage = (event: StorageEvent) => {
        if (event.key !== KEY) return;
        cache = null;
        fn();
    };
    window.addEventListener("storage", onStorage);
    return () => {
        listeners.delete(fn);
        window.removeEventListener("storage", onStorage);
    };
}

const EMPTY: string[] = [];

/**
 * 담아둔 목록.
 *
 * 서버는 브라우저 저장소를 알 수 없으므로 서버 스냅샷은 항상 빈 배열이다.
 * 렌더 중에 저장소를 읽으면 서버가 그린 것과 어긋나고, 그 불일치는 경고를
 * 숨긴다고 사라지지 않는다 — 테마 전환에서 같은 실수를 한 적이 있다.
 */
export function useSavedGames(): string[] {
    return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function toggleSaved(slug: string) {
    const current = read();
    write(current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]);
}

export function isSaved(list: string[], slug: string) {
    return list.includes(slug);
}
