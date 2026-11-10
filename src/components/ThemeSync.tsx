"use client";

import { useEffect } from "react";

const DAY_START_HOUR = 6;
const DAY_END_HOUR = 18;
const DAY_THEME_COLOR = "#f7f5ef";
const NIGHT_THEME_COLOR = "#09090b";

/** Daytime is local 06:00–18:00 on the device clock, whatever its timezone. */
export function isDaytime(date = new Date()) {
  const hour = date.getHours();
  return hour >= DAY_START_HOUR && hour < DAY_END_HOUR;
}

export function applyTheme(day: boolean) {
  const root = document.documentElement;
  root.classList.toggle("day", day);
  root.classList.toggle("dark", !day);
  root.style.colorScheme = day ? "light" : "dark";

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", day ? DAY_THEME_COLOR : NIGHT_THEME_COLOR);
  }
}

/**
 * Re-evaluates local time so the palette follows the device clock: when the
 * shop crosses 06:00 or 18:00, or the device timezone changes while the app is
 * open, the theme flips without a reload.
 */
export function ThemeSync() {
  useEffect(() => {
    const sync = () => applyTheme(isDaytime());

    sync();
    const interval = window.setInterval(sync, 60_000);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("focus", sync);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  return null;
}
