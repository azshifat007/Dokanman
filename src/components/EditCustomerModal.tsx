"use client";

import { useState } from "react";
import { UserPen, X, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { updateCustomerAction, deleteCustomerAction } from "@/actions/pos-actions";
import { Customer } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

interface EditCustomerModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

export function EditCustomerModal({
  customer,
  isOpen,
  onClose,
  onSaved,
  onDeleted,
}: EditCustomerModalProps) {
  const { lang, t, formatCurrency } = useLanguage();
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(isOpen);

  // Re-seed the fields whenever the modal opens for a (possibly different) customer.
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setName(customer?.name ?? "");
      setPhone(customer?.phone ?? "");
      setError(null);
    }
  }

  if (!isOpen || !customer) return null;

  const bn = lang === "bn";
  const due = parseFloat(customer.totalDue || "0");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(bn ? "কাস্টমারের নাম লিখুন" : "Please enter the customer name");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await updateCustomerAction({
        id: customer.id,
        name: name.trim(),
        phone: phone.trim() || undefined,
      });
      if (res.success) {
        onSaved();
        onClose();
      } else {
        setError(res.error || (bn ? "সেভ করা যায়নি" : "Could not save changes"));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const warning =
      due > 0
        ? bn
          ? `"${customer.name}" কে মুছে ফেলবেন? খাতায় তার ৳${due.toFixed(0)} বাকি ও সব লেনদেনের ইতিহাস মুছে যাবে (বিক্রির রেকর্ড থাকবে)।`
          : `Delete "${customer.name}"? Their Tk ${due.toFixed(0)} due and full transaction history will be removed (past sales records stay).`
        : bn
          ? `"${customer.name}" কে মুছে ফেলবেন? তার লেনদেনের ইতিহাস মুছে যাবে।`
          : `Delete "${customer.name}"? Their transaction history will be removed.`;

    if (!confirm(warning)) return;

    try {
      setDeleting(true);
      setError(null);
      const res = await deleteCustomerAction(customer.id);
      if (res.success) {
        onDeleted();
        onClose();
      } else {
        setError(res.error || (bn ? "মুছে ফেলা যায়নি" : "Could not delete"));
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-black/10 dark:ring-white/10 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-5 py-4 bg-white/70 dark:bg-zinc-950/70">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
            <UserPen className="w-5 h-5" />
            <span>{t("editCustomerTitle")}</span>
          </div>
          <button
            onClick={onClose}
            aria-label={t("cancel")}
            className="rounded-lg p-1.5 text-zinc-600 dark:text-zinc-400 transition-colors hover:bg-black/10 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="p-3 rounded-xl text-xs font-semibold flex items-center gap-2 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-700/60 text-rose-600 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              {t("customerName")}
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              {t("customerPhone")}
            </label>
            <input
              type="tel"
              placeholder="017XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 text-sm font-mono"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              {bn
                ? "নম্বর খালি রাখলে কাস্টমারের কোনো মোবাইল নম্বর থাকবে না।"
                : "Leave blank to remove the customer's phone number."}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-xs">
            <span className="text-zinc-600 dark:text-zinc-400">{t("currentDueLabel")}</span>
            <span
              className={`font-mono font-bold ${
                due > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {formatCurrency(due)}
            </span>
          </div>

          <p className="text-[11px] text-zinc-500">
            {bn
              ? "বাকির পরিমাণ সরাসরি এখানে বদলানো যায় না — টাকা জমা নিলে বা নতুন বাকি বিক্রি করলে নিজে থেকেই হিসাব আপডেট হবে।"
              : "The due amount is not edited here — collecting a payment or a new credit sale updates it automatically."}
          </p>

          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 border-t border-zinc-200 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || loading}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span>{t("deleteCustomerBtn")}</span>
            </button>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || deleting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={loading || deleting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{t("saveProfile")}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
