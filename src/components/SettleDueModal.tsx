"use client";

import { useState } from "react";
import { X, HandCoins, Loader2, CheckCircle2 } from "lucide-react";
import { settleCustomerDueAction } from "@/actions/pos-actions";
import { Customer } from "@/types";

interface SettleDueModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SettleDueModal({ customer, isOpen, onClose, onSuccess }: SettleDueModalProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !customer) return null;

  const currentDue = parseFloat(customer.totalDue || "0");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const paidNum = parseFloat(amount);
    if (isNaN(paidNum) || paidNum <= 0) {
      setError("পরিশোধের টাকার পরিমাণ সঠিক নয়");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await settleCustomerDueAction({
        customerId: customer.id,
        amountPaid: paidNum,
        note: note.trim() || undefined,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || "বাকি পরিশোধ এন্ট্রি করতে ব্যর্থ হয়েছে");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 bg-zinc-950/60">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
            <HandCoins className="w-5 h-5" />
            <span>বকেয়া বাকি জমা নিন</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer info strip */}
        <div className="px-5 py-3 bg-zinc-800/40 border-b border-zinc-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-zinc-400">কাস্টমার: </span>
            <span className="font-bold text-white">{customer.name}</span>
          </div>
          <div>
            <span className="text-zinc-400">বর্তমান বকেয়া: </span>
            <span className="font-extrabold text-rose-400 font-mono text-sm">
              ৳{currentDue.toFixed(0)}
            </span>
          </div>
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
              জমা গ্রহণের পরিমাণ (টাকা ৳) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-zinc-400 font-mono font-bold">৳</span>
              <input
                type="number"
                step="any"
                min="1"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-20 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-mono font-bold text-base focus:outline-hidden focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setAmount(currentDue.toString())}
                className="absolute right-2 top-2 px-2.5 py-1 rounded-lg bg-zinc-700 text-zinc-200 text-xs font-semibold hover:bg-zinc-600"
              >
                পুরো বাকি
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              পেমেন্ট মাধ্যম / নোট (ঐচ্ছিক)
            </label>
            <input
              type="text"
              placeholder="উদা: নগদ ক্যাশ দিল / বিকাশ পার্সোনাল"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-xs focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>জমা নিশ্চিত করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
