"use server";

import { db } from "@/db";
import { expenses } from "@/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { requireAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface AddExpenseInput {
  category: string;
  amount: number;
  note?: string;
}

export async function addExpenseAction(input: AddExpenseInput) {
  try {
    const user = await requireAuthUser();
    const amountNum = typeof input.amount === "string" ? parseFloat(input.amount) : input.amount;

    if (!amountNum || amountNum <= 0) {
      return { success: false, error: "সঠিক টাকার পরিমাণ লিখুন" };
    }
    if (!input.category?.trim()) {
      return { success: false, error: "খরচের খাত নির্বাচন করুন" };
    }

    const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const [created] = await db
      .insert(expenses)
      .values({
        id,
        userId: user.userId,
        category: input.category.trim(),
        amount: amountNum.toFixed(2),
        note: input.note?.trim() || null,
      })
      .returning();

    revalidatePath("/");
    return { success: true, expense: created };
  } catch (err: unknown) {
    console.error("addExpenseAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "খরচ সেভ করতে সমস্যা হয়েছে",
    };
  }
}

export async function deleteExpenseAction(id: string) {
  try {
    const user = await requireAuthUser();
    await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, user.userId)));

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("deleteExpenseAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "খরচ মুছতে ব্যর্থ হয়েছে",
    };
  }
}

export async function getExpensesAction() {
  try {
    const user = await requireAuthUser();
    const list = await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, user.userId))
      .orderBy(desc(expenses.createdAt))
      .limit(50);

    return { success: true, expenses: list };
  } catch (err: unknown) {
    console.error("getExpensesAction error:", err);
    return { success: false, expenses: [] };
  }
}
