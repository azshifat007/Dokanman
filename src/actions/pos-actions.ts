"use server";

import { db } from "@/db";
import { users, customers, products, orders, orderItems, transactions } from "@/db/schema";
import { eq, ilike, or, sql, desc, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Helper to get active vendor user ID
async function getActiveUserId(): Promise<string> {
  const [user] = await db.select().from(users).limit(1);
  if (!user) {
    throw new Error("No vendor user found. Please run seed script.");
  }
  return user.id;
}

export interface CreateOrderPayload {
  customerId?: string | null;
  items: Array<{
    productId?: string | null;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  paidAmount: number;
  dueAmount: number;
  note?: string;
}

export async function createOrderAction(payload: CreateOrderPayload) {
  try {
    const userId = await getActiveUserId();
    const { customerId, items, paidAmount, dueAmount, note } = payload;

    if (!items || items.length === 0) {
      return { success: false, error: "কার্টে কোনো পণ্য নেই!" };
    }

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    let status: "PAID" | "DUE" | "PARTIAL" = "PAID";
    if (dueAmount > 0 && paidAmount > 0) {
      status = "PARTIAL";
    } else if (dueAmount > 0 && paidAmount <= 0) {
      status = "DUE";
    }

    // Generate unique order ID
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Insert order
    const [order] = await db
      .insert(orders)
      .values({
        id: orderId,
        userId,
        customerId: customerId || null,
        totalAmount: totalAmount.toFixed(2),
        paidAmount: paidAmount.toFixed(2),
        dueAmount: dueAmount.toFixed(2),
        status,
      })
      .returning();

    // 2. Insert order items
    const formattedItems = items.map((item, idx) => ({
      id: `item_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      orderId: order.id,
      productId: item.productId || null,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      subtotal: (item.quantity * item.unitPrice).toFixed(2),
    }));

    await db.insert(orderItems).values(formattedItems);

    // 3. If credit (due > 0) and customer exists, update customer totalDue & record transaction
    if (dueAmount > 0 && customerId) {
      const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);

      if (customer) {
        const currentDue = parseFloat(customer.totalDue || "0");
        const newDue = (currentDue + dueAmount).toFixed(2);

        await db
          .update(customers)
          .set({ totalDue: newDue })
          .where(eq(customers.id, customerId));

        await db.insert(transactions).values({
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId,
          customerId,
          orderId: order.id,
          amount: dueAmount.toFixed(2),
          type: "PURCHASE",
          note: note || `অর্ডার বাকি (${items.map((i) => `${i.productName} x${i.quantity}`).join(", ")})`,
        });
      }
    }

    // 4. Revalidate cache
    revalidatePath("/");
    revalidatePath("/customers");
    if (customerId) {
      revalidatePath(`/customers/${customerId}`);
    }

    return { success: true, orderId: order.id };
  } catch (err: unknown) {
    console.error("createOrderAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "অর্ডার সংরক্ষণ করতে সমস্যা হয়েছে",
    };
  }
}

export interface SettleCustomerDuePayload {
  customerId: string;
  amountPaid: number;
  note?: string;
}

export async function settleCustomerDueAction(payload: SettleCustomerDuePayload) {
  try {
    const userId = await getActiveUserId();
    const { customerId, amountPaid, note } = payload;

    if (!amountPaid || amountPaid <= 0) {
      return { success: false, error: "টাকার পরিমাণ সঠিক নয়!" };
    }

    const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
    if (!customer) {
      return { success: false, error: "কাস্টমার পাওয়া যায়নি!" };
    }

    const currentDue = parseFloat(customer.totalDue || "0");
    const newDue = Math.max(0, currentDue - amountPaid).toFixed(2);

    await db
      .update(customers)
      .set({ totalDue: newDue })
      .where(eq(customers.id, customerId));

    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(transactions).values({
      id: txId,
      userId,
      customerId,
      orderId: null,
      amount: amountPaid.toFixed(2),
      type: "PAYMENT",
      note: note || "বাকি পরিশোধ (Payment Settlement)",
    });

    revalidatePath("/");
    revalidatePath("/customers");
    revalidatePath(`/customers/${customerId}`);

    return {
      success: true,
      remainingDue: newDue,
      previousDue: currentDue.toFixed(2),
      amountPaid: amountPaid.toFixed(2),
    };
  } catch (err: unknown) {
    console.error("settleCustomerDueAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "বাকি পরিশোধ এন্ট্রি করতে ব্যর্থ হয়েছে",
    };
  }
}

export async function searchCustomersAction(query: string) {
  try {
    const trimmed = query.trim();
    if (!trimmed) {
      // Return top 10 customers
      const list = await db.select().from(customers).orderBy(desc(customers.totalDue)).limit(10);
      return { success: true, customers: list };
    }

    const list = await db
      .select()
      .from(customers)
      .where(or(ilike(customers.name, `%${trimmed}%`), ilike(customers.phone, `%${trimmed}%`)))
      .orderBy(desc(customers.totalDue))
      .limit(10);

    return { success: true, customers: list };
  } catch (err: unknown) {
    console.error("searchCustomersAction error:", err);
    return { success: false, customers: [] };
  }
}

export async function createCustomerAction(data: { name: string; phone?: string; initialDue?: number }) {
  try {
    const userId = await getActiveUserId();
    const id = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const due = data.initialDue ? Math.max(0, data.initialDue).toFixed(2) : "0.00";

    const [customer] = await db
      .insert(customers)
      .values({
        id,
        userId,
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        totalDue: due,
      })
      .returning();

    if (data.initialDue && data.initialDue > 0) {
      await db.insert(transactions).values({
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        customerId: customer.id,
        orderId: null,
        amount: due,
        type: "PURCHASE",
        note: "পূর্বের বকেয়া হিসাব (Opening Balance)",
      });
    }

    revalidatePath("/");
    revalidatePath("/customers");

    return { success: true, customer };
  } catch (err: unknown) {
    console.error("createCustomerAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "নতুন কাস্টমার তৈরি করতে সমস্যা হয়েছে",
    };
  }
}

export async function getDashboardInitialData() {
  const userId = await getActiveUserId();

  // 1. Shop Vendor Details
  const [shopUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  // 2. Quick Access Products
  const quickProducts = await db
    .select()
    .from(products)
    .where(eq(products.userId, userId))
    .orderBy(products.name);

  // 3. Customers list
  const initialCustomers = await db
    .select()
    .from(customers)
    .where(eq(customers.userId, userId))
    .orderBy(desc(customers.totalDue))
    .limit(15);

  // 4. Financial Statistics
  // Today's start
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId));

  let todayCash = 0;
  let todayDue = 0;
  let todayOrdersCount = 0;

  for (const ord of todayOrders) {
    const orderDate = new Date(ord.createdAt);
    if (orderDate >= today) {
      todayCash += parseFloat(ord.paidAmount || "0");
      todayDue += parseFloat(ord.dueAmount || "0");
      todayOrdersCount += 1;
    }
  }

  // Also include direct cash payments from settleCustomerDueAction today
  const todayPayments = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId));

  for (const tx of todayPayments) {
    const txDate = new Date(tx.createdAt);
    if (txDate >= today && tx.type === "PAYMENT") {
      todayCash += parseFloat(tx.amount || "0");
    }
  }

  // Total active store due
  const allCusts = await db.select({ totalDue: customers.totalDue }).from(customers).where(eq(customers.userId, userId));
  const totalActiveDue = allCusts.reduce((sum, c) => sum + parseFloat(c.totalDue || "0"), 0);

  return {
    shop: shopUser,
    products: quickProducts,
    customers: initialCustomers,
    stats: {
      todayCash,
      todayDue,
      totalActiveDue,
      todayOrdersCount,
    },
  };
}

export async function getCustomerDetailsAction(customerId: string) {
  const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  if (!customer) return null;

  const customerTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.customerId, customerId))
    .orderBy(desc(transactions.createdAt));

  const customerOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt))
    .limit(20);

  return {
    customer,
    transactions: customerTransactions,
    orders: customerOrders,
  };
}
