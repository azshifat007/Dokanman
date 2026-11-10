"use server";

import { db } from "@/db";
import { users, customers, products, orders, orderItems, transactions, expenses } from "@/db/schema";
import { eq, ilike, or, and, desc, inArray, gte, sql } from "drizzle-orm";
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

export async function updateCustomerAction(data: { id: string; name: string; phone?: string }) {
  try {
    const userId = await getActiveUserId();
    const name = data.name.trim();

    if (!name) {
      return { success: false, error: "কাস্টমারের নাম লিখুন" };
    }

    const [updated] = await db
      .update(customers)
      .set({ name, phone: data.phone?.trim() || null })
      .where(and(eq(customers.id, data.id), eq(customers.userId, userId)))
      .returning();

    if (!updated) {
      return { success: false, error: "কাস্টমার পাওয়া যায়নি" };
    }

    revalidatePath("/");
    revalidatePath("/customers");

    return { success: true, customer: updated };
  } catch (err: unknown) {
    console.error("updateCustomerAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "কাস্টমারের তথ্য সেভ করতে সমস্যা হয়েছে",
    };
  }
}

/**
 * Removes a customer with their credit ledger. Past orders stay in the sales log
 * (orders.customer_id is set to null), and the transactions tied to them are
 * cascaded away by the schema, so the shop's outstanding total drops by the due.
 */
export async function deleteCustomerAction(customerId: string) {
  try {
    const userId = await getActiveUserId();

    const [existing] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(and(eq(customers.id, customerId), eq(customers.userId, userId)))
      .limit(1);

    if (!existing) {
      return { success: false, error: "কাস্টমার পাওয়া যায়নি" };
    }

    await db.delete(customers).where(and(eq(customers.id, customerId), eq(customers.userId, userId)));

    revalidatePath("/");
    revalidatePath("/customers");

    return { success: true };
  } catch (err: unknown) {
    console.error("deleteCustomerAction error:", err);
    return { success: false, error: "কাস্টমার মুছতে সমস্যা হয়েছে" };
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

/**
 * Sales log for the shop: orders in the last `days` days with their line items,
 * newest first. `days` is clamped so a client cannot ask for the whole history at
 * once; 0 means "all time" capped by the row limit below.
 */
export async function getSalesHistoryAction(days: number) {
  try {
    const userId = await getActiveUserId();
    const range = Number.isFinite(days) ? Math.min(Math.max(Math.trunc(days), 0), 365) : 7;

    const since = new Date();
    since.setHours(0, 0, 0, 0);
    if (range > 0) since.setDate(since.getDate() - (range - 1));

    const where = range > 0
      ? and(eq(orders.userId, userId), gte(orders.createdAt, since))
      : eq(orders.userId, userId);

    const orderRows = await db
      .select({
        id: orders.id,
        customerName: customers.name,
        customerPhone: customers.phone,
        totalAmount: orders.totalAmount,
        paidAmount: orders.paidAmount,
        dueAmount: orders.dueAmount,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(200);

    const orderIds = orderRows.map((order) => order.id);
    const itemRows = orderIds.length
      ? await db
          .select({
            orderId: orderItems.orderId,
            productName: orderItems.productName,
            quantity: orderItems.quantity,
            unitPrice: orderItems.unitPrice,
            subtotal: orderItems.subtotal,
          })
          .from(orderItems)
          .where(inArray(orderItems.orderId, orderIds))
      : [];

    const itemsByOrder = new Map<string, typeof itemRows>();
    for (const item of itemRows) {
      const list = itemsByOrder.get(item.orderId);
      if (list) list.push(item);
      else itemsByOrder.set(item.orderId, [item]);
    }

    const salesLog = orderRows.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      items: (itemsByOrder.get(order.id) ?? []).map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
    }));

    const totals = salesLog.reduce(
      (acc, order) => {
        acc.total += Number(order.totalAmount);
        acc.cash += Number(order.paidAmount);
        acc.due += Number(order.dueAmount);
        return acc;
      },
      { total: 0, cash: 0, due: 0 }
    );

    return { success: true as const, orders: salesLog, totals, days: range };
  } catch (err: unknown) {
    console.error("getSalesHistoryAction error:", err);
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "বিক্রির তালিকা লোড করা যায়নি",
      orders: [],
      totals: { total: 0, cash: 0, due: 0 },
      days: 0,
    };
  }
}

export async function updateProductIconAction(productId: string, icon: string | null) {
  try {
    const userId = await getActiveUserId();
    await db
      .update(products)
      .set({ icon })
      .where(and(eq(products.id, productId), eq(products.userId, userId)));

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("updateProductIconAction error:", err);
    return { success: false, error: "পণ্যের আইকন পরিবর্তন করতে সমস্যা হয়েছে" };
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

export async function addProductAction(data: {
  name: string;
  price: number;
  isQuickAccess?: boolean;
  icon?: string | null;
}) {
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
        icon: data.icon || null,
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

    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, productId), eq(products.userId, userId)))
      .limit(1);

    if (!existing) {
      return { success: false, error: "পণ্যটি পাওয়া যায়নি" };
    }

    // order_items.product_id has no ON DELETE rule, so the historical rows must be
    // unlinked first or Postgres rejects the delete. Their name snapshot stays
    // intact. This is not wrapped in a transaction because the neon-http driver
    // does not support them; unlink-then-delete is already the safe order.
    const ownOrderIds = db.select({ id: orders.id }).from(orders).where(eq(orders.userId, userId));
    await db
      .update(orderItems)
      .set({ productId: null })
      .where(and(eq(orderItems.productId, productId), inArray(orderItems.orderId, ownOrderIds)));

    await db.delete(products).where(and(eq(products.id, productId), eq(products.userId, userId)));

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("deleteProductAction error:", err);
    return { success: false, error: "পণ্য মুছতে সমস্যা হয়েছে" };
  }
}

/** Local YYYY-MM-DD key, matching how the app groups days (shop-local midnight). */
function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export async function getDashboardInitialData() {
  const userId = await getActiveUserId();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // The dashboard only needs the current week, so every aggregate query below is
  // bounded instead of scanning the vendor's whole history.
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);

  const [shopUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  const [
    quickProducts,
    initialCustomers,
    weekOrders,
    weekPayments,
    weekExpenses,
    recentOrderRows,
    topProductRows,
    expenseList,
  ] = await Promise.all([
      db.select().from(products).where(eq(products.userId, userId)).orderBy(products.name),
      db.select().from(customers).where(eq(customers.userId, userId)).orderBy(desc(customers.totalDue)),
      db
        .select({
          totalAmount: orders.totalAmount,
          paidAmount: orders.paidAmount,
          dueAmount: orders.dueAmount,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(and(eq(orders.userId, userId), gte(orders.createdAt, weekStart))),
      db
        .select({ amount: transactions.amount, createdAt: transactions.createdAt })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.type, "PAYMENT"),
            gte(transactions.createdAt, weekStart)
          )
        ),
      db
        .select({ amount: expenses.amount, createdAt: expenses.createdAt })
        .from(expenses)
        .where(and(eq(expenses.userId, userId), gte(expenses.createdAt, weekStart)))
        .orderBy(desc(expenses.createdAt)),
      db
        .select({
          id: orders.id,
          customerName: customers.name,
          totalAmount: orders.totalAmount,
          paidAmount: orders.paidAmount,
          dueAmount: orders.dueAmount,
          status: orders.status,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .leftJoin(customers, eq(orders.customerId, customers.id))
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt))
        .limit(6),
      db
        .select({
          name: orderItems.productName,
          quantity: sql<string>`sum(${orderItems.quantity})`,
          revenue: sql<string>`sum(${orderItems.subtotal})`,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(and(eq(orders.userId, userId), gte(orders.createdAt, weekStart)))
        .groupBy(orderItems.productName)
        .orderBy(desc(sql`sum(${orderItems.quantity})`))
        .limit(4),
      db
        .select()
        .from(expenses)
        .where(eq(expenses.userId, userId))
        .orderBy(desc(expenses.createdAt))
        .limit(200),
    ]);

  // Build the 7-day series (oldest first) from the bounded rows we already have.
  const daily = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(day.getDate() - (6 - index));
    return { date: localDayKey(day), cash: 0, credit: 0, expense: 0 };
  });
  const byDay = new Map(daily.map((point) => [point.date, point]));

  const todayKey = localDayKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = localDayKey(yesterday);

  let todayCash = 0;
  let todayDue = 0;
  let todayOrdersCount = 0;
  let todaySales = 0;
  let weekSales = 0;
  let weekCash = 0;
  let yesterdayCash = 0;

  for (const ord of weekOrders) {
    const createdAt = new Date(ord.createdAt);
    const key = localDayKey(createdAt);
    const paid = parseFloat(ord.paidAmount || "0");
    const due = parseFloat(ord.dueAmount || "0");
    const total = parseFloat(ord.totalAmount || "0");

    weekSales += total;
    weekCash += paid;

    const point = byDay.get(key);
    if (point) {
      point.cash += paid;
      point.credit += due;
    }

    if (key === todayKey) {
      todayCash += paid;
      todayDue += due;
      todayOrdersCount += 1;
      todaySales += total;
    } else if (key === yesterdayKey) {
      yesterdayCash += paid;
    }
  }

  // Direct cash payments from settleCustomerDueAction count as cash-in too.
  for (const tx of weekPayments) {
    const createdAt = new Date(tx.createdAt);
    const key = localDayKey(createdAt);
    const amount = parseFloat(tx.amount || "0");

    weekCash += amount;
    const point = byDay.get(key);
    if (point) point.cash += amount;

    if (key === todayKey) todayCash += amount;
    else if (key === yesterdayKey) yesterdayCash += amount;
  }

  let todayExpense = 0;
  for (const exp of weekExpenses) {
    const createdAt = new Date(exp.createdAt);
    const key = localDayKey(createdAt);
    const amount = parseFloat(exp.amount || "0");

    const point = byDay.get(key);
    if (point) point.expense += amount;

    if (key === todayKey) todayExpense += amount;
  }

  const totalActiveDue = initialCustomers.reduce(
    (sum, c) => sum + parseFloat(c.totalDue || "0"),
    0
  );

  return {
    shop: shopUser,
    products: quickProducts,
    customers: initialCustomers,
    expenses: expenseList,
    stats: {
      todayCash,
      todayDue,
      totalActiveDue,
      todayOrdersCount,
      todayExpense,
      todayNetProfit: todayCash - todayExpense,
    },
    insights: {
      daily,
      recentSales: recentOrderRows.map((row) => ({
        id: row.id,
        customerName: row.customerName ?? null,
        totalAmount: parseFloat(row.totalAmount || "0"),
        paidAmount: parseFloat(row.paidAmount || "0"),
        dueAmount: parseFloat(row.dueAmount || "0"),
        status: row.status,
        createdAt: new Date(row.createdAt).toISOString(),
      })),
      topDebtors: initialCustomers
        .slice(0, 5)
        .filter((c) => parseFloat(c.totalDue || "0") > 0)
        .map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          due: parseFloat(c.totalDue || "0"),
        })),
      topProducts: topProductRows.map((row) => ({
        name: row.name,
        quantity: Number(row.quantity || 0),
        revenue: parseFloat(row.revenue || "0"),
      })),
      weekSales,
      weekCash,
      yesterdayCash,
      customerCount: initialCustomers.length,
      productCount: quickProducts.length,
      averageSale: todayOrdersCount > 0 ? todaySales / todayOrdersCount : 0,
    },
  };
}
