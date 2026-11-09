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

export interface DashboardStats {
  todayCash: number;
  todayDue: number;
  totalActiveDue: number;
  todayOrdersCount: number;
}
