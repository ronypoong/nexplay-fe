"use client";

import { useState } from "react";

type Theme = "light" | "dark" | "system";

const OPTIONS: Array<{ value: Theme; label: string }> = [
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
  { value: "system", label: "시스템" },
];

/** layout 의 인라인 스크립트가 이미 html 에 붙여둔 값을 읽는다. */
function currentTheme(): Theme {
  if (typeof document === "undefined") return "system";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" || attr === "dark" ? attr : "system";
}

/**
 * 테마 전환.
 *
 * "시스템" 이 기본이다. 고르기 전까지는 OS 설정을 따르고, 고르고 나면
 * 그 선택이 시스템을 이긴다.
 *
 * 첫 화면 적용은 layout 의 인라인 스크립트가 맡는다. 여기서 하면 React 가
 * 붙기 전까지 한 프레임 동안 반대 테마가 번쩍인다.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  const apply = (next: Theme) => {
    setTheme(next);
    const root = document.documentElement;
    if (next === "system") {
      root.removeAttribute("data-theme");
      window.localStorage.removeItem("nexplay-theme");
    } else {
      root.setAttribute("data-theme", next);
      window.localStorage.setItem("nexplay-theme", next);
    }
  };

  return (
    // 서버는 저장된 선택을 알 수 없어 항상 "시스템" 으로 그린다. 클라이언트가
    // 다른 값을 읽어도 경고를 내지 않게 한다.
    <div className="theme-toggle" role="group" aria-label="화면 테마" suppressHydrationWarning>
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={theme === option.value ? "selected" : ""}
          aria-pressed={theme === option.value}
          onClick={() => apply(option.value)}
          suppressHydrationWarning
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
