"use client";

import Link from "next/navigation";
import { Coffee, BookOpen, ShoppingBag, Wallet, AlertCircle } from "lucide-react";
import { DashboardStats } from "@/types";

interface HeaderProps {
  shopName?: string;
  stats: DashboardStats;
  currentTab: "pos" | "ledger";
  onTabChange: (tab: "pos" | "ledger") => void;
}

export function Header({ shopName = "মামা টং দোকান", stats, currentTab, onTabChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-zinc-900 text-white shadow-md border-b border-zinc-800">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Coffee className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                {shopName}
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                লাইভ
              </span>
            </div>
            <p className="text-xs text-zinc-400">টং ও দোকান বাকির খাতা ও দ্রুত ক্যাশ কাউন্টার</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-800/90 p-1 rounded-xl border border-zinc-700">
          <button
            onClick={() => onTabChange("pos")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === "pos"
                ? "bg-amber-500 text-zinc-950 shadow-sm"
                : "text-zinc-300 hover:text-white hover:bg-zinc-700/50"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>POS কাউন্টার</span>
          </button>
          <button
            onClick={() => onTabChange("ledger")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === "ledger"
                ? "bg-amber-500 text-zinc-950 shadow-sm"
                : "text-zinc-300 hover:text-white hover:bg-zinc-700/50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>বাকির খাতা</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Strip */}
      <div className="bg-zinc-950/80 border-t border-zinc-800/60 px-3 sm:px-4 py-2">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-2 text-center sm:text-left sm:flex sm:items-center sm:justify-between text-xs">
          {/* Today Cash */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 bg-emerald-950/30 border border-emerald-800/40 px-2.5 py-1.5 rounded-lg">
            <span className="text-zinc-400 flex items-center justify-center sm:justify-start gap-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              আজকের ক্যাশ:
            </span>
            <span className="font-bold text-emerald-400 text-sm">৳{stats.todayCash.toFixed(0)}</span>
          </div>

          {/* Today Due */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 bg-amber-950/30 border border-amber-800/40 px-2.5 py-1.5 rounded-lg">
            <span className="text-zinc-400 flex items-center justify-center sm:justify-start gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              আজকের বাকি:
            </span>
            <span className="font-bold text-amber-400 text-sm">৳{stats.todayDue.toFixed(0)}</span>
          </div>

          {/* Total Store Due */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 bg-rose-950/30 border border-rose-800/40 px-2.5 py-1.5 rounded-lg">
            <span className="text-zinc-400 flex items-center justify-center sm:justify-start gap-1">
              <BookOpen className="w-3.5 h-3.5 text-rose-400" />
              দোকানের মোট বাকি:
            </span>
            <span className="font-bold text-rose-400 text-sm">৳{stats.totalActiveDue.toFixed(0)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
