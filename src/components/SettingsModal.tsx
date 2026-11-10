"use client";

import { useState } from "react";
import { X, Settings, Store, Lock, Loader2, CheckCircle2, AlertTriangle, Phone } from "lucide-react";
import { updateShopProfileAction, changePinAction } from "@/actions/auth-actions";
import { useLanguage } from "@/context/LanguageContext";

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

  if (!isOpen) return null;

  const bn = lang === "bn";

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
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 ring-1 ring-white/10 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 bg-zinc-950/70">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Settings className="w-5 h-5" />
            <span>{t("settingsTitle")}</span>
          </div>
          <button
            onClick={onClose}
            aria-label={t("cancel")}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto max-h-[65vh]">
          {/* Shop profile */}
          <form
            onSubmit={handleSaveProfile}
            className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3"
          >
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Store className="w-4 h-4 text-amber-400" />
              <span>{t("settingsProfileSection")}</span>
            </div>

            {profileMsg && (
              <div
                className={`p-2.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 ${
                  profileMsg.type === "success"
                    ? "bg-emerald-950/60 border border-emerald-700/60 text-emerald-300"
                    : "bg-rose-950/60 border border-rose-700/60 text-rose-300"
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
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                {t("settingsShopName")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Phone className="w-3.5 h-3.5 text-zinc-500" />
              <span className="font-mono">{phone}</span>
              <span className="text-[10px] text-zinc-600">
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
            className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3"
          >
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>{t("settingsPinSection")}</span>
            </div>

            {pinMsg && (
              <div
                className={`p-2.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 ${
                  pinMsg.type === "success"
                    ? "bg-emerald-950/60 border border-emerald-700/60 text-emerald-300"
                    : "bg-rose-950/60 border border-rose-700/60 text-rose-300"
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
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                  {t("currentPin")}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm font-mono tracking-widest focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                  {t("newPin")}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm font-mono tracking-widest focus:outline-hidden focus:border-emerald-500"
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
