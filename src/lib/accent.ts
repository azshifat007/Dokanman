/**
 * Accent colour preference. Every brand highlight in the UI uses Tailwind's
 * `amber-*` shades, and globals.css remaps that scale onto the `--accent-*`
 * variables below, so switching accents needs no per-component changes.
 *
 * Kept in localStorage per device, like the day/night choice.
 */
export const ACCENT_STORAGE_KEY = "dokanman-accent";
export const ACCENT_CHANGE_EVENT = "dokanman:accent-change";

export type AccentId = "amber" | "sky" | "indigo" | "violet" | "fuchsia";

export const ACCENTS: { id: AccentId; labelBn: string; labelEn: string; swatch: string }[] = [
  { id: "amber", labelBn: "অ্যাম্বার", labelEn: "Amber", swatch: "#f59e0b" },
  { id: "sky", labelBn: "আকাশি", labelEn: "Sky", swatch: "#0ea5e9" },
  { id: "indigo", labelBn: "নীল", labelEn: "Indigo", swatch: "#6366f1" },
  { id: "violet", labelBn: "বেগুনি", labelEn: "Violet", swatch: "#8b5cf6" },
  { id: "fuchsia", labelBn: "গোলাপি", labelEn: "Fuchsia", swatch: "#d946ef" },
];

const ACCENT_IDS = ACCENTS.map((accent) => accent.id);

export function readAccentPreference(): AccentId {
  try {
    const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY);
    if (stored && (ACCENT_IDS as string[]).includes(stored)) return stored as AccentId;
  } catch {
    // Storage can be blocked (private mode, disabled cookies); fall back to amber.
  }
  return "amber";
}

export function applyAccent(accent: AccentId) {
  document.documentElement.dataset.accent = accent;
}

export function setAccentPreference(accent: AccentId) {
  try {
    window.localStorage.setItem(ACCENT_STORAGE_KEY, accent);
  } catch {
    // Persisting is best-effort; the accent still applies for this session.
  }
  applyAccent(accent);
  window.dispatchEvent(new CustomEvent(ACCENT_CHANGE_EVENT, { detail: accent }));
}
