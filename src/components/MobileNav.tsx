"use client";

import { useState } from "react";
import {
  BookOpen,
  FileSpreadsheet,
  FileText,
  Languages,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Package,
  Receipt,
  Settings,
  ShoppingBag,
  X,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { AppTab } from "@/types";

interface MobileNavProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenProducts: () => void;
  onOpenDailySlip: () => void;
  onOpenBackup: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

const TABS: Array<{
  id: AppTab;
  label: "tabDashboard" | "tabPos" | "tabLedger" | "tabExpenses";
  icon: typeof LayoutDashboard;
}> = [
  { id: "dashboard", label: "tabDashboard", icon: LayoutDashboard },
  { id: "pos", label: "tabPos", icon: ShoppingBag },
  { id: "ledger", label: "tabLedger", icon: BookOpen },
  { id: "expenses", label: "tabExpenses", icon: Receipt },
];

/** Thumb-reach navigation for phones; desktop uses the header nav instead. */
export function MobileNav({
  currentTab,
  onTabChange,
  onOpenProducts,
  onOpenDailySlip,
  onOpenBackup,
  onOpenSettings,
  onLogout,
}: MobileNavProps) {
  const { lang, toggleLang, t } = useLanguage();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const run = (action: () => void) => {
    setIsMoreOpen(false);
    action();
  };

  const sheetActions = [
    { label: t("productCatalogTitle"), icon: <Package className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />, onClick: onOpenProducts },
    { label: t("dailySummarySlip"), icon: <FileText className="h-4 w-4 text-amber-700 dark:text-amber-300" />, onClick: onOpenDailySlip },
    { label: t("backupTitle"), icon: <FileSpreadsheet className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />, onClick: onOpenBackup },
    { label: t("settingsTitle"), icon: <Settings className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />, onClick: onOpenSettings },
  ];

  return (
    <>
      <nav
        aria-label={t("tabDashboard")}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-1.5 py-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                aria-label={t(tab.label)}
                aria-pressed={isActive}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors ${
                  isActive ? "text-amber-700 dark:text-amber-400" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]" : ""}`} />
                <span className="truncate">{t(tab.label)}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            aria-label={t("quickActionsTitle")}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors ${
              isMoreOpen ? "text-amber-700 dark:text-amber-400" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="truncate">{lang === "bn" ? "আরও" : "More"}</span>
          </button>
        </div>
      </nav>

      {isMoreOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm animate-fade md:hidden">
          <button
            type="button"
            aria-label={t("cancel")}
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="animate-rise relative w-full rounded-t-3xl border-t border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-black/15 dark:bg-white/15" />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{t("quickActionsTitle")}</h3>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="rounded-lg p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                aria-label={t("cancel")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {sheetActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => run(action.onClick)}
                  className="flex items-center gap-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] px-3 py-3 text-left text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 ring-1 ring-black/5 dark:ring-white/5 transition active:scale-[0.98]"
                >
                  {action.icon}
                  <span className="line-clamp-2">{action.label}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => run(toggleLang)}
                className="flex items-center gap-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] px-3 py-3 text-left text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 ring-1 ring-black/5 dark:ring-white/5 transition active:scale-[0.98]"
              >
                <Languages className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                <span>{lang === "bn" ? "English" : "বাংলা"}</span>
              </button>
              <button
                type="button"
                onClick={() => run(onLogout)}
                className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-3 py-3 text-left text-[11px] font-semibold text-rose-600 dark:text-rose-300 ring-1 ring-rose-500/20 transition active:scale-[0.98]"
              >
                <LogOut className="h-4 w-4" />
                <span>{t("logout")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
