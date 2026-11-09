"use client";

import { useState } from "react";
import { Customer } from "@/types";
import {
  Search,
  MessageCircle,
  Phone,
  HandCoins,
  ShoppingBag,
  ExternalLink,
  UserPlus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  AlertCircle
} from "lucide-react";
import { SettleDueModal } from "./SettleDueModal";
import { NewCustomerModal } from "./NewCustomerModal";
import { useCartStore } from "@/store/useCartStore";

interface CustomerLedgerProps {
  customers: Customer[];
  onOpenCartForCustomer: (customer: Customer) => void;
  onRefresh: () => void;
}

export function CustomerLedger({ customers, onOpenCartForCustomer, onRefresh }: CustomerLedgerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDueOnly, setFilterDueOnly] = useState(false);
  const [settleCustomer, setSettleCustomer] = useState<Customer | null>(null);
  const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);

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

  const generateWhatsAppLink = (customer: Customer) => {
    if (!customer.phone) return null;
    let cleanPhone = customer.phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("01")) {
      cleanPhone = `88${cleanPhone}`;
    }
    const due = parseFloat(customer.totalDue || "0").toFixed(0);
    const message = encodeURIComponent(
      `আসসালামু আলাইকুম ${customer.name} ভাই, মামা টং দোকানে আপনার পূর্বের বাকি হিসাব ৳${due} টাকা। সময়মতো পরিশোধের অনুরোধ রইল। ধন্যবাদ!`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const generateSmsLink = (customer: Customer) => {
    if (!customer.phone) return null;
    const due = parseFloat(customer.totalDue || "0").toFixed(0);
    const message = encodeURIComponent(
      `মামা টং দোকান: ${customer.name} ভাই, আপনার বর্তমান বকেয়া বাকি ৳${due} টাকা।`
    );
    return `sms:${customer.phone}?body=${message}`;
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>ডিজিটাল বাকির খাতা</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300">
                {filtered.length} জন কাস্টমার
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              সকল কাস্টমারের বাকি, পেমেন্ট হিসাব ও দ্রুত হোয়াটসঅ্যাপ তাগাদা
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsNewCustModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>নতুন কাস্টমার যোগ করুন</span>
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
              placeholder="খাতায় নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-2xl text-white text-xs sm:text-sm placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setFilterDueOnly(!filterDueOnly)}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
              filterDueOnly
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-xs"
                : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>শুধুমাত্র যাদের বাকি আছে</span>
          </button>
        </div>
      </div>

      {/* Customer List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-zinc-900 border border-zinc-800 rounded-3xl">
            <p className="text-zinc-400 text-sm font-semibold">কোনো কাস্টমার পাওয়া যায়নি</p>
            <p className="text-zinc-600 text-xs mt-1">
              নতুন কাস্টমার তৈরি করতে উপরের বাটনে চাপ দিন।
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
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-4 shadow-lg transition-all space-y-3 flex flex-col justify-between"
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
                      <span className="text-[11px] text-zinc-500">মোবাইল নম্বর দেওয়া নেই</span>
                    )}
                  </div>

                  {/* Due amount badge */}
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">
                      মোট বকেয়া
                    </span>
                    <span
                      className={`font-black font-mono text-lg sm:text-xl ${
                        due > 0 ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      ৳{due.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Quick Actions Row */}
                <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {/* Settle Due Button */}
                    <button
                      type="button"
                      onClick={() => setSettleCustomer(customer)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
                    >
                      <HandCoins className="w-3.5 h-3.5" />
                      <span>টাকা জমা</span>
                    </button>

                    {/* POS Order Cart Button */}
                    <button
                      type="button"
                      onClick={() => onOpenCartForCustomer(customer)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>অর্ডার নিন</span>
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
                        title="হোয়াটসঅ্যাপ তাগাদা পাঠান"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold">হোয়াটসঅ্যাপ</span>
                      </a>
                    )}

                    {smsLink && due > 0 && (
                      <a
                        href={smsLink}
                        className="p-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 text-xs flex items-center gap-1 transition-all"
                        title="এসএমএস পাঠান"
                      >
                        <span className="text-[11px] font-semibold">SMS</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <SettleDueModal
        customer={settleCustomer}
        isOpen={!!settleCustomer}
        onClose={() => setSettleCustomer(null)}
        onSuccess={() => {
          onRefresh();
        }}
      />

      <NewCustomerModal
        isOpen={isNewCustModalOpen}
        onClose={() => setIsNewCustModalOpen(false)}
        onCustomerCreated={(c) => {
          onRefresh();
          onOpenCartForCustomer(c);
        }}
      />
    </div>
  );
}
