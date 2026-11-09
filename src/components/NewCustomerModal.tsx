"use client";

import { useState } from "react";
import { UserPlus, X, Loader2 } from "lucide-react";
import { createCustomerAction } from "@/actions/pos-actions";
import { Customer } from "@/types";

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: (customer: Customer) => void;
  initialQuery?: string;
}

export function NewCustomerModal({ isOpen, onClose, onCustomerCreated, initialQuery = "" }: NewCustomerModalProps) {
  const [name, setName] = useState(initialQuery);
  const [phone, setPhone] = useState("");
  const [initialDue, setInitialDue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("কাস্টমারের নাম লিখুন");
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
        setError(res.error || "কাস্টমার তৈরিতে ত্রুটি হয়েছে");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "সমস্যা হয়েছে");
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
            <span>নতুন কাস্টমার যোগ করুন</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
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
              কাস্টমারের নাম <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="উদা: শাকিল মেকানিক / করিম ভাই"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              মোবাইল নম্বর (ঐচ্ছিক)
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
              পূর্বে কোনো বাকি থাকলে (টাকা ৳)
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
              খাতার আগের কোনো বকেয়া থাকলে এখানে লিখে দিতে পারেন।
            </p>
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>সেভ ও কার্টে যুক্ত করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
