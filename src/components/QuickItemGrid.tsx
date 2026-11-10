"use client";

import { useCartStore } from "@/store/useCartStore";
import { Product } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { Coffee, Plus, Flame, Utensils, Droplets, Cigarette, Cookie } from "lucide-react";

interface QuickItemGridProps {
  products: Product[];
}

function getItemIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("tea") || lower.includes("চা")) {
    return <Coffee className="w-5 h-5 text-amber-700 dark:text-amber-400" />;
  }
  if (lower.includes("coffee") || lower.includes("কফি")) {
    return <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
  }
  if (lower.includes("cigarette") || lower.includes("গোল্ডলিফ") || lower.includes("বেনসন") || lower.includes("ডার্বি")) {
    return <Cigarette className="w-5 h-5 text-red-400" />;
  }
  if (lower.includes("toast") || lower.includes("টোস্ট") || lower.includes("বিস্কুট") || lower.includes("কেক")) {
    return <Cookie className="w-5 h-5 text-yellow-400" />;
  }
  if (lower.includes("water") || lower.includes("পানি")) {
    return <Droplets className="w-5 h-5 text-cyan-700 dark:text-cyan-400" />;
  }
  return <Utensils className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />;
}

export function QuickItemGrid({ products }: QuickItemGridProps) {
  const { addItem, items } = useCartStore();
  const { t, formatCurrency } = useLanguage();
  const quickProducts = products.filter((p) => p.isQuickAccess === "true");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span>{t("quickMenuTitle")}</span>
        </h2>
        <span className="text-xs text-zinc-500">{t("tapToAddHint")}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {quickProducts.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            {t("noProductsYet")}
          </div>
        )}
        {quickProducts.map((product) => {
          const cartItem = items.find((i) => i.productId === product.id);
          const currentQty = cartItem?.quantity || 0;
          const price = parseFloat(product.price);

          return (
            <button
              key={product.id}
              type="button"
              onClick={() => addItem(product)}
              className={`relative flex min-h-[88px] select-none flex-col justify-between rounded-2xl p-3 text-left ring-1 transition-all duration-150 active:scale-[0.97] ${
                currentQty > 0
                  ? "bg-amber-500/10 ring-amber-500/50 shadow-lg shadow-amber-950/20"
                  : "bg-black/[0.03] dark:bg-white/[0.03] ring-black/5 dark:ring-white/5 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:ring-black/10 dark:hover:ring-white/10"
              }`}
            >
              {/* Top row with icon & cart badge */}
              <div className="flex items-start justify-between w-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10">
                  {getItemIcon(product.name)}
                </div>

                {currentQty > 0 ? (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 font-mono text-[11px] font-black text-zinc-950 shadow-sm">
                    ×{currentQty}
                  </span>
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 ring-1 ring-black/5 dark:ring-white/5">
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>

              {/* Bottom row with name and price */}
              <div className="mt-2 w-full">
                <div className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm line-clamp-1">
                  {product.name}
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="font-mono text-sm font-extrabold text-amber-700 dark:text-amber-300 sm:text-base">
                    {formatCurrency(price)}
                  </span>
                  {currentQty > 0 && (
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono">
                      = {formatCurrency(price * currentQty)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
