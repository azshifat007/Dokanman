"use client";

import { useLanguage } from "@/context/LanguageContext";
import { DashboardStats } from "@/types";
import { X, Printer, MessageCircle, FileText, CheckCircle2 } from "lucide-react";

interface DailyClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  stats: DashboardStats;
}

export function DailyClosingModal({ isOpen, onClose, shopName, stats }: DailyClosingModalProps) {
  const { lang, t, formatCurrency } = useLanguage();

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const netCashInDrawer = Math.max(0, stats.todayCash - stats.todayExpense);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `📊 *${shopName} — আজকের হিসাব স্লিপ*\n` +
      `📅 তারিখ: ${todayStr}\n\n` +
      `💵 নগদ ক্যাশ আদায়: ৳${stats.todayCash.toFixed(0)}\n` +
      `🔴 বাকি বিক্রি: ৳${stats.todayDue.toFixed(0)}\n` +
      `📦 আজকের অর্ডার সংখ্যা: ${stats.todayOrdersCount} টি\n` +
      `💸 দোকানের খরচ: ৳${stats.todayExpense.toFixed(0)}\n` +
      `--------------------------------\n` +
      `💰 *ক্যাশ বাক্সে থাকা টাকা: ৳${netCashInDrawer.toFixed(0)}*\n` +
      `📈 মোট বকেয়া দেনা: ৳${stats.totalActiveDue.toFixed(0)}\n\n` +
      `_দোকানম্যান (Dokanman) অ্যাপ থেকে পাঠানো হিসাব_`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 bg-zinc-950/70">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <FileText className="w-5 h-5" />
            <span>{t("dailySummarySlip")}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Slip Design */}
        <div className="p-6 space-y-4 bg-zinc-950/90 text-white font-mono text-xs border-b border-zinc-800">
          <div className="text-center pb-3 border-b border-dashed border-zinc-700 space-y-1">
            <h3 className="font-bold text-base text-white tracking-wide">{shopName}</h3>
            <p className="text-[11px] text-zinc-400">{todayStr}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              ★ দৈনিক ক্লোজিং হিসাব স্লিপ ★
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">আজকের ক্যাশ আদায়:</span>
              <span className="font-bold text-emerald-400 text-sm">
                {formatCurrency(stats.todayCash)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">আজকের বাকি বিক্রি:</span>
              <span className="font-bold text-rose-400">
                {formatCurrency(stats.todayDue)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">মোট সম্পন্ন অর্ডার:</span>
              <span className="font-bold text-white">{stats.todayOrdersCount} টি</span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">আজকের দোকানের খরচ:</span>
              <span className="font-bold text-rose-400">
                - {formatCurrency(stats.todayExpense)}
              </span>
            </div>

            <div className="pt-2 border-t-2 border-dashed border-zinc-600 flex justify-between items-baseline text-sm">
              <span className="font-bold text-amber-300">ক্যাশ বাক্সে থাকা টাকা:</span>
              <span className="font-black text-amber-400 text-base">
                {formatCurrency(netCashInDrawer)}
              </span>
            </div>

            <div className="flex justify-between pt-1 text-[11px] text-zinc-500">
              <span>খাতায় মোট দেনা পাওনা:</span>
              <span className="font-bold text-zinc-400 font-mono">
                {formatCurrency(stats.totalActiveDue)}
              </span>
            </div>
          </div>

          <div className="text-center text-[10px] text-zinc-500 pt-3 border-t border-dashed border-zinc-700">
            দোকানম্যান (Dokanman) — হিসাব সোজা, মন চাঙ্গা
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-zinc-900 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors border border-zinc-700"
          >
            <Printer className="w-4 h-4 text-zinc-400" />
            <span>{t("printSlip")}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/20"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t("shareWhatsApp")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
