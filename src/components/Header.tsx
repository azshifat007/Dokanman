"use client";

import { useLanguage } from "@/context/LanguageContext";
import { logoutAction } from "@/actions/auth-actions";
import { AppTab, DashboardStats } from "@/types";
import {
  Coffee,
  BookOpen,
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  AlertCircle,
  Receipt,
  FileSpreadsheet,
  FileText,
  LogOut,
  Languages,
  TrendingUp,
  Package,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  shopName?: string;
  phone?: string;
  stats: DashboardStats;
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenDailySlip: () => void;
  onOpenBackup: () => void;
  onOpenProducts: () => void;
  onOpenSettings: () => void;
}

const TABS: Array<{ id: AppTab; label: "tabDashboard" | "tabPos" | "tabLedger" | "tabExpenses"; icon: typeof Coffee }> = [
  { id: "dashboard", label: "tabDashboard", icon: LayoutDashboard },
  { id: "pos", label: "tabPos", icon: ShoppingBag },
  { id: "ledger", label: "tabLedger", icon: BookOpen },
  { id: "expenses", label: "tabExpenses", icon: Receipt },
];

export function Header({
  shopName = "মামা টং দোকান",
  phone,
  stats,
  currentTab,
  onTabChange,
  onOpenDailySlip,
  onOpenBackup,
  onOpenProducts,
  onOpenSettings,
}: HeaderProps) {
  const { lang, toggleLang, t, formatCurrency } = useLanguage();
  const router = useRouter();

  const handleLogout = async () => {
    if (confirm(lang === "bn" ? "আপনি কি দোকান থেকে লগআউট করতে চান?" : "Are you sure you want to log out?")) {
      await logoutAction();
      router.push("/login");
      router.refresh();
    }
  };

  const utilityButton =
    "flex items-center gap-1.5 rounded-xl bg-white/[0.04] px-2.5 py-2 text-xs font-semibold text-zinc-300 ring-1 ring-white/10 transition hover:bg-white/[0.09] hover:text-white";

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/85 text-white backdrop-blur-xl">
      {/* Brand + primary navigation */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 shadow-lg shadow-amber-900/30">
            <Coffee className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="max-w-[150px] truncate text-sm font-extrabold tracking-tight text-white sm:max-w-xs sm:text-base">
                {shopName}
              </h1>
              <span className="hidden items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/20 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {t("live")}
              </span>
            </div>
            {phone && <p className="truncate font-mono text-[11px] text-zinc-500">{phone}</p>}
          </div>
        </div>

        {/* Desktop segmented nav */}
        <nav
          aria-label={t("tabDashboard")}
          className="hidden items-center gap-0.5 rounded-xl bg-white/[0.04] p-1 ring-1 ring-white/5 md:flex"
        >
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
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-amber-500 text-zinc-950 shadow-sm shadow-amber-900/40"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t(tab.label)}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenProducts}
            className={`${utilityButton} hidden md:flex`}
            title={t("productCatalogTitle")}
          >
            <Package className="h-4 w-4 text-cyan-300" />
            <span>{t("navProducts")}</span>
          </button>

          <button
            type="button"
            onClick={onOpenDailySlip}
            className={`${utilityButton} hidden lg:flex`}
            title={t("dailySummarySlip")}
          >
            <FileText className="h-4 w-4 text-amber-300" />
            <span>{t("navSlip")}</span>
          </button>

          <button
            type="button"
            onClick={onOpenBackup}
            className={`${utilityButton} hidden lg:flex`}
            title={t("backupTitle")}
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-300" />
            <span>{t("navBackup")}</span>
          </button>

          <button
            type="button"
            onClick={toggleLang}
            className={`${utilityButton} px-2 sm:px-2.5`}
            title={lang === "bn" ? "Switch to English" : "বাংলায় দেখুন"}
            aria-label={lang === "bn" ? "Switch to English" : "বাংলায় দেখুন"}
          >
            <Languages className="h-4 w-4 text-amber-300" />
            <span className="hidden sm:inline">{lang === "bn" ? "EN" : "বাংলা"}</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className={`${utilityButton} hidden px-2 md:flex`}
            title={t("settingsTitle")}
            aria-label={t("settingsTitle")}
          >
            <Settings className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="hidden rounded-xl bg-white/[0.04] p-2 text-zinc-400 ring-1 ring-white/10 transition hover:bg-rose-500/15 hover:text-rose-300 md:flex"
            title={t("logout")}
            aria-label={t("logout")}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Money strip: scrollable chips on phones, aligned grid from md up */}
      <div className="border-t border-white/5 bg-black/20">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-3 py-2 sm:px-4 md:grid md:grid-cols-4 md:overflow-visible">
          {[
            {
              label: t("todayCash"),
              value: formatCurrency(stats.todayCash),
              icon: <Wallet className="h-3.5 w-3.5 text-emerald-400" />,
              tone: "text-emerald-300",
            },
            {
              label: t("todayDue"),
              value: formatCurrency(stats.todayDue),
              icon: <AlertCircle className="h-3.5 w-3.5 text-amber-400" />,
              tone: "text-amber-300",
            },
            {
              label: t("totalStoreDue"),
              value: formatCurrency(stats.totalActiveDue),
              icon: <BookOpen className="h-3.5 w-3.5 text-rose-400" />,
              tone: "text-rose-300",
            },
            {
              label: t("cashInDrawer"),
              value: formatCurrency(stats.todayCash - stats.todayExpense),
              icon: <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />,
              tone:
                stats.todayCash - stats.todayExpense < 0 ? "text-rose-300" : "text-cyan-300",
            },
          ].map((metric) => (
            <div
              key={metric.label}
              className="flex min-w-[132px] shrink-0 items-center gap-2 rounded-xl bg-white/[0.03] px-2.5 py-1.5 ring-1 ring-white/5 md:min-w-0"
            >
              {metric.icon}
              <div className="min-w-0 leading-tight">
                <span className="block truncate text-[10px] text-zinc-500">{metric.label}</span>
                <span className={`font-mono text-xs font-bold sm:text-sm ${metric.tone}`}>
                  {metric.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
