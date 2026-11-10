"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Clock3,
  Coffee,
  FileSpreadsheet,
  FileText,
  History,
  Package,
  Plus,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { AppTab, Customer, DashboardInsights, DashboardStats } from "@/types";

interface DashboardProps {
  shopName: string;
  stats: DashboardStats;
  insights: DashboardInsights;
  onNavigate: (tab: AppTab) => void;
  onCollectDue: (customerId: string) => void;
  onOpenDailySlip: () => void;
  onOpenBackup: () => void;
  onOpenProducts: () => void;
  onOpenSalesHistory: () => void;
  customers: Customer[];
}

const CARD =
  "rounded-2xl bg-white dark:bg-zinc-900/60 ring-1 ring-black/5 dark:ring-white/5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]";

function greetingKey(): "greetingMorning" | "greetingAfternoon" | "greetingEvening" {
  const hour = new Date().getHours();
  if (hour < 12) return "greetingMorning";
  if (hour < 17) return "greetingAfternoon";
  return "greetingEvening";
}

function StatCard({
  label,
  value,
  icon,
  accent,
  hint,
  delta,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: "emerald" | "amber" | "rose" | "zinc";
  hint?: string;
  delta?: number | null;
}) {
  const accents = {
    emerald: "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 ring-emerald-500/20",
    amber: "text-amber-700 dark:text-amber-300 bg-amber-500/10 ring-amber-500/20",
    rose: "text-rose-600 dark:text-rose-300 bg-rose-500/10 ring-rose-500/20",
    zinc: "text-zinc-700 dark:text-zinc-300 bg-zinc-500/15 dark:bg-zinc-500/10 ring-zinc-300 dark:ring-zinc-500/20",
  } as const;

  const valueTone = {
    emerald: "text-emerald-700 dark:text-emerald-300",
    amber: "text-amber-700 dark:text-amber-300",
    rose: "text-rose-600 dark:text-rose-300",
    zinc: "text-zinc-900 dark:text-white",
  } as const;

  return (
    <div className={`${CARD} p-3.5 sm:p-4 transition-colors hover:ring-black/10 dark:hover:ring-white/10`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          {label}
        </span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ring-1 ${accents[accent]}`}>
          {icon}
        </span>
      </div>
      <div className={`mt-2 font-mono text-lg sm:text-2xl font-extrabold tracking-tight ${valueTone[accent]}`}>
        {value}
      </div>
      <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500">
        {typeof delta === "number" && (
          <span
            className={`inline-flex items-center gap-0.5 font-semibold ${
              delta > 0 ? "text-emerald-700 dark:text-emerald-400" : delta < 0 ? "text-rose-600 dark:text-rose-400" : "text-zinc-500"
            }`}
          >
            {delta > 0 ? <ArrowUpRight className="h-3 w-3" /> : delta < 0 ? <ArrowDownRight className="h-3 w-3" /> : null}
            {delta === 0 ? "" : `${Math.abs(Math.round(delta))}%`}
          </span>
        )}
        {hint && <span className="truncate">{hint}</span>}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-2">
      <div>
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{title}</h3>
        {hint && <p className="mt-0.5 text-[11px] text-zinc-500">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function Dashboard({
  shopName,
  stats,
  insights,
  onNavigate,
  onCollectDue,
  onOpenDailySlip,
  onOpenBackup,
  onOpenProducts,
  onOpenSalesHistory,
  customers,
}: DashboardProps) {
  const { lang, t, formatCurrency } = useLanguage();

  const locale = lang === "bn" ? "bn-BD" : "en-GB";
  const weekday = (isoDate: string) =>
    new Date(`${isoDate}T12:00:00`).toLocaleDateString(locale, { weekday: "short" });

  const { daily, recentSales, topDebtors, topProducts } = insights;

  const chartMax = Math.max(
    1,
    ...daily.map((point) => point.cash + point.credit)
  );
  const weekCredit = daily.reduce((sum, point) => sum + point.credit, 0);
  const todayKey = daily[daily.length - 1]?.date;

  // Percentage change vs yesterday's cash; null when there is no basis for comparison.
  const delta =
    insights.yesterdayCash > 0
      ? ((stats.todayCash - insights.yesterdayCash) / insights.yesterdayCash) * 100
      : null;

  const pendingSettlement = topDebtors.length > 0 ? topDebtors[0] : null;

  return (
    <div className="space-y-4 animate-rise">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white dark:from-zinc-900 via-white dark:via-zinc-900 to-amber-100/60 dark:to-amber-950/40 ring-1 ring-black/5 dark:ring-white/5 p-4 sm:p-5">
        <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400/90">
              <span suppressHydrationWarning>{t(greetingKey())}</span>
            </p>
            <h2 className="mt-1 truncate text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {shopName}
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-600 dark:text-zinc-400">
              <span suppressHydrationWarning>
                {new Date().toLocaleDateString(locale, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <span className="text-zinc-500 dark:text-zinc-600">•</span>
              <span>
                {t("ordersToday")}: <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{stats.todayOrdersCount}</span>
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate("pos")}
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-extrabold text-zinc-950 shadow-lg shadow-amber-900/20 transition active:scale-[0.98] hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" />
              {t("newSaleBtn")}
            </button>
            <button
              type="button"
              onClick={onOpenDailySlip}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-black/5 dark:bg-white/5 px-3 py-2.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200 ring-1 ring-black/10 dark:ring-white/10 transition hover:bg-black/10 dark:hover:bg-white/10"
              title={t("dailySummarySlip")}
            >
              <FileText className="h-4 w-4 text-amber-700 dark:text-amber-300" />
              <span className="hidden sm:inline">{t("navSlip")}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Key numbers */}
      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatCard
          label={t("todayCash")}
          value={formatCurrency(stats.todayCash)}
          icon={<Wallet className="h-4 w-4" />}
          accent="emerald"
          delta={delta}
          hint={`${t("vsYesterday")} ${formatCurrency(insights.yesterdayCash)}`}
        />
        <StatCard
          label={t("todayDue")}
          value={formatCurrency(stats.todayDue)}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="amber"
          hint={`${t("avgSaleLabel")} ${formatCurrency(insights.averageSale)}`}
        />
        <StatCard
          label={t("totalStoreDue")}
          value={formatCurrency(stats.totalActiveDue)}
          icon={<BookOpen className="h-4 w-4" />}
          accent="rose"
          hint={`${insights.customerCount} ${t("customersLabel")}`}
        />
        <StatCard
          label={t("cashInDrawer")}
          value={formatCurrency(stats.todayCash - stats.todayExpense)}
          icon={<Coffee className="h-4 w-4" />}
          accent="zinc"
          hint={`${t("todayExpense")} ${formatCurrency(stats.todayExpense)}`}
        />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {/* 7-day trend */}
          <section className={`${CARD} overflow-hidden`}>
            <SectionHeader
              title={t("salesTrendTitle")}
              hint={t("salesTrendHint")}
              action={
                <div className="flex items-center gap-3 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    {t("cashCollected")}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500/80" />
                    {t("creditGiven")}
                  </span>
                </div>
              }
            />

            <div className="px-4 pb-4">
              <div className="flex h-36 items-end gap-1.5 sm:gap-3">
                {daily.map((point) => {
                  const total = point.cash + point.credit;
                  const isToday = point.date === todayKey;
                  return (
                    <div key={point.date} className="group flex flex-1 flex-col items-center">
                      <div className="flex h-28 w-full items-end justify-center gap-[3px]">
                        <div
                          className={`w-2.5 sm:w-4 rounded-t-md bg-gradient-to-t from-amber-600 to-amber-400 transition-opacity ${
                            total === 0 ? "opacity-20" : "opacity-90 group-hover:opacity-100"
                          }`}
                          style={{ height: `${Math.max(2, (point.cash / chartMax) * 100)}%` }}
                          title={`${formatCurrency(point.cash)} — ${t("cashCollected")}`}
                        />
                        <div
                          className={`w-2.5 sm:w-4 rounded-t-md bg-gradient-to-t from-rose-800 to-rose-500/90 transition-opacity ${
                            point.credit === 0 ? "opacity-20" : "opacity-90 group-hover:opacity-100"
                          }`}
                          style={{ height: `${Math.max(2, (point.credit / chartMax) * 100)}%` }}
                          title={`${formatCurrency(point.credit)} — ${t("creditGiven")}`}
                        />
                      </div>
                      <span
                        className={`mt-1.5 text-[10px] font-semibold ${
                          isToday ? "text-amber-700 dark:text-amber-300" : "text-zinc-500"
                        }`}
                      >
                        {weekday(point.date)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {insights.weekSales === 0 && (
                <p className="mt-3 rounded-xl bg-white/60 dark:bg-zinc-950/60 px-3 py-2 text-center text-[11px] text-zinc-500">
                  {t("noSalesThisWeek")}
                </p>
              )}

              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-black/5 dark:border-white/5 pt-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-zinc-500">{t("weekTotal")}</p>
                  <p className="mt-0.5 font-mono text-sm font-bold text-zinc-900 dark:text-white">
                    {formatCurrency(insights.weekSales)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-zinc-500">{t("creditGiven")}</p>
                  <p className="mt-0.5 font-mono text-sm font-bold text-rose-600 dark:text-rose-300">
                    {formatCurrency(weekCredit)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-zinc-500">{t("expenseShort")}</p>
                  <p className="mt-0.5 font-mono text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    {formatCurrency(daily.reduce((sum, point) => sum + point.expense, 0))}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Recent sales */}
          <section className={`${CARD} overflow-hidden`}>
            <SectionHeader
              title={t("recentSalesTitle")}
              action={
                <button
                  type="button"
                  onClick={onOpenSalesHistory}
                  className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                >
                  {t("seeAll")}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              }
            />
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {recentSales.length === 0 && (
                <p className="px-4 pb-4 text-xs text-zinc-500">{t("noSalesYet")}</p>
              )}
              {recentSales.map((sale) => {
                const statusStyles =
                  sale.status === "PAID"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/25"
                    : sale.status === "PARTIAL"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/25"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-300 ring-rose-500/25";
                return (
                  <div key={sale.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 ring-1 ring-black/10 dark:ring-white/10">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-zinc-900 dark:text-white">
                        {sale.customerName || t("walkInCustomer")}
                      </p>
                      <p className="flex items-center gap-1 text-[10px] text-zinc-500" suppressHydrationWarning>
                        <Clock3 className="h-2.5 w-2.5" />
                        {new Date(sale.createdAt).toLocaleString(locale, {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
                        {formatCurrency(sale.totalAmount)}
                      </p>
                      <span
                        className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ring-1 ${statusStyles}`}
                      >
                        {sale.status === "PAID"
                          ? lang === "bn" ? "পরিশোধিত" : "Paid"
                          : sale.status === "PARTIAL"
                            ? lang === "bn" ? "আংশিক" : "Partial"
                            : lang === "bn" ? "বাকি" : "Due"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-4 lg:col-span-4">
          {/* Dues to collect */}
          <section className={`${CARD} overflow-hidden`}>
            <SectionHeader
              title={t("topDebtorsTitle")}
              action={
                <button
                  type="button"
                  onClick={() => onNavigate("ledger")}
                  className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                >
                  {t("seeAll")}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              }
            />
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {topDebtors.length === 0 && (
                <p className="px-4 pb-4 text-xs text-zinc-500">{t("allClear")}</p>
              )}
              {topDebtors.map((debtor) => (
                <div key={debtor.id} className="flex items-center gap-2.5 px-4 py-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-[11px] font-bold text-rose-600 dark:text-rose-300 ring-1 ring-rose-500/20">
                    {debtor.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-zinc-900 dark:text-white">{debtor.name}</p>
                    {debtor.phone && (
                      <p className="truncate font-mono text-[10px] text-zinc-500">{debtor.phone}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-300">
                      {formatCurrency(debtor.due)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onCollectDue(debtor.id)}
                      className="rounded-lg bg-black/5 dark:bg-white/5 px-2 py-1 text-[10px] font-bold text-zinc-800 dark:text-zinc-200 ring-1 ring-black/10 dark:ring-white/10 transition hover:bg-amber-500 hover:text-zinc-950"
                    >
                      {t("settleDueBtn")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {pendingSettlement && (
              <button
                type="button"
                onClick={() => onCollectDue(pendingSettlement.id)}
                className="m-3 flex w-[calc(100%-1.5rem)] items-center justify-center gap-1.5 rounded-xl bg-rose-500/15 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-200 ring-1 ring-rose-500/25 transition hover:bg-rose-500/25"
              >
                <BookOpen className="h-3.5 w-3.5" />
                {t("collectDueBtn")}
              </button>
            )}
          </section>

          {/* Best sellers */}
          <section className={`${CARD} overflow-hidden`}>
            <SectionHeader title={t("topItemsTitle")} />
            <div className="space-y-2.5 px-4 pb-4">
              {topProducts.length === 0 && (
                <p className="text-xs text-zinc-500">{t("noItemData")}</p>
              )}
              {topProducts.map((item) => {
                const maxQty = Math.max(1, ...topProducts.map((entry) => entry.quantity));
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="truncate font-semibold text-zinc-800 dark:text-zinc-200">{item.name}</span>
                      <span className="ml-2 shrink-0 font-mono text-zinc-600 dark:text-zinc-400">
                        {item.quantity} {t("unitsSold")}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                        style={{ width: `${Math.max(6, (item.quantity / maxQty) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick actions */}
          <section className={`${CARD} overflow-hidden`}>
            <SectionHeader title={t("quickActionsTitle")} />
            <div className="grid grid-cols-2 gap-2 px-4 pb-4">
              {[
                { label: t("newSaleBtn"), icon: <Plus className="h-4 w-4" />, onClick: () => onNavigate("pos"), tone: "text-amber-700 dark:text-amber-300" },
                { label: t("tabLedger"), icon: <BookOpen className="h-4 w-4" />, onClick: () => onNavigate("ledger"), tone: "text-rose-600 dark:text-rose-300" },
                { label: t("addExpenseShort"), icon: <Receipt className="h-4 w-4" />, onClick: () => onNavigate("expenses"), tone: "text-emerald-700 dark:text-emerald-300" },
                { label: t("salesLogTitle"), icon: <History className="h-4 w-4" />, onClick: onOpenSalesHistory, tone: "text-sky-700 dark:text-sky-300" },
                { label: t("navProducts"), icon: <Package className="h-4 w-4" />, onClick: onOpenProducts, tone: "text-cyan-700 dark:text-cyan-300" },
                { label: t("navSlip"), icon: <FileText className="h-4 w-4" />, onClick: onOpenDailySlip, tone: "text-amber-700 dark:text-amber-300" },
                { label: t("navBackup"), icon: <FileSpreadsheet className="h-4 w-4" />, onClick: onOpenBackup, tone: "text-emerald-700 dark:text-emerald-300" },
              ].map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className="flex items-center gap-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] px-2.5 py-2 text-left text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 ring-1 ring-black/5 dark:ring-white/5 transition hover:bg-black/[0.07] dark:hover:bg-white/[0.07] active:scale-[0.98]"
                >
                  <span className={action.tone}>{action.icon}</span>
                  <span className="truncate">{action.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Shop footprint */}
          <section className={`${CARD} flex items-center justify-between px-4 py-3`}>
            <div className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
              <Package className="h-3.5 w-3.5 text-zinc-500" />
              {t("productsLabel")}
              <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{insights.productCount}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
              <Users className="h-3.5 w-3.5 text-zinc-500" />
              {t("customersLabel")}
              <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                {customers.filter((customer) => parseFloat(customer.totalDue || "0") > 0).length}
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
