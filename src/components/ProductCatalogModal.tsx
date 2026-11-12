"use client";

import { useState } from "react";
import { Product } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import {
  addProductAction,
  updateProductPriceAction,
  updateProductIconAction,
  toggleProductQuickAccessAction,
  deleteProductAction,
  reorderProductsAction,
} from "@/actions/pos-actions";
import { PRODUCT_ICONS, getProductIconOption, guessProductIconId } from "@/lib/product-icons";
import {
  X,
  Package,
  Plus,
  Pencil,
  Check,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Star,
  StarOff,
  Shapes,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface ProductCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRefresh: () => void;
}

/** Shared icon chooser: used for new products and for changing an existing product's icon. */
function IconPicker({
  value,
  onSelect,
  disabled,
}: {
  value: string | null;
  onSelect: (iconId: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {PRODUCT_ICONS.map(({ id, Icon, tone }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            disabled={disabled}
            aria-pressed={active}
            className={`flex h-8 items-center justify-center rounded-lg border transition-all disabled:opacity-50 ${
              active
                ? "border-amber-500 bg-amber-500/15 ring-1 ring-amber-500/50"
                : "border-zinc-200 dark:border-zinc-700/80 bg-zinc-100 dark:bg-zinc-800/70 hover:border-amber-500/50"
            }`}
          >
            <Icon className={`w-4 h-4 ${tone}`} />
          </button>
        );
      })}
    </div>
  );
}

export function ProductCatalogModal({
  isOpen,
  onClose,
  products,
  onRefresh,
}: ProductCatalogModalProps) {
  const { lang, t, formatCurrency } = useLanguage();
  const [list, setList] = useState<Product[]>(products);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newIcon, setNewIcon] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [iconPickerId, setIconPickerId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Adjust local state during render when a server refresh hands us a new product list.
  const [prevProducts, setPrevProducts] = useState(products);
  if (prevProducts !== products) {
    setPrevProducts(products);
    setList(products);
  }

  if (!isOpen) return null;

  const bn = lang === "bn";

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newPrice);
    if (!newName.trim() || isNaN(priceNum) || priceNum <= 0) {
      setMessage({
        type: "error",
        text: bn ? "পণ্যের নাম ও সঠিক মূল্য দিন" : "Enter a product name and a valid price",
      });
      return;
    }

    try {
      setAdding(true);
      setMessage(null);
      const res = await addProductAction({
        name: newName.trim(),
        price: priceNum,
        icon: newIcon,
      });
      if (res.success && res.product) {
        // The server gives new products the last menu position, so they are appended
        // rather than dropped into the middle of the vendor's arrangement.
        setList((prev) => [...prev, res.product as unknown as Product]);
        setNewName("");
        setNewPrice("");
        setNewIcon(null);
        setMessage({
          type: "success",
          text: bn ? "নতুন পণ্য যুক্ত হয়েছে!" : "New product added!",
        });
        onRefresh();
      } else {
        setMessage({ type: "error", text: res.error || (bn ? "পণ্য যুক্ত করতে ব্যর্থ" : "Failed to add product") });
      }
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setAdding(false);
    }
  };

  const startEditing = (product: Product) => {
    setIconPickerId(null);
    setEditingId(product.id);
    setEditPrice(parseFloat(product.price).toFixed(0));
  };

  const handleSavePrice = async (product: Product) => {
    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setMessage({
        type: "error",
        text: bn ? "সঠিক মূল্য লিখুন" : "Enter a valid price",
      });
      return;
    }

    try {
      setBusyId(product.id);
      setMessage(null);
      const res = await updateProductPriceAction(product.id, priceNum);
      if (res.success) {
        setList((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, price: priceNum.toFixed(2) } : p))
        );
        setEditingId(null);
        setMessage({
          type: "success",
          text: bn ? `${product.name} এর নতুন দাম সেভ হয়েছে` : `Price updated for ${product.name}`,
        });
        onRefresh();
      } else {
        setMessage({ type: "error", text: res.error || "Error" });
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveIcon = async (product: Product, iconId: string) => {
    try {
      setBusyId(product.id);
      setMessage(null);
      const res = await updateProductIconAction(product.id, iconId);
      if (res.success) {
        setList((prev) => prev.map((p) => (p.id === product.id ? { ...p, icon: iconId } : p)));
        setIconPickerId(null);
        setMessage({
          type: "success",
          text: bn ? `${product.name} এর আইকন বদলানো হয়েছে` : `Icon updated for ${product.name}`,
        });
        onRefresh();
      } else {
        setMessage({ type: "error", text: res.error || "Error" });
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleQuick = async (product: Product) => {
    const nextQuick = product.isQuickAccess !== "true";
    try {
      setBusyId(product.id);
      setMessage(null);
      const res = await toggleProductQuickAccessAction(product.id, nextQuick);
      if (res.success) {
        setList((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, isQuickAccess: nextQuick ? "true" : "false" } : p
          )
        );
        setMessage({
          type: "success",
          text: nextQuick
            ? bn
              ? `${product.name} কুইক মেন্যুতে যুক্ত হয়েছে`
              : `${product.name} added to quick menu`
            : bn
            ? `${product.name} কুইক মেন্যু থেকে সরানো হয়েছে`
            : `${product.name} removed from quick menu`,
        });
        onRefresh();
      } else {
        setMessage({ type: "error", text: res.error || "Error" });
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const previous = list;
    const next = [...list];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

    // Move immediately so the tap feels instant, then persist the whole order.
    setList(next);
    setBusyId(next[targetIndex].id);
    setMessage(null);

    try {
      const res = await reorderProductsAction(next.map((p) => p.id));
      if (res.success) {
        setMessage({
          type: "success",
          text: bn ? "মেন্যুর নতুন ক্রম সেভ হয়েছে" : "Menu order saved",
        });
        onRefresh();
      } else {
        setList(previous);
        setMessage({ type: "error", text: res.error || "Error" });
      }
    } catch (err: unknown) {
      setList(previous);
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = confirm(
      bn
        ? `"${product.name}" পণ্যটি মুছে ফেলতে চান? পুরোনো বিক্রির রেকর্ড ও হিসাব ঠিক থাকবে।`
        : `Delete product "${product.name}"? Past sales records and totals stay intact.`
    );
    if (!confirmed) return;

    try {
      setBusyId(product.id);
      setMessage(null);
      const res = await deleteProductAction(product.id);
      if (res.success) {
        setList((prev) => prev.filter((p) => p.id !== product.id));
        setMessage({ type: "success", text: bn ? "পণ্য মুছে ফেলা হয়েছে" : "Product deleted" });
        onRefresh();
      } else {
        setMessage({ type: "error", text: res.error || "Error" });
      }
    } finally {
      setBusyId(null);
    }
  };

  const newIconPreview = getProductIconOption(
    newIcon ?? (newName.trim() ? guessProductIconId(newName) : null)
  );
  const NewIconPreview = newIconPreview.Icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-black/10 dark:ring-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-5 py-4 bg-white/70 dark:bg-zinc-950/70">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
            <Package className="w-5 h-5" />
            <span>{t("productCatalogTitle")}</span>
          </div>
          <button
            onClick={onClose}
            aria-label={t("cancel")}
            className="rounded-lg p-1.5 text-zinc-600 dark:text-zinc-400 transition-colors hover:bg-black/10 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div
            className={`m-4 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-700/60 text-rose-600 dark:text-rose-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="p-5 space-y-4 overflow-y-auto max-h-[440px]">
          {/* Add new product */}
          <form onSubmit={handleAdd} className="p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-sm">
              <Plus className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>{t("addProductBtn")}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder={t("productNamePlaceholder")}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
              />
              <input
                type="number"
                step="any"
                min="1"
                placeholder={t("productPricePlaceholder")}
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs font-mono placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  <Shapes className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  {t("productIconLabel")}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                  <NewIconPreview className={`w-3.5 h-3.5 ${newIconPreview.tone}`} />
                  {newIcon ? t("productIconChosen") : t("productIconAuto")}
                </span>
              </div>
              <IconPicker value={newIcon} onSelect={setNewIcon} disabled={adding} />
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>{t("saveProduct")}</span>
            </button>
          </form>

          {/* Product list, in menu order */}
          <div className="space-y-1.5">
            <p className="text-[10px] text-zinc-500">{t("reorderHint")}</p>
          </div>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
            {list.length === 0 ? (
              <div className="py-10 text-center text-zinc-500 text-xs">{t("noProductsYet")}</div>
            ) : (
              list.map((product, index) => {
                const isQuick = product.isQuickAccess === "true";
                const isEditing = editingId === product.id;
                const isBusy = busyId === product.id;
                const isPickingIcon = iconPickerId === product.id;
                const { Icon, tone } = getProductIconOption(
                  product.icon ?? guessProductIconId(product.name)
                );

                return (
                  <div key={product.id} className="py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setIconPickerId(isPickingIcon ? null : product.id);
                        }}
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                          isPickingIcon
                            ? "border-amber-500 bg-amber-500/15"
                            : "border-zinc-200 dark:border-zinc-700/80 bg-zinc-100 dark:bg-zinc-800/70 hover:border-amber-500/60"
                        }`}
                        title={t("changeProductIcon")}
                        aria-label={t("changeProductIcon")}
                      >
                        <Icon className={`w-4 h-4 ${tone}`} />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-900 dark:text-white text-sm truncate">{product.name}</span>
                          {isQuick && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                              {t("quickMenuBadge")}
                            </span>
                          )}
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-zinc-600 dark:text-zinc-400 font-mono text-xs">৳</span>
                            <input
                              type="number"
                              step="any"
                              min="1"
                              autoFocus
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-24 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-amber-500/60 text-zinc-900 dark:text-white text-xs font-mono focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePrice(product)}
                              disabled={isBusy}
                              className="px-2 py-1 rounded-lg bg-emerald-500 text-zinc-950 text-[11px] font-bold flex items-center gap-1 disabled:opacity-50"
                            >
                              {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                              <span>{t("saveProduct")}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-[11px]"
                            >
                              {t("cancel")}
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-0.5">
                            {formatCurrency(product.price)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => handleMove(index, -1)}
                            disabled={index === 0 || isBusy}
                            className="rounded-md p-0.5 text-zinc-500 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            title={t("moveUp")}
                            aria-label={t("moveUp")}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(index, 1)}
                            disabled={index === list.length - 1 || isBusy}
                            className="rounded-md p-0.5 text-zinc-500 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            title={t("moveDown")}
                            aria-label={t("moveDown")}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => startEditing(product)}
                            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title={t("editPrice")}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleQuick(product)}
                          disabled={isBusy}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                            isQuick
                              ? "text-emerald-700 dark:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              : "text-zinc-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }`}
                          title={t("toggleQuickAccess")}
                        >
                          {isQuick ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          disabled={isBusy}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                          title={t("deleteProduct")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isPickingIcon && (
                      <div className="mt-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-2 space-y-1.5">
                        <div className="flex items-center justify-between px-0.5">
                          <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
                            {t("chooseProductIcon")}
                          </span>
                          {isBusy && <Loader2 className="w-3 h-3 animate-spin text-amber-600" />}
                        </div>
                        <IconPicker
                          value={product.icon ?? null}
                          onSelect={(iconId) => handleSaveIcon(product, iconId)}
                          disabled={isBusy}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
