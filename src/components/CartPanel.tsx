"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { createOrderAction } from "@/actions/pos-actions";
import { useLanguage } from "@/context/LanguageContext";
import {
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  RotateCcw,
  Loader2,
  Wallet,
  Clock,
  Coins
} from "lucide-react";

export function CartPanel() {
  const { lang, t, formatCurrency } = useLanguage();
  const {
    selectedCustomer,
    items,
    paymentMode,
    customPaidAmount,
    orderNote,
    isSubmitting,
    addItem,
    removeItem,
    updateQuantity,
    setPaymentMode,
    setCustomPaidAmount,
    setOrderNote,
    setIsSubmitting,
    clearCart,
    getSubtotal,
    getPreviousDue,
    getPaidAmount,
    getDueAmount,
    getNewTotalBalance,
  } = useCartStore();

  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");
  const [showCustomItemRow, setShowCustomItemRow] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const prevDue = getPreviousDue();
  const paid = getPaidAmount();
  const due = getDueAmount();
  const grandBalance = getNewTotalBalance();

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim() || !customItemPrice) return;
    const priceNum = parseFloat(customItemPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    addItem({
      id: `custom_${Date.now()}`,
      name: customItemName.trim(),
      price: priceNum,
    });
    setCustomItemName("");
    setCustomItemPrice("");
    setShowCustomItemRow(false);
  };

  const handleCompleteOrder = async () => {
    if (items.length === 0) {
      setErrorMessage(lang === "bn" ? "কার্ট খালি! পণ্য সিলেক্ট করুন" : "Cart is empty!");
      return;
    }

    if (due > 0 && !selectedCustomer) {
      setErrorMessage(t("selectCustomerForDueAlert"));
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await createOrderAction({
        customerId: selectedCustomer?.id || null,
        items: items.map((i) => ({
          productId: i.productId.startsWith("custom_") ? null : i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        paidAmount: paid,
        dueAmount: due,
        note: orderNote.trim() || undefined,
      });

      if (res.success) {
        setSuccessMessage(
          lang === "bn"
            ? `অর্ডার সম্পন্ন হয়েছে! ${
                due > 0 ? `(বাকি: ${formatCurrency(due)})` : "(সম্পূর্ণ পরিশোধ)"
              }`
            : `Order completed! ${due > 0 ? `(Due: ${formatCurrency(due)})` : "(Fully Paid)"}`
        );
        clearCart();
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(res.error || (lang === "bn" ? "অর্ডার সম্পন্ন করতে ব্যর্থ হয়েছে" : "Failed to complete order"));
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "সমস্যা হয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl overflow-hidden flex flex-col h-full">
      {/* Panel Top Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{t("activeCart")}</h3>
            <span className="text-[11px] text-zinc-400">
              {items.length > 0
                ? `${items.length} ${lang === "bn" ? "টি আইটেম যুক্ত আছে" : "items in cart"}`
                : lang === "bn" ? "কোনো আইটেম নেই" : "No items added"}
            </span>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            title={t("clearCart")}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("clearCart")}</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="m-3 p-3 bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="m-3 p-3 bg-rose-950/60 border border-rose-700/60 text-rose-300 rounded-2xl text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Customer Status Banner if selected */}
      {selectedCustomer && (
        <div className="px-4 py-2.5 bg-zinc-800/40 border-b border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-zinc-400">{lang === "bn" ? "খাতাদার:" : "Customer:"}</span>
            <span className="font-bold text-amber-400">{selectedCustomer.name}</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-300">
            <span className="text-zinc-400">{lang === "bn" ? "পূর্বের বাকি:" : "Prev Due:"}</span>
            <span className="font-bold text-rose-400 font-mono">
              {formatCurrency(prevDue)}
            </span>
          </div>
        </div>
      )}

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[340px]">
        {items.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center text-zinc-500">
            <Receipt className="w-10 h-10 mb-2 stroke-[1.5] text-zinc-600" />
            <p className="text-sm font-semibold text-zinc-400">{t("emptyCartTitle")}</p>
            <p className="text-xs text-zinc-600 max-w-xs mt-1">{t("emptyCartDesc")}</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between p-2.5 bg-zinc-800/60 border border-zinc-700/50 rounded-2xl text-xs group"
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="font-bold text-white truncate text-xs sm:text-sm">
                  {item.productName}
                </div>
                <div className="text-zinc-400 font-mono text-[11px]">
                  {formatCurrency(item.unitPrice)} × {item.quantity} ={" "}
                  <span className="text-amber-400 font-bold">{formatCurrency(item.subtotal)}</span>
                </div>
              </div>

              {/* Stepper (+ / -) */}
              <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-700">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, -1)}
                  className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-bold text-white font-mono text-sm">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, 1)}
                  className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center active:scale-95 transition-transform font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                className="ml-2 p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}

        {/* Quick Custom Item Row */}
        {showCustomItemRow ? (
          <form onSubmit={handleAddCustomItem} className="p-2.5 bg-zinc-950/80 border border-zinc-700 rounded-2xl space-y-2">
            <div className="text-[11px] font-semibold text-zinc-400">{t("customProductBtn")}</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                autoFocus
                placeholder={t("customProductName")}
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
              />
              <input
                type="number"
                placeholder={t("customProductPrice")}
                value={customItemPrice}
                onChange={(e) => setCustomItemPrice(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setShowCustomItemRow(false)}
                className="px-2.5 py-1 rounded-lg text-[11px] text-zinc-400 hover:bg-zinc-800"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg text-[11px] font-bold bg-amber-500 text-zinc-950 hover:bg-amber-400"
              >
                {t("addCustomItem")}
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustomItemRow(true)}
            className="w-full py-2 border border-dashed border-zinc-800 hover:border-zinc-700 rounded-2xl text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>{t("customProductBtn")}</span>
          </button>
        )}
      </div>

      {/* Bill Calculation & Settlement Section */}
      <div className="border-t border-zinc-800 bg-zinc-950/80 p-4 space-y-3.5">
        {/* Subtotal, Previous Due & Net Calculation */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-zinc-300">
            <span>{t("orderTotal")}</span>
            <span className="font-bold text-white text-sm font-mono">{formatCurrency(subtotal)}</span>
          </div>

          {selectedCustomer && prevDue > 0 && (
            <div className="flex justify-between text-zinc-400">
              <span>{t("prevDue")}</span>
              <span className="font-bold text-rose-400 font-mono">+ {formatCurrency(prevDue)}</span>
            </div>
          )}

          {selectedCustomer && (
            <div className="flex justify-between text-zinc-300 pt-1 border-t border-zinc-800/80">
              <span className="font-semibold">{t("newGrandBalance")}</span>
              <span className="font-black text-amber-400 text-base font-mono">
                {formatCurrency(grandBalance)}
              </span>
            </div>
          )}
        </div>

        {/* Payment Toggles: [নগদ] [বাকি] [আংশিক] */}
        <div>
          <div className="text-[11px] font-semibold text-zinc-400 mb-1.5 flex items-center justify-between">
            <span>{t("paymentType")}</span>
            {paymentMode === "PAID" && (
              <span className="text-emerald-400 font-bold">{t("payCash")}</span>
            )}
            {paymentMode === "DUE" && (
              <span className="text-rose-400 font-bold">{t("payDue")}</span>
            )}
            {paymentMode === "PARTIAL" && (
              <span className="text-amber-400 font-bold">{t("payPartial")}</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {/* Cash Paid Button */}
            <button
              type="button"
              onClick={() => setPaymentMode("PAID")}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl border font-bold text-xs transition-all active:scale-95 ${
                paymentMode === "PAID"
                  ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-lg shadow-emerald-500/20"
                  : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
              }`}
            >
              <Wallet className="w-4 h-4 mb-0.5" />
              <span>{t("payCash")}</span>
            </button>

            {/* Full Due Button */}
            <button
              type="button"
              onClick={() => setPaymentMode("DUE")}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl border font-bold text-xs transition-all active:scale-95 ${
                paymentMode === "DUE"
                  ? "bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20"
                  : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
              }`}
            >
              <Clock className="w-4 h-4 mb-0.5" />
              <span>{t("payDue")}</span>
            </button>

            {/* Partial Paid Button */}
            <button
              type="button"
              onClick={() => {
                setPaymentMode("PARTIAL");
                if (customPaidAmount === 0 && subtotal > 0) {
                  setCustomPaidAmount(Math.floor(subtotal / 2));
                }
              }}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl border font-bold text-xs transition-all active:scale-95 ${
                paymentMode === "PARTIAL"
                  ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-lg shadow-amber-500/20"
                  : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
              }`}
            >
              <Coins className="w-4 h-4 mb-0.5" />
              <span>{t("payPartial")}</span>
            </button>
          </div>
        </div>

        {/* Partial payment input */}
        {paymentMode === "PARTIAL" && (
          <div className="p-3 bg-zinc-900 border border-amber-500/40 rounded-2xl space-y-2 animate-in fade-in-50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-semibold">{t("partialPaidAmount")}</span>
              <span className="text-rose-400 font-mono font-bold">
                {t("partialDueRemains")} {formatCurrency(due)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2 text-zinc-400 font-mono font-bold">৳</span>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={customPaidAmount || ""}
                  onChange={(e) => setCustomPaidAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-mono font-bold text-sm focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setCustomPaidAmount(subtotal)}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold"
              >
                {t("allPaid")}
              </button>
            </div>
          </div>
        )}

        {/* Order note */}
        <div>
          <input
            type="text"
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            placeholder={`${t("orderNoteLabel")} — ${t("orderNotePlaceholder")}`}
            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder-zinc-600 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Big Complete Order Button */}
        <button
          type="button"
          onClick={handleCompleteOrder}
          disabled={isSubmitting || items.length === 0}
          className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98] select-none ${
            items.length === 0
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
              : paymentMode === "PAID"
              ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/25"
              : paymentMode === "DUE"
              ? "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/25"
              : "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/25"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t("savingOrder")}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {paymentMode === "PAID"
                  ? `${t("payCash")} (${formatCurrency(subtotal)})`
                  : paymentMode === "DUE"
                  ? `${t("payDue")} (${formatCurrency(due)})`
                  : `${formatCurrency(paid)} ${t("payCash")} + ${formatCurrency(due)} ${t("payDue")}`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
