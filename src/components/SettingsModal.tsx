"use client";

import { useState } from "react";
import {
  X,
  Settings,
  Store,
  Lock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Sun,
  Moon,
  Clock,
  Palette,
  Check,
} from "lucide-react";
import { updateShopProfileAction, changePinAction } from "@/actions/auth-actions";
import { useLanguage } from "@/context/LanguageContext";
import {
  readThemePreference,
  setThemePreference,
  type ThemePreference,
} from "@/components/ThemeSync";
import { ACCENTS, readAccentPreference, setAccentPreference, type AccentId } from "@/lib/accent";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  phone?: string;
  onRefresh: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  shopName,
  phone,
  onRefresh,
}: SettingsModalProps) {
  const { lang, t } = useLanguage();
  const [name, setName] = useState(shopName);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [savingPin, setSavingPin] = useState(false);
  const [pinMsg, setPinMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // null means "not chosen in this session yet", so the saved preference is read
  // on render. This modal only opens after a click, so there is no SSR mismatch.
  const [themePref, setThemePref] = useState<ThemePreference | null>(null);
  const activeTheme = themePref ?? readThemePreference();

  // Same pattern for the accent colour: null until chosen in this session.
  const [accentPref, setAccentPref] = useState<AccentId | null>(null);
  const activeAccent = accentPref ?? readAccentPreference();

  if (!isOpen) return null;

  const bn = lang === "bn";

  const themeOptions: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
    { value: "auto", label: t("themeAuto"), Icon: Clock },
    { value: "day", label: t("themeDay"), Icon: Sun },
    { value: "night", label: t("themeNight"), Icon: Moon },
  ];

  const chooseTheme = (value: ThemePreference) => {
    setThemePref(value);
    setThemePreference(value);
  };

  const chooseAccent = (value: AccentId) => {
    setAccentPref(value);
    setAccentPreference(value);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileMsg(null);
      const res = await updateShopProfileAction({ shopName: name });
      if (res.success) {
        setProfileMsg({ type: "success", text: t("profileSaved") });
        onRefresh();
      } else {
        setProfileMsg({ type: "error", text: res.error || "Error" });
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPin(true);
      setPinMsg(null);
      const res = await changePinAction({ currentPin, newPin });
      if (res.success) {
        setPinMsg({ type: "success", text: t("pinChanged") });
        setCurrentPin("");
        setNewPin("");
      } else {
        setPinMsg({ type: "error", text: res.error || t("pinMismatch") });
      }
    } finally {
      setSavingPin(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-black/10 dark:ring-white/10 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-5 py-4 bg-white/70 dark:bg-zinc-950/70">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
            <Settings className="w-5 h-5" />
            <span>{t("settingsTitle")}</span>
          </div>
          <button
            onClick={onClose}
            aria-label={t("cancel")}
            className="rounded-lg p-1.5 text-zinc-600 dark:text-zinc-400 transition-colors hover:bg-black/10 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto max-h-[65vh]">
          {/* Day / night mode */}
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-sm">
              <Sun className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>{t("settingsThemeSection")}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(({ value, label, Icon }) => {
                const active = activeTheme === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => chooseTheme(value)}
                    aria-pressed={active}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-[11px] font-bold transition-colors ${
                      active
                        ? "bg-amber-500 border-amber-500 text-zinc-950"
                        : "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-amber-500/60"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              {activeTheme === "auto" ? t("themeAutoHint") : t("themeManualHint")}
            </p>
          </div>

          {/* Accent colour */}
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-sm">
              <Palette className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>{t("settingsAccentSection")}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {ACCENTS.map(({ id, labelBn, labelEn, swatch }) => {
                const active = activeAccent === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => chooseAccent(id)}
                    aria-pressed={active}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold transition-colors ${
                      active
                        ? "border-amber-500 bg-amber-500/15 text-zinc-900 dark:text-white"
                        : "border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-amber-500/60"
                    }`}
                  >
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full ring-1 ring-black/20"
                      style={{ backgroundColor: swatch }}
                    >
                      {active && <Check className="w-3 h-3 text-zinc-950" />}
                    </span>
                    <span>{bn ? labelBn : labelEn}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t("settingsAccentHint")}
            </p>
          </div>

          {/* Shop profile */}
          <form
            onSubmit={handleSaveProfile}
            className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 space-y-3"
          >
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-sm">
              <Store className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>{t("settingsProfileSection")}</span>
            </div>

            {profileMsg && (
              <div
                className={`p-2.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 ${
                  profileMsg.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300"
                    : "bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-700/60 text-rose-600 dark:text-rose-300"
                }`}
              >
                {profileMsg.type === "success" ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t("settingsShopName")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <Phone className="w-3.5 h-3.5 text-zinc-500" />
              <span className="font-mono">{phone}</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-600">
                ({bn ? "মোবাইল নম্বর পরিবর্তন করা যায় না" : "phone number cannot be changed"})
              </span>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {savingProfile ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{t("saveProfile")}</span>
            </button>
          </form>

          {/* PIN change */}
          <form
            onSubmit={handleChangePin}
            className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 space-y-3"
          >
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-sm">
              <Lock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>{t("settingsPinSection")}</span>
            </div>

            {pinMsg && (
              <div
                className={`p-2.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 ${
                  pinMsg.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300"
                    : "bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-700/60 text-rose-600 dark:text-rose-300"
                }`}
              >
                {pinMsg.type === "success" ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                <span>{pinMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t("currentPin")}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm font-mono tracking-widest focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t("newPin")}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm font-mono tracking-widest focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPin}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {savingPin ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>{t("changePinBtn")}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
