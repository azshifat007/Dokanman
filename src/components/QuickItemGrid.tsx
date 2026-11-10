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
    return <Coffee className="w-5 h-5 text-amber-400" />;
  }
  if (lower.includes("coffee") || lower.includes("কফি")) {
    return <Flame className="w-5 h-5 text-orange-400" />;
  }
  if (lower.includes("cigarette") || lower.includes("গোল্ডলিফ") || lower.includes("বেনসন") || lower.includes("ডার্বি")) {
    return <Cigarette className="w-5 h-5 text-red-400" />;
  }
  if (lower.includes("toast") || lower.includes("টোস্ট") || lower.includes("বিস্কুট") || lower.includes("কেক")) {
    return <Cookie className="w-5 h-5 text-yellow-400" />;
  }
  if (lower.includes("water") || lower.includes("পানি")) {
    return <Droplets className="w-5 h-5 text-cyan-400" />;
  }
  return <Utensils className="w-5 h-5 text-emerald-400" />;
}

export function QuickItemGrid({ products }: QuickItemGridProps) {
  const { addItem, items } = useCartStore();
  const { t, formatCurrency } = useLanguage();
  const quickProducts = products.filter((p) => p.isQuickAccess === "true");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>{t("quickMenuTitle")}</span>
        </h2>
        <span className="text-xs text-zinc-500">{t("tapToAddHint")}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {quickProducts.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
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
              className={`relative flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-95 select-none min-h-[92px] ${
                currentQty > 0
                  ? "bg-amber-500/15 border-amber-500/60 shadow-md ring-1 ring-amber-500/30"
                  : "bg-zinc-900 hover:bg-zinc-800/90 border-zinc-800 hover:border-zinc-700 shadow-xs"
              }`}
            >
              {/* Top row with icon & cart badge */}
              <div className="flex items-start justify-between w-full">
                <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700/60 shadow-xs">
                  {getItemIcon(product.name)}
                </div>

                {currentQty > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-zinc-950 font-mono shadow-xs animate-in zoom-in-50">
                    x{currentQty}
                  </span>
                ) : (
                  <span className="w-6 h-6 rounded-lg bg-zinc-800/80 text-zinc-500 hover:text-white flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* Bottom row with name and price */}
              <div className="mt-2 w-full">
                <div className="font-bold text-white text-xs sm:text-sm line-clamp-1">
                  {product.name}
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="font-extrabold text-amber-400 text-sm sm:text-base font-mono">
                    {formatCurrency(price)}
                  </span>
                  {currentQty > 0 && (
                    <span className="text-[11px] text-zinc-400 font-mono">
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
