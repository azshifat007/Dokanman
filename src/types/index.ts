export interface Customer {
  id: string;
  userId: string;
  name: string;
  phone: string | null;
  totalDue: string;
  createdAt: Date | string;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  price: string;
  isQuickAccess: string;
  /** Icon id from src/lib/product-icons.ts; null means "guess from the name". */
  icon?: string | null;
  /** Menu position, lowest first. */
  sortOrder?: number;
  createdAt: Date | string;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}

export interface Order {
  id: string;
  userId: string;
  customerId: string | null;
  totalAmount: string;
  paidAmount: string;
  dueAmount: string;
  status: "PAID" | "DUE" | "PARTIAL";
  createdAt: Date | string;
  customer?: Customer | null;
  items?: OrderItem[];
}

export interface Transaction {
  id: string;
  userId: string;
  customerId: string;
  orderId: string | null;
  amount: string;
  type: "PURCHASE" | "PAYMENT";
  note: string | null;
  createdAt: Date | string;
  customer?: Customer | null;
  order?: Order | null;
}

export interface Expense {
  id: string;
  userId: string;
  category: string;
  amount: string;
  note: string | null;
  createdAt: Date | string;
}

export type AppTab = "dashboard" | "pos" | "ledger" | "expenses";

export interface DashboardStats {
  todayCash: number;
  todayDue: number;
  totalActiveDue: number;
  todayOrdersCount: number;
  todayExpense: number;
  todayNetProfit: number;
}

/** One entry of the 7-day sales trend shown on the dashboard. `date` is a local YYYY-MM-DD key. */
export interface DailySalesPoint {
  date: string;
  cash: number;
  credit: number;
  expense: number;
}

export interface RecentSale {
  id: string;
  customerName: string | null;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: "PAID" | "DUE" | "PARTIAL";
  createdAt: string;
}

export interface DashboardInsights {
  daily: DailySalesPoint[];
  recentSales: RecentSale[];
  topDebtors: Array<{ id: string; name: string; phone: string | null; due: number }>;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  weekSales: number;
  weekCash: number;
  yesterdayCash: number;
  customerCount: number;
  productCount: number;
  averageSale: number;
}
