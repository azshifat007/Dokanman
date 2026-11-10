"use server";

import { db } from "@/db";
import { users, customers, products, orders, orderItems, transactions, expenses } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { requireAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function exportFullBackupAction() {
  try {
    const user = await requireAuthUser();

    const [userProfile] = await db.select().from(users).where(eq(users.id, user.userId)).limit(1);
    const userProducts = await db.select().from(products).where(eq(products.userId, user.userId));
    const userCustomers = await db.select().from(customers).where(eq(customers.userId, user.userId));
    const userOrders = await db.select().from(orders).where(eq(orders.userId, user.userId));
    const userTransactions = await db.select().from(transactions).where(eq(transactions.userId, user.userId));
    const userExpenses = await db.select().from(expenses).where(eq(expenses.userId, user.userId));

    // Also get order items for all user orders
    const orderIds = userOrders.map((o) => o.id);
    const userOrderItems = orderIds.length > 0
      ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
      : [];

    const backupData = {
      version: "1.0",
      app: "Dokanman",
      exportedAt: new Date().toISOString(),
      shop: {
        id: userProfile?.id,
        shopName: userProfile?.shopName,
        phone: userProfile?.phone,
      },
      counts: {
        products: userProducts.length,
        customers: userCustomers.length,
        orders: userOrders.length,
        transactions: userTransactions.length,
        expenses: userExpenses.length,
      },
      data: {
        products: userProducts,
        customers: userCustomers,
        orders: userOrders,
        orderItems: userOrderItems,
        transactions: userTransactions,
        expenses: userExpenses,
      },
    };

    return { success: true, backup: backupData };
  } catch (err: unknown) {
    console.error("exportFullBackupAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "ব্যাকআপ তৈরি করতে সমস্যা হয়েছে",
    };
  }
}

export async function exportCsvAction(type: "customers" | "transactions" | "orders" | "expenses") {
  try {
    const user = await requireAuthUser();

    // UTF-8 BOM so Excel displays Bengali properly without mojibake
    const BOM = "\uFEFF";
    let csv = "";
    let filename = "";

    if (type === "customers") {
      filename = `dokanman_customers_${Date.now()}.csv`;
      csv = `${BOM}Customer Name,Mobile Phone,Total Due (BDT),Registered Date\n`;
      const list = await db.select().from(customers).where(eq(customers.userId, user.userId));
      for (const c of list) {
        csv += `"${c.name.replace(/"/g, '""')}","${c.phone || ""}","${c.totalDue}","${new Date(c.createdAt).toLocaleDateString()}"\n`;
      }
    } else if (type === "transactions") {
      filename = `dokanman_transactions_${Date.now()}.csv`;
      csv = `${BOM}Date,Customer Name,Type,Amount (BDT),Note\n`;
      const txs = await db.select().from(transactions).where(eq(transactions.userId, user.userId));
      const custs = await db.select().from(customers).where(eq(customers.userId, user.userId));
      const custMap = new Map(custs.map((c) => [c.id, c.name]));

      for (const tx of txs) {
        const cName = custMap.get(tx.customerId) || "Unknown";
        csv += `"${new Date(tx.createdAt).toLocaleDateString()}","${cName.replace(/"/g, '""')}","${tx.type}","${tx.amount}","${(tx.note || "").replace(/"/g, '""')}"\n`;
      }
    } else if (type === "orders") {
      filename = `dokanman_orders_${Date.now()}.csv`;
      csv = `${BOM}Date,Total (BDT),Paid (BDT),Due (BDT),Status\n`;
      const ords = await db.select().from(orders).where(eq(orders.userId, user.userId));
      for (const o of ords) {
        csv += `"${new Date(o.createdAt).toLocaleDateString()}","${o.totalAmount}","${o.paidAmount}","${o.dueAmount}","${o.status}"\n`;
      }
    } else if (type === "expenses") {
      filename = `dokanman_expenses_${Date.now()}.csv`;
      csv = `${BOM}Date,Category,Amount (BDT),Note\n`;
      const exps = await db.select().from(expenses).where(eq(expenses.userId, user.userId));
      for (const e of exps) {
        csv += `"${new Date(e.createdAt).toLocaleDateString()}","${e.category.replace(/"/g, '""')}","${e.amount}","${(e.note || "").replace(/"/g, '""')}"\n`;
      }
    }

    return { success: true, csv, filename };
  } catch (err: unknown) {
    console.error("exportCsvAction error:", err);
    return { success: false, error: "CSV তৈরিতে ত্রুটি হয়েছে" };
  }
}

export type ImportMode = "merge" | "replace";

// Deterministic per-import unique id so restores never collide with another tenant's rows
function makeImportId(prefix: string, userId: string, originalId: string): string {
  const suffix = String(originalId ?? "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-40);
  return `${prefix}_${userId}_${suffix}_${Math.random().toString(36).substring(2, 7)}`;
}

export async function importFullBackupAction(
  backupJsonString: string,
  mode: ImportMode = "merge"
) {
  try {
    const user = await requireAuthUser();
    let parsed: unknown;
    try {
      parsed = JSON.parse(backupJsonString);
    } catch {
      return { success: false, error: "ফাইলটি বৈধ JSON ব্যাকআপ নয়" };
    }

    const payload = parsed as {
      app?: string;
      version?: string;
      data?: Record<string, unknown>;
    };

    if (!payload || typeof payload !== "object" || !payload.data) {
      return { success: false, error: "অবৈধ ব্যাকআপ ফাইল ফরম্যাট" };
    }

    const data = payload.data as {
      products?: unknown;
      customers?: unknown;
      orders?: unknown;
      orderItems?: unknown;
      transactions?: unknown;
      expenses?: unknown;
    };

    const bProducts = Array.isArray(data.products) ? data.products : [];
    const bCustomers = Array.isArray(data.customers) ? data.customers : [];
    const bOrders = Array.isArray(data.orders) ? data.orders : [];
    const bOrderItems = Array.isArray(data.orderItems) ? data.orderItems : [];
    const bTransactions = Array.isArray(data.transactions) ? data.transactions : [];
    const bExpenses = Array.isArray(data.expenses) ? data.expenses : [];

    const totalRecords =
      bProducts.length +
      bCustomers.length +
      bOrders.length +
      bTransactions.length +
      bExpenses.length;

    if (totalRecords === 0) {
      return { success: false, error: "ব্যাকআপ ফাইলে কোনো ডেটা পাওয়া যায়নি" };
    }

    // Replace mode: wipe this tenant's own data first (child rows before parents).
    if (mode === "replace") {
      await db.delete(transactions).where(eq(transactions.userId, user.userId));
      const ownOrderIds = db.select({ id: orders.id }).from(orders).where(eq(orders.userId, user.userId));
      await db.delete(orderItems).where(inArray(orderItems.orderId, ownOrderIds));
      await db.delete(orders).where(eq(orders.userId, user.userId));
      await db.delete(expenses).where(eq(expenses.userId, user.userId));
      await db.delete(customers).where(eq(customers.userId, user.userId));
      await db.delete(products).where(eq(products.userId, user.userId));
    }

    // Remap every id to a fresh, tenant-prefixed id so cross-tenant references are impossible.
    const customerIdMap = new Map<string, string>();
    const productIdMap = new Map<string, string>();
    const orderIdMap = new Map<string, string>();

    for (const c of bCustomers as Array<Record<string, unknown>>) {
      if (!c?.id) continue;
      customerIdMap.set(String(c.id), makeImportId("cust", user.userId, String(c.id)));
    }
    for (const p of bProducts as Array<Record<string, unknown>>) {
      if (!p?.id) continue;
      productIdMap.set(String(p.id), makeImportId("prod", user.userId, String(p.id)));
    }
    for (const o of bOrders as Array<Record<string, unknown>>) {
      if (!o?.id) continue;
      orderIdMap.set(String(o.id), makeImportId("ord", user.userId, String(o.id)));
    }

    // In merge mode, skip customers whose phone already exists for this vendor.
    const existingCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.userId));
    const existingPhones = new Set(
      existingCustomers.map((c) => c.phone).filter((p): p is string => !!p)
    );
    const skippedPhones = new Set<string>();

    // Merge mode also skips products that already exist under the same name.
    const existingProducts = await db
      .select({ name: products.name })
      .from(products)
      .where(eq(products.userId, user.userId));
    const existingProductNames = new Set(
      existingProducts.map((p) => p.name.trim().toLowerCase())
    );

    for (const c of bCustomers as Array<Record<string, unknown>>) {
      if (!c?.id || !c.name) continue;
      const phone = c.phone ? String(c.phone).trim() : null;
      if (mode === "merge" && phone && (existingPhones.has(phone) || skippedPhones.has(phone))) {
        // Drop the mapping so orders/transactions pointing here fall back to null or are skipped.
        customerIdMap.delete(String(c.id));
        continue;
      }
      if (phone) skippedPhones.add(phone);

      await db.insert(customers).values({
        id: customerIdMap.get(String(c.id))!,
        userId: user.userId,
        name: String(c.name),
        phone,
        totalDue: c.totalDue ? String(c.totalDue) : "0.00",
        createdAt: c.createdAt ? new Date(String(c.createdAt)) : new Date(),
      });
    }

    for (const p of bProducts as Array<Record<string, unknown>>) {
      if (!p?.id || !p.name || p.price === undefined) continue;
      const normalizedName = String(p.name).trim().toLowerCase();
      if (mode === "merge" && existingProductNames.has(normalizedName)) {
        productIdMap.delete(String(p.id));
        continue;
      }
      existingProductNames.add(normalizedName);
      await db.insert(products).values({
        id: productIdMap.get(String(p.id))!,
        userId: user.userId,
        name: String(p.name),
        price: String(p.price),
        isQuickAccess: p.isQuickAccess ? String(p.isQuickAccess) : "true",
        createdAt: p.createdAt ? new Date(String(p.createdAt)) : new Date(),
      });
    }

    for (const o of bOrders as Array<Record<string, unknown>>) {
      if (!o?.id || o.totalAmount === undefined) continue;
      // In merge mode a credit order belongs to a customer that was just skipped as a
      // duplicate; importing it would create an orphan walk-in sale.
      if (mode === "merge" && o.customerId && !customerIdMap.has(String(o.customerId))) {
        orderIdMap.delete(String(o.id));
        continue;
      }
      const rawStatus = String(o.status || "PAID");
      const status: "PAID" | "DUE" | "PARTIAL" =
        rawStatus === "DUE" || rawStatus === "PARTIAL" ? rawStatus : "PAID";
      await db.insert(orders).values({
        id: orderIdMap.get(String(o.id))!,
        userId: user.userId,
        customerId: o.customerId ? customerIdMap.get(String(o.customerId)) || null : null,
        totalAmount: String(o.totalAmount),
        paidAmount: String(o.paidAmount ?? "0"),
        dueAmount: String(o.dueAmount ?? "0"),
        status,
        createdAt: o.createdAt ? new Date(String(o.createdAt)) : new Date(),
      });
    }

    for (const item of bOrderItems as Array<Record<string, unknown>>) {
      if (!item?.id || !item.orderId || !item.productName) continue;
      const mappedOrderId = orderIdMap.get(String(item.orderId));
      if (!mappedOrderId) continue;
      await db.insert(orderItems).values({
        id: makeImportId("item", user.userId, String(item.id)),
        orderId: mappedOrderId,
        productId: item.productId ? productIdMap.get(String(item.productId)) || null : null,
        productName: String(item.productName),
        quantity: Number(item.quantity) || 1,
        unitPrice: String(item.unitPrice ?? "0"),
        subtotal: String(item.subtotal ?? "0"),
      });
    }

    for (const tx of bTransactions as Array<Record<string, unknown>>) {
      if (!tx?.id || !tx.customerId || !tx.type) continue;
      const mappedCustomerId = customerIdMap.get(String(tx.customerId));
      if (!mappedCustomerId) continue;
      const type = String(tx.type) === "PAYMENT" ? "PAYMENT" : "PURCHASE";
      await db.insert(transactions).values({
        id: makeImportId("tx", user.userId, String(tx.id)),
        userId: user.userId,
        customerId: mappedCustomerId,
        orderId: tx.orderId ? orderIdMap.get(String(tx.orderId)) || null : null,
        amount: String(tx.amount ?? "0"),
        type,
        note: tx.note ? String(tx.note) : null,
        createdAt: tx.createdAt ? new Date(String(tx.createdAt)) : new Date(),
      });
    }

    for (const exp of bExpenses as Array<Record<string, unknown>>) {
      if (!exp?.id || !exp.category || exp.amount === undefined) continue;
      await db.insert(expenses).values({
        id: makeImportId("exp", user.userId, String(exp.id)),
        userId: user.userId,
        category: String(exp.category),
        amount: String(exp.amount),
        note: exp.note ? String(exp.note) : null,
        createdAt: exp.createdAt ? new Date(String(exp.createdAt)) : new Date(),
      });
    }

    revalidatePath("/");
    return {
      success: true,
      imported: {
        products: bProducts.length,
        customers: bCustomers.length,
        orders: bOrders.length,
        transactions: bTransactions.length,
        expenses: bExpenses.length,
      },
    };
  } catch (err: unknown) {
    console.error("importFullBackupAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "ব্যাকআপ রিস্টোর করতে ব্যর্থ হয়েছে",
    };
  }
}

// Minimal RFC-4180-ish CSV parser: handles quoted fields, escaped quotes and CRLF.
function parseCsvRows(csv: string): string[][] {
  const text = csv.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export async function importCustomersCsvAction(csvString: string) {
  try {
    const user = await requireAuthUser();
    const rows = parseCsvRows(csvString || "");

    if (rows.length === 0) {
      return { success: false, error: "CSV ফাইল খালি" };
    }

    // Auto-detect an optional header row (Name, Phone, Due)
    const firstRow = rows[0].map((c) => c.trim().toLowerCase());
    const looksLikeHeader = firstRow.some(
      (c) => c.includes("name") || c.includes("নাম") || c.includes("phone") || c.includes("মোবাইল")
    );
    const dataRows = looksLikeHeader ? rows.slice(1) : rows;

    if (dataRows.length === 0) {
      return { success: false, error: "CSV ফাইলে কোনো কাস্টমার পাওয়া যায়নি" };
    }

    const existingCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.userId));
    const existingPhones = new Set(
      existingCustomers.map((c) => c.phone).filter((p): p is string => !!p)
    );

    let imported = 0;
    let skipped = 0;
    let invalid = 0;

    for (const row of dataRows) {
      const name = (row[0] || "").trim();
      const phoneRaw = (row[1] || "").trim();
      const dueRaw = (row[2] || "").trim();

      if (!name) {
        invalid++;
        continue;
      }

      const phone = phoneRaw ? phoneRaw.replace(/[^0-9]/g, "") : "";
      if (phone && existingPhones.has(phone)) {
        skipped++;
        continue;
      }
      if (phone) existingPhones.add(phone);

      const parsedDue = parseFloat(dueRaw.replace(/[^0-9.\-]/g, ""));
      const initialDue = Number.isFinite(parsedDue) && parsedDue > 0 ? parsedDue.toFixed(2) : "0.00";

      const customerId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await db.insert(customers).values({
        id: customerId,
        userId: user.userId,
        name,
        phone: phone || null,
        totalDue: initialDue,
      });

      if (parseFloat(initialDue) > 0) {
        await db.insert(transactions).values({
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          userId: user.userId,
          customerId,
          orderId: null,
          amount: initialDue,
          type: "PURCHASE",
          note: "CSV ইমপোর্ট থেকে পূর্বের বকেয়া (Opening Balance)",
        });
      }

      imported++;
    }

    revalidatePath("/");
    return { success: true, imported, skipped, invalid };
  } catch (err: unknown) {
    console.error("importCustomersCsvAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "কাস্টমার CSV ইমপোর্ট করতে ব্যর্থ হয়েছে",
    };
  }
}
