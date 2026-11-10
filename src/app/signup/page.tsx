"use client";

import { useState } from "react";
import { signupAction } from "@/actions/auth-actions";
import { Coffee, Lock, Phone, Store, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !phone.trim() || !pin.trim()) {
      setError("সকল তথ্য সঠিকভাবে পূরণ করুন");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await signupAction({
        shopName: shopName.trim(),
        phone: phone.trim(),
        pin: pin.trim(),
      });

      if (res.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(res.error || "সাইনআপ ব্যর্থ হয়েছে");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10 mb-2">
            <Coffee className="w-9 h-9 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            দোকানম্যান (Dokanman)
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            আপনার টং বা মুদি দোকানের জন্য ১ মিনিটে ফ্রি অ্যাকাউন্ট খুলুন
          </p>
        </div>

        {/* Signup Form Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="border-b border-zinc-800/80 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-400" />
              <span>নতুন দোকানদার রেজিস্টার</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              রেজিস্টার করলেই টং এর প্রয়োজনীয় মেন্যু অটোমেটিক সাজিয়ে দেওয়া হবে
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-950/50 border border-rose-800/60 text-rose-300 rounded-2xl text-xs font-semibold animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                দোকানের নাম <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Store className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="যেমন: আলমগীর টি স্টল ও স্ন্যাক্স"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-800/90 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                মোবাইল নম্বর <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                <input
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-800/90 border border-zinc-700 text-white font-mono text-sm placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                ৪ বা ৬ ডিজিটের পিন কোড <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  maxLength={6}
                  placeholder="যেমন: ১২৩৪"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-800/90 border border-zinc-700 text-white font-mono text-lg tracking-widest placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                পরবর্তীতে এই পিন দিয়ে লগইন করতে পারবেন।
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl font-black text-sm bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 select-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>দোকানের খাতা খুলুন</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link to Login */}
        <div className="text-center text-xs text-zinc-400">
          <span>ইতিমধ্যে অ্যাকাউন্ট আছে? </span>
          <Link
            href="/login"
            className="text-amber-400 font-bold hover:underline ml-1"
          >
            এখানে লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
