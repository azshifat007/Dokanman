"use client";

import { useState } from "react";
import { Customer, Transaction } from "@/types";
import {
  Search,
  MessageCircle,
  Phone,
  HandCoins,
  ShoppingBag,
  UserPlus,
  AlertCircle,
  History,
  X,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
} from "lucide-react";
import { SettleDueModal } from "./SettleDueModal";
import { NewCustomerModal } from "./NewCustomerModal";
import { getCustomerLedgerAction } from "@/actions/pos-actions";
import { useLanguage } from "@/context/LanguageContext";

interface CustomerLedgerProps {
  customers: Customer[];
  shopName: string;
  onOpenCartForCustomer: (customer: Customer) => void;
  onRefresh: () => void;
}

export function CustomerLedger({
  customers,
  shopName,
  onOpenCartForCustomer,
  onRefresh,
}: CustomerLedgerProps) {
  const { lang, t, formatCurrency } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDueOnly, setFilterDueOnly] = useState(false);
  const [settleCustomer, setSettleCustomer] = useState<Customer | null>(null);
  const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  const [historyRows, setHistoryRows] = useState<Transaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm));
    const due = parseFloat(c.totalDue || "0");
    if (filterDueOnly) {
      return matchesSearch && due > 0;
    }
    return matchesSearch;
  });

  const openHistory = async (customer: Customer) => {
    setHistoryCustomer(customer);
    setHistoryLoading(true);
    setHistoryRows([]);
    const res = await getCustomerLedgerAction(customer.id);
    if (res.success) {
      setHistoryRows((res.transactions || []) as unknown as Transaction[]);
    }
    setHistoryLoading(false);
  };

  const generateWhatsAppLink = (customer: Customer) => {
    if (!customer.phone) return null;
    let cleanPhone = customer.phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("01")) {
      cleanPhone = `88${cleanPhone}`;
    }
    const due = parseFloat(customer.totalDue || "0").toFixed(0);
    const message = encodeURIComponent(
      lang === "bn"
        ? `আসসালামু আলাইকুম ${customer.name} ভাই, ${shopName} এ আপনার পূর্বের বাকি হিসাব ৳${due} টাকা। সময়মতো পরিশোধের অনুরোধ রইল। ধন্যবাদ!`
        : `Hello ${customer.name}, your outstanding due at ${shopName} is Tk ${due}. Kindly settle it when convenient. Thank you!`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const generateSmsLink = (customer: Customer) => {
    if (!customer.phone) return null;
    const due = parseFloat(customer.totalDue || "0").toFixed(0);
    const message = encodeURIComponent(
      lang === "bn"
        ? `${shopName}: ${customer.name} ভাই, আপনার বর্তমান বকেয়া বাকি ৳${due} টাকা।`
        : `${shopName}: ${customer.name}, your current due is Tk ${due}.`
    );
    return `sms:${customer.phone}?body=${message}`;
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="space-y-3 rounded-2xl bg-zinc-900/60 p-4 shadow-xl shadow-black/20 ring-1 ring-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>{t("ledgerTitle")}</span>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-semibold text-zinc-300 ring-1 ring-white/10">
                {filtered.length}{" "}
                {lang === "bn" ? "জন কাস্টমার" : filtered.length === 1 ? "customer" : "customers"}
              </span>
            </h2>
            <p className="text-xs text-zinc-400">{t("ledgerSubtitle")}</p>
          </div>

          <button
            type="button"
            onClick={() => setIsNewCustModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t("addCustomer")}</span>
          </button>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("searchLedgerPlaceholder")}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 transition-colors focus:border-amber-500 focus:outline-hidden sm:text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => setFilterDueOnly(!filterDueOnly)}
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all ${
              filterDueOnly
                ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
                : "border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{t("filterDueOnly")}</span>
          </button>
        </div>
      </div>

      {/* Customer List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl bg-zinc-900/50 py-16 text-center ring-1 ring-white/5">
            <p className="text-zinc-400 text-sm font-semibold">{t("noCustomersFound")}</p>
            <p className="text-zinc-600 text-xs mt-1">
              {lang === "bn"
                ? "নতুন কাস্টমার তৈরি করতে উপরের বাটনে চাপ দিন।"
                : "Use the button above to add a new customer."}
            </p>
          </div>
        ) : (
          filtered.map((customer) => {
            const due = parseFloat(customer.totalDue || "0");
            const waLink = generateWhatsAppLink(customer);
            const smsLink = generateSmsLink(customer);

            return (
              <div
                key={customer.id}
                className="flex flex-col justify-between space-y-3 rounded-2xl bg-zinc-900/60 p-4 shadow-lg shadow-black/10 ring-1 ring-white/5 transition-all hover:ring-white/10"
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">{customer.name}</h3>
                    {customer.phone ? (
                      <a
                        href={`tel:${customer.phone}`}
                        className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1 mt-0.5 font-mono"
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{customer.phone}</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-zinc-500">
                        {lang === "bn" ? "মোবাইল নম্বর দেওয়া নেই" : "No phone number"}
                      </span>
                    )}
                  </div>

                  {/* Due amount badge */}
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">
                      {lang === "bn" ? "মোট বকেয়া" : "Total Due"}
                    </span>
                    <span
                      className={`font-black font-mono text-lg sm:text-xl ${
                        due > 0 ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {formatCurrency(due)}
                    </span>
                  </div>
                </div>

                {/* Quick Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 border-t border-white/5 pt-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSettleCustomer(customer)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500/20"
                    >
                      <HandCoins className="w-3.5 h-3.5" />
                      <span>{t("settleDueBtn")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenCartForCustomer(customer)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 transition-all hover:bg-amber-500/20"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{t("takeOrderBtn")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openHistory(customer)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-zinc-300 transition-all hover:bg-white/[0.08]"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>{t("historyBtn")}</span>
                    </button>
                  </div>

                  {/* Reminder Buttons */}
                  <div className="flex items-center gap-1">
                    {waLink && due > 0 && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 text-xs flex items-center gap-1 transition-all"
                        title={t("whatsappReminder")}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold">{t("whatsappReminder")}</span>
                      </a>
                    )}

                    {smsLink && due > 0 && (
                      <a
                        href={smsLink}
                        className="p-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 text-xs flex items-center gap-1 transition-all"
                        title={t("smsReminder")}
                      >
                        <span className="text-[11px] font-semibold">{t("smsReminder")}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Settle modal */}
      <SettleDueModal
        customer={settleCustomer}
        isOpen={!!settleCustomer}
        onClose={() => setSettleCustomer(null)}
        onSuccess={() => {
          onRefresh();
        }}
      />

      {/* New customer modal */}
      <NewCustomerModal
        isOpen={isNewCustModalOpen}
        onClose={() => setIsNewCustModalOpen(false)}
        onCustomerCreated={(c) => {
          onRefresh();
          onOpenCartForCustomer(c);
        }}
      />

      {/* Transaction history modal */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 ring-1 ring-white/10 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 bg-zinc-950/70">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <History className="w-5 h-5" />
                <span>{t("customerHistoryTitle")}</span>
              </div>
              <button
                onClick={() => setHistoryCustomer(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-3 bg-zinc-800/40 border-b border-zinc-800 flex items-center justify-between text-xs">
              <span className="font-bold text-white text-sm">{historyCustomer.name}</span>
              <span className="text-zinc-400">
                {lang === "bn" ? "বর্তমান বাকি:" : "Current due:"}{" "}
                <span className="font-mono font-bold text-rose-400">
                  {formatCurrency(historyCustomer.totalDue)}
                </span>
              </span>
            </div>

            <div className="p-4 max-h-[420px] overflow-y-auto">
              {historyLoading ? (
                <div className="py-12 flex items-center justify-center text-zinc-400 text-xs gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</span>
                </div>
              ) : historyRows.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
                  <Receipt className="w-8 h-8 text-zinc-700" />
                  <span>{t("noHistoryYet")}</span>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/80">
                  {historyRows.map((tx) => {
                    const isPayment = tx.type === "PAYMENT";
                    return (
                      <div key={tx.id} className="py-2.5 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 min-w-0">
                          <div
                            className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center border ${
                              isPayment
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                            }`}
                          >
                            {isPayment ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white">
                              {isPayment ? t("paymentTypeLabel") : t("purchaseType")}
                            </div>
                            {tx.note && (
                              <div className="text-[11px] text-zinc-400 truncate max-w-[240px]">
                                {tx.note}
                              </div>
                            )}
                            <div className="text-[10px] text-zinc-500 font-mono">
                              {new Date(tx.createdAt).toLocaleString(
                                lang === "bn" ? "bn-BD" : "en-US",
                                { dateStyle: "medium", timeStyle: "short" }
                              )}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`font-mono font-bold text-sm ${
                            isPayment ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isPayment ? "-" : "+"} {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
