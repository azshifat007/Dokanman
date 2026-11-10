"use client";

import { useLanguage } from "@/context/LanguageContext";
import { logoutAction } from "@/actions/auth-actions";
import { DashboardStats } from "@/types";
import {
  Coffee,
  BookOpen,
  ShoppingBag,
  Wallet,
  AlertCircle,
  Receipt,
  FileSpreadsheet,
  FileText,
  LogOut,
  Languages,
  TrendingUp,
  Package
} from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  shopName?: string;
  phone?: string;
  stats: DashboardStats;
  currentTab: "pos" | "ledger" | "expenses";
  onTabChange: (tab: "pos" | "ledger" | "expenses") => void;
  onOpenDailySlip: () => void;
  onOpenBackup: () => void;
  onOpenProducts: () => void;
}

export function Header({
  shopName = "মামা টং দোকান",
  phone,
  stats,
  currentTab,
  onTabChange,
  onOpenDailySlip,
  onOpenBackup,
  onOpenProducts,
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

  return (
    <header className="sticky top-0 z-40 bg-zinc-900 text-white shadow-md border-b border-zinc-800">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-xs">
            <Coffee className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-xs">
                {shopName}
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                {t("live")}
              </span>
            </div>
            {phone && (
              <p className="text-[11px] text-zinc-400 font-mono">
                {phone}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* View Switcher Tabs */}
          <div className="flex items-center gap-1 bg-zinc-800/90 p-1 rounded-xl border border-zinc-700">
            <button
              onClick={() => onTabChange("pos")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === "pos"
                  ? "bg-amber-500 text-zinc-950 shadow-sm"
                  : "text-zinc-300 hover:text-white hover:bg-zinc-700/50"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t("tabPos")}</span>
            </button>
            <button
              onClick={() => onTabChange("ledger")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === "ledger"
                  ? "bg-amber-500 text-zinc-950 shadow-sm"
                  : "text-zinc-300 hover:text-white hover:bg-zinc-700/50"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t("tabLedger")}</span>
            </button>
            <button
              onClick={() => onTabChange("expenses")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === "expenses"
                  ? "bg-amber-500 text-zinc-950 shadow-sm"
                  : "text-zinc-300 hover:text-white hover:bg-zinc-700/50"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t("tabExpenses")}</span>
            </button>
          </div>

          {/* Product Catalog Button */}
          <button
            onClick={onOpenProducts}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-400 border border-zinc-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="পণ্য তালিকা ও দাম"
          >
            <Package className="w-4 h-4" />
            <span className="hidden md:inline">পণ্য</span>
          </button>

          {/* Daily Closing Slip Button */}
          <button
            onClick={onOpenDailySlip}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="আজকের হিসাব স্লিপ"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">হিসাব স্লিপ</span>
          </button>

          {/* Backup / Export Button */}
          <button
            onClick={onOpenBackup}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="ব্যাকআপ ও এক্সপোর্ট"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden md:inline">ব্যাকআপ</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold transition-colors"
            title="ভাষা পরিবর্তন করুন"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === "bn" ? "EN" : "বাংলা"}</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-950/60 hover:text-rose-400 text-zinc-400 border border-zinc-700 text-xs transition-colors"
            title="লগআউট"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Financial Metrics Strip */}
      <div className="bg-zinc-950/90 border-t border-zinc-800/60 px-3 sm:px-4 py-2">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 text-xs">
          {/* Today Cash */}
          <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-800/40 px-2.5 py-1.5 rounded-lg">
            <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="text-zinc-400 block text-[10px]">{t("todayCash")}:</span>
              <span className="font-bold text-emerald-400 text-xs sm:text-sm font-mono">
                {formatCurrency(stats.todayCash)}
              </span>
            </div>
          </div>

          {/* Today Due */}
          <div className="flex items-center gap-2 bg-amber-950/30 border border-amber-800/40 px-2.5 py-1.5 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="text-zinc-400 block text-[10px]">{t("todayDue")}:</span>
              <span className="font-bold text-amber-400 text-xs sm:text-sm font-mono">
                {formatCurrency(stats.todayDue)}
              </span>
            </div>
          </div>

          {/* Total Store Due */}
          <div className="flex items-center gap-2 bg-rose-950/30 border border-rose-800/40 px-2.5 py-1.5 rounded-lg">
            <BookOpen className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <div className="truncate">
              <span className="text-zinc-400 block text-[10px]">{t("totalStoreDue")}:</span>
              <span className="font-bold text-rose-400 text-xs sm:text-sm font-mono">
                {formatCurrency(stats.totalActiveDue)}
              </span>
            </div>
          </div>

          {/* Today Expense */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-lg">
            <Receipt className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <div className="truncate">
              <span className="text-zinc-400 block text-[10px]">{t("todayExpense")}:</span>
              <span className="font-bold text-red-400 text-xs sm:text-sm font-mono">
                {formatCurrency(stats.todayExpense)}
              </span>
            </div>
          </div>

          {/* Net Cash in Drawer */}
          <div className="hidden lg:flex items-center gap-2 bg-cyan-950/30 border border-cyan-800/40 px-2.5 py-1.5 rounded-lg">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="truncate">
              <span className="text-zinc-400 block text-[10px]">{t("cashInDrawer")}:</span>
              <span className="font-black text-cyan-400 text-xs sm:text-sm font-mono">
                {formatCurrency(Math.max(0, stats.todayCash - stats.todayExpense))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
