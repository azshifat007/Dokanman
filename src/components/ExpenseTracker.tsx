"use client";

import { useState } from "react";
import { Expense } from "@/types";
import { addExpenseAction, deleteExpenseAction } from "@/actions/expense-actions";
import { useLanguage } from "@/context/LanguageContext";
import {
  Receipt,
  Plus,
  Trash2,
  Loader2,
  Flame,
  Coffee,
  Candy,
  Cigarette,
  ShoppingBag,
  Coins
} from "lucide-react";

interface ExpenseTrackerProps {
  initialExpenses: Expense[];
  onRefresh: () => void;
}

const PRESET_CATEGORIES = [
  { id: "milk", labelBn: "দুধ (Milk)", labelEn: "Milk", icon: Coffee },
  { id: "tea", labelBn: "চা পাতা (Tea Leaves)", labelEn: "Tea Leaves", icon: Flame },
  { id: "sugar", labelBn: "চিনি (Sugar)", labelEn: "Sugar", icon: Candy },
  { id: "gas", labelBn: "গ্যাস সিলিন্ডার (Gas)", labelEn: "LPG Gas", icon: Flame },
  { id: "cigarettes", labelBn: "সিগারেট পাইকারি (Cigarettes)", labelEn: "Cigarettes Wholesale", icon: Cigarette },
  { id: "bakery", labelBn: "বেকারি ও টোস্ট (Bakery)", labelEn: "Bakery / Toast", icon: ShoppingBag },
  { id: "misc", labelBn: "অন্যান্য খরচ (Misc)", labelEn: "Miscellaneous", icon: Coins },
];

export function ExpenseTracker({ initialExpenses, onRefresh }: ExpenseTrackerProps) {
  const { lang, t, formatCurrency } = useLanguage();
  const [expensesList, setExpensesList] = useState<Expense[]>(initialExpenses);
  const [prevInitial, setPrevInitial] = useState(initialExpenses);

  // Server refresh brings a new list; adopt it during render (no effect needed).
  if (prevInitial !== initialExpenses) {
    setPrevInitial(initialExpenses);
    setExpensesList(initialExpenses);
  }
  const [category, setCategory] = useState("দুধ (Milk)");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaysExpenses = expensesList.filter((e) => new Date(e.createdAt) >= todayStart);
  const totalExpense = todaysExpenses.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError(lang === "bn" ? "সঠিক টাকার পরিমাণ লিখুন" : "Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await addExpenseAction({
        category,
        amount: amountNum,
        note: note.trim() || undefined,
      });

      if (res.success && res.expense) {
        setExpensesList([res.expense as unknown as Expense, ...expensesList]);
        setAmount("");
        setNote("");
        onRefresh();
      } else {
        setError(res.error || "খরচ সেভ করা যায়নি");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ত্রুটি হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteExpenseConfirm"))) return;
    try {
      setDeletingId(id);
      const res = await deleteExpenseAction(id);
      if (res.success) {
        setExpensesList((prev) => prev.filter((e) => e.id !== id));
        onRefresh();
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <span>{t("expenseTitle")}</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">{t("expenseSubtitle")}</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 self-start sm:self-auto">
          <span className="text-xs text-zinc-400">{t("expensesTodayOnly")}:</span>
          <span className="text-lg font-black font-mono text-rose-400">
            {formatCurrency(totalExpense)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Add Expense Form */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>{t("addExpenseBtn")}</span>
            </h3>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-2xl text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleAddExpense} className="space-y-4">
            {/* 1-tap Preset Category Buttons */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                {t("expenseCategory")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === (lang === "bn" ? cat.labelBn : cat.labelEn);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(lang === "bn" ? cat.labelBn : cat.labelEn)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        isSelected
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs"
                          : "bg-zinc-800/80 text-zinc-300 border-zinc-700/60 hover:bg-zinc-800"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{lang === "bn" ? cat.labelBn : cat.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {t("expenseAmount")} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-zinc-400 font-mono font-bold">৳</span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-mono font-bold text-base focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {t("expenseNote")}
              </label>
              <input
                type="text"
                placeholder={lang === "bn" ? "উদা: ৫ লিটার তরল দুধ" : "e.g. 5 Liters Liquid Milk"}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === "bn" ? "সেভ হচ্ছে..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{t("saveExpense")}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Expense List */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">
              {lang === "bn" ? "খরচের তালিকা" : "Expense Records"}
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              {expensesList.length} {lang === "bn" ? "টি এন্ট্রি" : "entries"}
            </span>
          </div>

          <div className="divide-y divide-zinc-800/80 max-h-[500px] overflow-y-auto">
            {expensesList.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                {t("noExpensesYet")}
              </div>
            ) : (
              expensesList.map((exp) => (
                <div
                  key={exp.id}
                  className="py-3 flex items-center justify-between gap-3 group"
                >
                  <div>
                    <div className="font-bold text-white text-sm">{exp.category}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {exp.note && <span className="mr-2 text-zinc-300">{exp.note}</span>}
                      <span className="text-[11px] text-zinc-500">
                        {new Date(exp.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black font-mono text-rose-400 text-base">
                      {formatCurrency(exp.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(exp.id)}
                      disabled={deletingId === exp.id}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
