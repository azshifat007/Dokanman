"use client";

import { useLanguage } from "@/context/LanguageContext";
import { DashboardStats } from "@/types";
import { X, Printer, MessageCircle, FileText } from "lucide-react";

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

  const netCashInDrawer = stats.todayCash - stats.todayExpense;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `📊 *${shopName} — ${t("dailySummarySlip")}*\n` +
        `📅 ${todayStr}\n\n` +
        `${t("slipCashSales")} ${formatCurrency(stats.todayCash)}\n` +
        `${t("slipCreditSales")} ${formatCurrency(stats.todayDue)}\n` +
        `${t("slipOrders")} ${stats.todayOrdersCount} ${t("itemsUnit")}\n` +
        `${t("slipExpenses")} ${formatCurrency(stats.todayExpense)}\n` +
        `--------------------------------\n` +
        `💰 *${t("slipNetCash")} ${formatCurrency(netCashInDrawer)}*\n` +
        `${t("slipTotalDue")} ${formatCurrency(stats.totalActiveDue)}\n\n` +
        `_${t("appName")} (Dokanman)_`
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
              {t("slipHeading")}
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">{t("slipCashSales")}</span>
              <span className="font-bold text-emerald-400 text-sm">
                {formatCurrency(stats.todayCash)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">{t("slipCreditSales")}</span>
              <span className="font-bold text-rose-400">{formatCurrency(stats.todayDue)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">{t("slipOrders")}</span>
              <span className="font-bold text-white">
                {stats.todayOrdersCount} {t("itemsUnit")}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">{t("slipExpenses")}</span>
              <span className="font-bold text-rose-400">
                - {formatCurrency(stats.todayExpense)}
              </span>
            </div>

            <div className="pt-2 border-t-2 border-dashed border-zinc-600 flex justify-between items-baseline text-sm">
              <span className="font-bold text-amber-300">{t("slipNetCash")}</span>
              <span
                className={`font-black text-base ${
                  netCashInDrawer < 0 ? "text-rose-400" : "text-amber-400"
                }`}
              >
                {formatCurrency(netCashInDrawer)}
              </span>
            </div>

            <div className="flex justify-between pt-1 text-[11px] text-zinc-500">
              <span>{t("slipTotalDue")}</span>
              <span className="font-bold text-zinc-400 font-mono">
                {formatCurrency(stats.totalActiveDue)}
              </span>
            </div>
          </div>

          <div className="text-center text-[10px] text-zinc-500 pt-3 border-t border-dashed border-zinc-700">
            {t("slipFooter")}
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
