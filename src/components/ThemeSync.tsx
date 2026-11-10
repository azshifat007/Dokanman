"use client";

import { useEffect } from "react";
import { ACCENT_CHANGE_EVENT, applyAccent, readAccentPreference } from "@/lib/accent";

const DAY_START_HOUR = 6;
const DAY_END_HOUR = 18;
const DAY_THEME_COLOR = "#f7f5ef";
const NIGHT_THEME_COLOR = "#09090b";

export const THEME_STORAGE_KEY = "dokanman-theme";
export const THEME_CHANGE_EVENT = "dokanman:theme-change";

/** "auto" follows the device clock; "day"/"night" are manual overrides. */
export type ThemePreference = "auto" | "day" | "night";

/** Daytime is local 06:00–18:00 on the device clock, whatever its timezone. */
export function isDaytime(date = new Date()) {
  const hour = date.getHours();
  return hour >= DAY_START_HOUR && hour < DAY_END_HOUR;
}

export function readThemePreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "day" || stored === "night" || stored === "auto") return stored;
  } catch {
    // Storage can be blocked (private mode, disabled cookies); fall back to auto.
  }
  return "auto";
}

/** The manual choice wins; only "auto" falls back to the clock. */
export function resolveDaylight(preference: ThemePreference, date = new Date()) {
  if (preference === "day") return true;
  if (preference === "night") return false;
  return isDaytime(date);
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

export function setThemePreference(preference: ThemePreference) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Persisting is best-effort; the theme still applies for this session.
  }
  applyTheme(resolveDaylight(preference));
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: preference }));
}

/**
 * Applies the saved preference, and in "auto" mode re-evaluates local time so
 * the palette follows the device clock: when the shop crosses 06:00 or 18:00,
 * or the device timezone changes while the app is open, it flips without a
 * reload. Manual choices are left untouched.
 */
export function ThemeSync() {
  useEffect(() => {
    // The accent has no clock component, so it only needs applying once plus a
    // re-sync when another tab changes it.
    const syncAccent = () => applyAccent(readAccentPreference());
    const sync = () => {
      applyTheme(resolveDaylight(readThemePreference()));
      syncAccent();
    };

    sync();
    const interval = window.setInterval(sync, 60_000);
    const onPreferenceChange = () => sync();

    document.addEventListener("visibilitychange", sync);
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    window.addEventListener(THEME_CHANGE_EVENT, onPreferenceChange);
    window.addEventListener(ACCENT_CHANGE_EVENT, onPreferenceChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener(THEME_CHANGE_EVENT, onPreferenceChange);
      window.removeEventListener(ACCENT_CHANGE_EVENT, onPreferenceChange);
    };
  }, []);

  return null;
}
