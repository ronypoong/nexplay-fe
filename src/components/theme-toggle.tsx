"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const OPTIONS: Array<{ value: Theme; label: string }> = [
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
  { value: "system", label: "시스템" },
];

const STORAGE_KEY = "nexplay-theme";

function storedTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" || attr === "dark" ? attr : "system";
}

/**
 * 테마 전환.
 *
 * "시스템" 이 기본이다. 고르기 전까지는 OS 설정을 따르고, 고르고 나면 그 선택이
 * 시스템을 이긴다. 첫 화면 적용은 layout 의 인라인 스크립트가 맡는다 — 여기서
 * 하면 React 가 붙기 전까지 한 프레임 동안 반대 테마가 번쩍인다.
 *
 * ### 초기값을 렌더 중에 읽지 않는 이유
 *
 * 예전에는 `useState(currentTheme)` 로 시작했다. 이 초기화 함수는 하이드레이션
 * 중에도 실행되어 `data-theme` 을 읽는데, 서버는 그 값을 알 수 없어 항상
 * "시스템" 으로 그린 뒤였다. `suppressHydrationWarning` 은 **경고만 숨기고
 * 불일치를 고치지 않는다.** 그래서 서버가 붙인 "시스템" 의 선택 표시가 DOM 에
 * 그대로 남고, React 는 자기 상태를 다크라고 믿는다 — 둘이 동시에 선택된 것처럼
 * 보이고, 눌러도 "시스템" 표시가 안 떨어진다.
 *
 * 마운트 전에는 아무것도 고르지 않은 상태로 그린다. 서버와 클라이언트가 같은
 * 것을 그리므로 불일치가 없고, 마운트 뒤 실제 값으로 한 번 갱신된다.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(storedTheme());
    // 다른 탭에서 바꾸면 따라간다. 같은 계정으로 두 창을 열어 두는 일이 흔하다.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const next = event.newValue;
      if (next === "light" || next === "dark") {
        document.documentElement.setAttribute("data-theme", next);
        setTheme(next);
      } else {
        document.documentElement.removeAttribute("data-theme");
        setTheme("system");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const apply = (next: Theme) => {
    setTheme(next);
    const root = document.documentElement;
    if (next === "system") {
      root.removeAttribute("data-theme");
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      root.setAttribute("data-theme", next);
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  };

  return (
    <div className="theme-toggle" role="group" aria-label="화면 테마">
      {OPTIONS.map((option) => {
        const selected = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={selected ? "selected" : ""}
            aria-pressed={selected}
            onClick={() => apply(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
