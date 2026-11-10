"use client";

import { useState } from "react";
import { loginAction } from "@/actions/auth-actions";
import { Coffee, Lock, Phone, ArrowRight, Loader2, Store, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !pin.trim()) {
      setError("মোবাইল নম্বর ও পিন কোড দিন");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await loginAction({ phone, pin });
      if (res.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(res.error || "লগইন করতে ব্যর্থ হয়েছে");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setPhone("01700000000");
    setPin("1234");
    try {
      setLoading(true);
      setError(null);
      const res = await loginAction({ phone: "01700000000", pin: "1234" });
      if (res.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(res.error || "ডেমো লগইন ব্যর্থ হয়েছে");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5ef] dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10 mb-2">
            <Coffee className="w-9 h-9 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            দোকানম্যান (Dokanman)
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            টং ও দোকানের ডিজিটাল বাকির খাতা ও সেলস কাউন্টার
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <span>দোকানদার লগইন</span>
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              আপনার দোকানের মোবাইল নম্বর ও পিন দিয়ে প্রবেশ করুন
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-300 rounded-2xl text-xs font-semibold animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                মোবাইল নম্বর <span className="text-rose-600 dark:text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <input
                  type="tel"
                  required
                  autoFocus
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono text-sm placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ৪ ডিজিটের পিন কোড <span className="text-rose-600 dark:text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <input
                  type="password"
                  required
                  maxLength={6}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono text-lg tracking-widest placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl font-black text-sm bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 select-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>লগইন হচ্ছে...</span>
                </>
              ) : (
                <>
                  <span>লগইন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Login Button */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 border border-zinc-300 dark:border-zinc-700 text-xs text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>ডেমো দোকান দেখুন (মামা টং দোকান)</span>
            </button>
          </div>
        </div>

        {/* Footer Link to Signup */}
        <div className="text-center text-xs text-zinc-600 dark:text-zinc-400">
          <span>নতুন দোকান? </span>
          <Link
            href="/signup"
            className="text-amber-700 dark:text-amber-400 font-bold hover:underline ml-1"
          >
            এখানে সাইনআপ করুন (বিনামূল্যে)
          </Link>
        </div>
      </div>
    </div>
  );
}
