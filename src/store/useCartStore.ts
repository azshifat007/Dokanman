import { create } from "zustand";
import { Customer, CartItem } from "@/types";

interface CartStore {
  selectedCustomer: Customer | null;
  items: CartItem[];
  paymentMode: "PAID" | "DUE" | "PARTIAL";
  customPaidAmount: number;
  orderNote: string;
  isSubmitting: boolean;

  // Actions
  selectCustomer: (customer: Customer | null) => void;
  addItem: (product: { id: string; name: string; price: string | number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  setPaymentMode: (mode: "PAID" | "DUE" | "PARTIAL") => void;
  setCustomPaidAmount: (amount: number) => void;
  setOrderNote: (note: string) => void;
  setIsSubmitting: (loading: boolean) => void;
  clearCart: () => void;

  // Calculations
  getSubtotal: () => number;
  getPreviousDue: () => number;
  getPaidAmount: () => number;
  getDueAmount: () => number;
  getNewTotalBalance: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  selectedCustomer: null,
  items: [],
  paymentMode: "PAID",
  customPaidAmount: 0,
  orderNote: "",
  isSubmitting: false,

  selectCustomer: (customer) => {
    set({ selectedCustomer: customer });
  },

  addItem: (product) => {
    const unitPrice = typeof product.price === "string" ? parseFloat(product.price) : product.price;
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex((item) => item.productId === product.id);

    if (existingIndex > -1) {
      const updated = [...currentItems];
      const newQty = updated[existingIndex].quantity + 1;
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        subtotal: Number((newQty * unitPrice).toFixed(2)),
      };
      set({ items: updated });
    } else {
      set({
        items: [
          ...currentItems,
          {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            unitPrice,
            subtotal: unitPrice,
          },
        ],
      });
    }
  },

  removeItem: (productId) => {
    set({
      items: get().items.filter((item) => item.productId !== productId),
    });
  },

  updateQuantity: (productId, delta) => {
    const currentItems = get().items;
    const existing = currentItems.find((item) => item.productId === productId);
    if (!existing) return;

    const newQty = existing.quantity + delta;
    if (newQty <= 0) {
      set({
        items: currentItems.filter((item) => item.productId !== productId),
      });
    } else {
      set({
        items: currentItems.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: newQty,
                subtotal: Number((newQty * item.unitPrice).toFixed(2)),
              }
            : item
        ),
      });
    }
  },

  setQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              subtotal: Number((quantity * item.unitPrice).toFixed(2)),
            }
          : item
      ),
    });
  },

  setPaymentMode: (mode) => {
    set({ paymentMode: mode });
  },

  setCustomPaidAmount: (amount) => {
    set({ customPaidAmount: Math.max(0, amount) });
  },

  setOrderNote: (note) => {
    set({ orderNote: note });
  },

  setIsSubmitting: (loading) => {
    set({ isSubmitting: loading });
  },

  clearCart: () => {
    set({
      items: [],
      paymentMode: "PAID",
      customPaidAmount: 0,
      orderNote: "",
    });
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0);
  },

  getPreviousDue: () => {
    const cust = get().selectedCustomer;
    return cust ? parseFloat(cust.totalDue || "0") : 0;
  },

  getPaidAmount: () => {
    const subtotal = get().getSubtotal();
    const mode = get().paymentMode;
    if (mode === "PAID") return subtotal;
    if (mode === "DUE") return 0;
    // PARTIAL
    const custom = get().customPaidAmount;
    return Math.min(subtotal, Math.max(0, custom));
  },

  getDueAmount: () => {
    const subtotal = get().getSubtotal();
    const paid = get().getPaidAmount();
    return Math.max(0, Number((subtotal - paid).toFixed(2)));
  },

  getNewTotalBalance: () => {
    const prevDue = get().getPreviousDue();
    const orderDue = get().getDueAmount();
    return Number((prevDue + orderDue).toFixed(2));
  },
}));
