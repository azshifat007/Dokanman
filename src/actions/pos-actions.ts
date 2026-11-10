"use server";

import { db } from "@/db";
import { users, customers, products, orders, orderItems, transactions, expenses } from "@/db/schema";
import { eq, ilike, or, and, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuthUser } from "@/lib/auth";

// Helper to get active vendor user ID from session
async function getActiveUserId(): Promise<string> {
  const session = await requireAuthUser();
  return session.userId;
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
      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, customerId), eq(customers.userId, userId)))
        .limit(1);

      if (customer) {
        const currentDue = parseFloat(customer.totalDue || "0");
        const newDue = (currentDue + dueAmount).toFixed(2);

        await db
          .update(customers)
          .set({ totalDue: newDue })
          .where(and(eq(customers.id, customerId), eq(customers.userId, userId)));

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

    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, customerId), eq(customers.userId, userId)))
      .limit(1);

    if (!customer) {
      return { success: false, error: "কাস্টমার পাওয়া যায়নি!" };
    }

    const currentDue = parseFloat(customer.totalDue || "0");

    if (currentDue <= 0) {
      return { success: false, error: "এই কাস্টমারের কোনো বাকি নেই!" };
    }

    // Never record more cash than the outstanding due, otherwise today's cash totals inflate.
    const appliedAmount = Math.min(amountPaid, currentDue);
    const newDue = Math.max(0, currentDue - appliedAmount).toFixed(2);

    await db
      .update(customers)
      .set({ totalDue: newDue })
      .where(and(eq(customers.id, customerId), eq(customers.userId, userId)));

    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(transactions).values({
      id: txId,
      userId,
      customerId,
      orderId: null,
      amount: appliedAmount.toFixed(2),
      type: "PAYMENT",
      note: note || "বাকি পরিশোধ (Payment Settlement)",
    });

    revalidatePath("/");
    revalidatePath("/customers");

    return {
      success: true,
      remainingDue: newDue,
      previousDue: currentDue.toFixed(2),
      amountPaid: appliedAmount.toFixed(2),
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
    const userId = await getActiveUserId();
    const trimmed = query.trim();

    if (!trimmed) {
      const list = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, userId))
        .orderBy(desc(customers.totalDue))
        .limit(15);
      return { success: true, customers: list };
    }

    const list = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.userId, userId),
          or(ilike(customers.name, `%${trimmed}%`), ilike(customers.phone, `%${trimmed}%`))
        )
      )
      .orderBy(desc(customers.totalDue))
      .limit(15);

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

export async function getCustomerLedgerAction(customerId: string) {
  try {
    const userId = await getActiveUserId();

    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, customerId), eq(customers.userId, userId)))
      .limit(1);

    if (!customer) {
      return { success: false, error: "কাস্টমার পাওয়া যায়নি", transactions: [] };
    }

    const rows = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.customerId, customerId), eq(transactions.userId, userId)))
      .orderBy(desc(transactions.createdAt))
      .limit(100);

    return { success: true, transactions: rows, customer };
  } catch (err: unknown) {
    console.error("getCustomerLedgerAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "লেনদেন লোড করতে সমস্যা হয়েছে",
      transactions: [],
    };
  }
}

export async function updateProductPriceAction(productId: string, newPrice: number) {
  try {
    const userId = await getActiveUserId();
    await db
      .update(products)
      .set({ price: newPrice.toFixed(2) })
      .where(and(eq(products.id, productId), eq(products.userId, userId)));

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("updateProductPriceAction error:", err);
    return { success: false, error: "পণ্যের মূল্য পরিবর্তন করতে সমস্যা হয়েছে" };
  }
}

export async function addProductAction(data: { name: string; price: number; isQuickAccess?: boolean }) {
  try {
    const userId = await getActiveUserId();
    const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const [prod] = await db
      .insert(products)
      .values({
        id,
        userId,
        name: data.name.trim(),
        price: data.price.toFixed(2),
        isQuickAccess: data.isQuickAccess !== false ? "true" : "false",
      })
      .returning();

    revalidatePath("/");
    return { success: true, product: prod };
  } catch (err: unknown) {
    console.error("addProductAction error:", err);
    return { success: false, error: "নতুন পণ্য যুক্ত করতে সমস্যা হয়েছে" };
  }
}

export async function toggleProductQuickAccessAction(productId: string, isQuickAccess: boolean) {
  try {
    const userId = await getActiveUserId();
    await db
      .update(products)
      .set({ isQuickAccess: isQuickAccess ? "true" : "false" })
      .where(and(eq(products.id, productId), eq(products.userId, userId)));

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("toggleProductQuickAccessAction error:", err);
    return { success: false, error: "পণ্যের কুইক অ্যাক্সেস পরিবর্তন করতে সমস্যা হয়েছে" };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const userId = await getActiveUserId();
    await db
      .delete(products)
      .where(and(eq(products.id, productId), eq(products.userId, userId)));

    // Order items keep their historical product name snapshot; only the FK link is cleared.
    const ownOrderIds = db.select({ id: orders.id }).from(orders).where(eq(orders.userId, userId));
    await db
      .update(orderItems)
      .set({ productId: null })
      .where(and(eq(orderItems.productId, productId), inArray(orderItems.orderId, ownOrderIds)));

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("deleteProductAction error:", err);
    return { success: false, error: "পণ্য মুছতে সমস্যা হয়েছে" };
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
    .orderBy(desc(customers.totalDue));

  // 4. Financial Statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId));

  let todayCash = 0;
  let todayDue = 0;
  let todayOrdersCount = 0;

  for (const ord of userOrders) {
    const orderDate = new Date(ord.createdAt);
    if (orderDate >= today) {
      todayCash += parseFloat(ord.paidAmount || "0");
      todayDue += parseFloat(ord.dueAmount || "0");
      todayOrdersCount += 1;
    }
  }

  // Include direct cash payments from settleCustomerDueAction today
  const userTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId));

  for (const tx of userTransactions) {
    const txDate = new Date(tx.createdAt);
    if (txDate >= today && tx.type === "PAYMENT") {
      todayCash += parseFloat(tx.amount || "0");
    }
  }

  // Today's Expenses
  const userExpenses = await db
    .select()
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .orderBy(desc(expenses.createdAt));

  let todayExpense = 0;
  for (const exp of userExpenses) {
    const expDate = new Date(exp.createdAt);
    if (expDate >= today) {
      todayExpense += parseFloat(exp.amount || "0");
    }
  }

  // Total active store credit across all customers
  const totalActiveDue = initialCustomers.reduce(
    (sum, c) => sum + parseFloat(c.totalDue || "0"),
    0
  );

  return {
    shop: shopUser,
    products: quickProducts,
    customers: initialCustomers,
    expenses: userExpenses,
    stats: {
      todayCash,
      todayDue,
      totalActiveDue,
      todayOrdersCount,
      todayExpense,
      todayNetProfit: Math.max(0, todayCash - todayExpense),
    },
  };
}
