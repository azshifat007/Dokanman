"use client";

import { useEffect, useState } from "react";
import { X, Receipt, Clock3, Loader2, ChevronDown, Banknote, AlertTriangle, ShoppingBag } from "lucide-react";
import { getSalesHistoryAction } from "@/actions/pos-actions";
import { useLanguage } from "@/context/LanguageContext";

interface SalesHistoryItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface SalesHistoryOrder {
  id: string;
  customerName: string | null;
  totalAmount: string;
  paidAmount: string;
  dueAmount: string;
  status: "PAID" | "DUE" | "PARTIAL";
  createdAt: string;
  items: SalesHistoryItem[];
}

interface SalesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RANGES = [1, 7, 30, 0] as const;

export function SalesHistoryModal({ isOpen, onClose }: SalesHistoryModalProps) {
  const { lang, t, formatCurrency } = useLanguage();
  const [range, setRange] = useState<(typeof RANGES)[number]>(7);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // The fetched log is tagged with the range it belongs to, so switching ranges
  // shows a loading state without setting state synchronously inside the effect.
  const [log, setLog] = useState<{
    key: string;
    orders: SalesHistoryOrder[];
    totals: { total: number; cash: number; due: number };
    error: string | null;
  } | null>(null);

  const key = `${range}-${lang}`;

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    getSalesHistoryAction(range)
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          setLog({ key, orders: res.orders as SalesHistoryOrder[], totals: res.totals, error: null });
        } else {
          setLog({
            key,
            orders: [],
            totals: { total: 0, cash: 0, due: 0 },
            error: res.error || (lang === "bn" ? "তালিকা লোড করা যায়নি" : "Could not load the log"),
          });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setLog({
          key,
          orders: [],
          totals: { total: 0, cash: 0, due: 0 },
          error: lang === "bn" ? "তালিকা লোড করা যায়নি" : "Could not load the log",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, range, lang, key]);

  if (!isOpen) return null;

  const bn = lang === "bn";
  const loading = log?.key !== key;
  const orders = log && log.key === key ? log.orders : [];
  const totals = log && log.key === key ? log.totals : { total: 0, cash: 0, due: 0 };
  const error = log && log.key === key ? log.error : null;
  const rangeLabel = (value: (typeof RANGES)[number]) =>
    value === 1
      ? bn ? "আজ" : "Today"
      : value === 7
        ? bn ? "৭ দিন" : "7 days"
        : value === 30
          ? bn ? "৩০ দিন" : "30 days"
          : bn ? "সব" : "All";

  const statusLabel = (status: SalesHistoryOrder["status"]) =>
    status === "PAID" ? (bn ? "পরিশোধিত" : "Paid") : status === "PARTIAL" ? (bn ? "আংশিক" : "Partial") : bn ? "বাকি" : "Due";

  const statusStyles = (status: SalesHistoryOrder["status"]) =>
    status === "PAID"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/25"
      : status === "PARTIAL"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/25"
        : "bg-rose-500/15 text-rose-600 dark:text-rose-300 ring-rose-500/25";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/10 shadow-2xl dark:bg-zinc-900 dark:ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white/70 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950/70">
          <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
            <Receipt className="h-5 w-5" />
            <span>{bn ? "বিক্রির খাতা" : "Sales Log"}</span>
          </div>
          <button
            onClick={onClose}
            aria-label={t("cancel")}
            className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-black/10 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 px-4 py-3">
          {/* Range tabs */}
          <div className="grid grid-cols-4 gap-1.5">
            {RANGES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setRange(value);
                  setExpandedId(null);
                }}
                aria-pressed={range === value}
                className={`rounded-xl border px-2 py-2 text-[11px] font-bold transition-colors ${
                  range === value
                    ? "border-amber-500 bg-amber-500 text-zinc-950"
                    : "border-zinc-300 bg-zinc-100 text-zinc-700 hover:border-amber-500/60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {rangeLabel(value)}
              </button>
            ))}
          </div>

          {/* Totals for the selected range */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-black/[0.03] px-3 py-2.5 ring-1 ring-black/5 dark:bg-white/[0.03] dark:ring-white/5">
            <div>
              <p className="text-[9px] uppercase tracking-wide text-zinc-500">{bn ? "মোট বিক্রি" : "Sales"}</p>
              <p className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{formatCurrency(totals.total)}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide text-zinc-500">{bn ? "নগদ" : "Cash"}</p>
              <p className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(totals.cash)}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide text-zinc-500">{bn ? "বাকি" : "Due"}</p>
              <p className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totals.due)}</p>
            </div>
          </div>
        </div>

        {/* Order list */}
        <div className="max-h-[52vh] overflow-y-auto border-t border-zinc-200 dark:border-zinc-800">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-xs text-zinc-600 dark:text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{bn ? "লোড হচ্ছে..." : "Loading..."}</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <ShoppingBag className="h-7 w-7 text-zinc-400 dark:text-zinc-600" />
              <p className="text-xs text-zinc-500">
                {bn ? "এই সময়ে কোনো বিক্রি হয়নি।" : "No sales in this period."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {orders.map((order) => {
                const expanded = expandedId === order.id;
                return (
                  <div key={order.id}>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : order.id)}
                      aria-expanded={expanded}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/5 text-zinc-600 ring-1 ring-black/10 dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-zinc-900 dark:text-white">
                          {order.customerName || t("walkInCustomer")}
                        </p>
                        <p className="flex items-center gap-1 text-[10px] text-zinc-500">
                          <Clock3 className="h-2.5 w-2.5" />
                          <span suppressHydrationWarning>
                            {new Date(order.createdAt).toLocaleString(bn ? "bn-BD" : "en-US", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </span>
                          <span aria-hidden>•</span>
                          <span>
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} {bn ? "আইটেম" : "items"}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <span className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ring-1 ${statusStyles(order.status)}`}>
                          {statusLabel(order.status)}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`}
                      />
                    </button>

                    {expanded && (
                      <div className="space-y-1.5 bg-black/[0.02] px-4 pb-3 pt-1 dark:bg-white/[0.02]">
                        {order.items.map((item, index) => (
                          <div key={`${order.id}-${index}`} className="flex items-baseline justify-between gap-2 text-[11px]">
                            <span className="min-w-0 truncate text-zinc-700 dark:text-zinc-300">
                              {item.productName}{" "}
                              <span className="text-zinc-500">
                                × {item.quantity} @ {formatCurrency(item.unitPrice)}
                              </span>
                            </span>
                            <span className="shrink-0 font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                              {formatCurrency(item.subtotal)}
                            </span>
                          </div>
                        ))}

                        <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-dashed border-zinc-300 pt-1.5 text-[11px] dark:border-zinc-700">
                          <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                            <Banknote className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            {bn ? "নগদ জমা" : "Paid"} {formatCurrency(order.paidAmount)}
                          </span>
                          <span className="text-zinc-600 dark:text-zinc-400">
                            {bn ? "বাকি" : "Due"}{" "}
                            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                              {formatCurrency(order.dueAmount)}
                            </span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
