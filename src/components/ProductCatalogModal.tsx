"use client";

import { useState } from "react";
import { Product } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import {
  addProductAction,
  updateProductPriceAction,
  toggleProductQuickAccessAction,
  deleteProductAction,
} from "@/actions/pos-actions";
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
} from "lucide-react";

interface ProductCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRefresh: () => void;
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
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
      const res = await addProductAction({ name: newName.trim(), price: priceNum });
      if (res.success && res.product) {
        setList((prev) =>
          [...prev, res.product as unknown as Product].sort((a, b) => a.name.localeCompare(b.name))
        );
        setNewName("");
        setNewPrice("");
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

  const handleDelete = async (product: Product) => {
    const confirmed = confirm(
      bn ? `"${product.name}" পণ্যটি মুছে ফেলতে চান?` : `Delete product "${product.name}"?`
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 bg-zinc-950/70">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Package className="w-5 h-5" />
            <span>{t("productCatalogTitle")}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div
            className={`m-4 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-950/60 border border-emerald-700/60 text-emerald-300"
                : "bg-rose-950/60 border border-rose-700/60 text-rose-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="p-5 space-y-4 overflow-y-auto max-h-[440px]">
          {/* Add new product */}
          <form onSubmit={handleAdd} className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>{t("addProductBtn")}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder={t("productNamePlaceholder")}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
              />
              <input
                type="number"
                step="any"
                min="1"
                placeholder={t("productPricePlaceholder")}
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
              />
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

          {/* Product list */}
          <div className="divide-y divide-zinc-800/80">
            {list.length === 0 ? (
              <div className="py-10 text-center text-zinc-500 text-xs">{t("noProductsYet")}</div>
            ) : (
              list.map((product) => {
                const isQuick = product.isQuickAccess === "true";
                const isEditing = editingId === product.id;
                const isBusy = busyId === product.id;

                return (
                  <div key={product.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm truncate">{product.name}</span>
                        {isQuick && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {t("quickMenuBadge")}
                          </span>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-zinc-400 font-mono text-xs">৳</span>
                          <input
                            type="number"
                            step="any"
                            min="1"
                            autoFocus
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-24 px-2 py-1 rounded-lg bg-zinc-800 border border-amber-500/60 text-white text-xs font-mono focus:outline-hidden"
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
                            className="px-2 py-1 rounded-lg text-zinc-400 hover:text-white text-[11px]"
                          >
                            {t("cancel")}
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-zinc-400 font-mono mt-0.5">
                          {formatCurrency(product.price)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => startEditing(product)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
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
                            ? "text-emerald-400 hover:bg-zinc-800"
                            : "text-zinc-500 hover:text-emerald-400 hover:bg-zinc-800"
                        }`}
                        title={t("toggleQuickAccess")}
                      >
                        {isQuick ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        disabled={isBusy}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        title={t("deleteProduct")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
