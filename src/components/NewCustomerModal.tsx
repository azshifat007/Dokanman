"use client";

import { useState } from "react";
import { UserPlus, X, Loader2 } from "lucide-react";
import { createCustomerAction } from "@/actions/pos-actions";
import { Customer } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: (customer: Customer) => void;
  initialQuery?: string;
}

export function NewCustomerModal({
  isOpen,
  onClose,
  onCustomerCreated,
  initialQuery = "",
}: NewCustomerModalProps) {
  const { lang, t } = useLanguage();
  const [name, setName] = useState(initialQuery);
  const [phone, setPhone] = useState("");
  const [initialDue, setInitialDue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(isOpen);

  // Reset the form each time the modal transitions from closed to open.
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setName(initialQuery);
      setPhone("");
      setInitialDue("");
      setError(null);
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(lang === "bn" ? "কাস্টমারের নাম লিখুন" : "Please enter the customer name");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await createCustomerAction({
        name: name.trim(),
        phone: phone.trim() || undefined,
        initialDue: initialDue ? parseFloat(initialDue) : undefined,
      });

      if (res.success && res.customer) {
        onCustomerCreated(res.customer as unknown as Customer);
        onClose();
      } else {
        setError(
          res.error || (lang === "bn" ? "কাস্টমার তৈরিতে ত্রুটি হয়েছে" : "Failed to create customer")
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 bg-zinc-950/50">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <UserPlus className="w-5 h-5" />
            <span>{t("newCustomerTitle")}</span>
          </div>
          <button
            onClick={onClose}
            aria-label={t("cancel")}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              {t("customerName")} <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder={
                lang === "bn" ? "উদা: শাকিল মেকানিক / করিম ভাই" : "e.g. Shakil the mechanic"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              {t("customerPhone")}
            </label>
            <input
              type="tel"
              placeholder="017XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              {t("customerOpeningDue")}
            </label>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={initialDue}
              onChange={(e) => setInitialDue(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 text-sm font-mono"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              {lang === "bn"
                ? "খাতার আগের কোনো বকেয়া থাকলে এখানে লিখে দিতে পারেন।"
                : "Add any pre-existing due balance for this customer."}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{t("saveAndSelectCustomer")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
