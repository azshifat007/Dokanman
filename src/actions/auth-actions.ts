"use server";

import { db } from "@/db";
import { users, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { setSessionCookie, clearSessionCookie, getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface SignupInput {
  shopName: string;
  phone: string;
  pin: string;
}

export interface LoginInput {
  phone: string;
  pin: string;
}

export async function signupAction(input: SignupInput) {
  try {
    const shopName = input.shopName?.trim();
    const phone = input.phone?.trim().replace(/[^0-9]/g, "");
    const pin = input.pin?.trim();

    if (!shopName) {
      return { success: false, error: "দোকানের নাম লিখুন (Please enter shop name)" };
    }
    if (!phone || phone.length < 10) {
      return { success: false, error: "সঠিক মোবাইল নম্বর লিখুন (Valid phone number required)" };
    }
    if (!pin || pin.length < 4) {
      return { success: false, error: "কমপক্ষে ৪ ডিজিটের পিন কোড দিন (Minimum 4-digit PIN required)" };
    }

    // Check if phone already registered
    const [existing] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    if (existing) {
      return {
        success: false,
        error: "এই নম্বরে ইতিমধ্যে একটি অ্যাকাউন্ট আছে। অনুগ্রহ করে লগইন করুন।",
      };
    }

    const pinHash = await bcrypt.hash(pin, 10);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        shopName,
        phone,
        pinHash,
      })
      .returning();

    // Auto-seed standard starter tong/shop products for this user
    const defaultProducts = [
      { id: `prod_${userId}_cha_rang`, name: "রং চা (Black Tea)", price: "8.00", isQuickAccess: "true" },
      { id: `prod_${userId}_cha_dudh`, name: "দুধ চা (Milk Tea)", price: "12.00", isQuickAccess: "true" },
      { id: `prod_${userId}_cha_malai`, name: "মালাই চা (Malai Special)", price: "25.00", isQuickAccess: "true" },
      { id: `prod_${userId}_coffee`, name: "কফি (Coffee)", price: "20.00", isQuickAccess: "true" },
      { id: `prod_${userId}_toast`, name: "টোস্ট বিস্কুট (Toast)", price: "6.00", isQuickAccess: "true" },
      { id: `prod_${userId}_kola`, name: "সবরি কলা (Banana)", price: "10.00", isQuickAccess: "true" },
      { id: `prod_${userId}_cake`, name: "পাউন্ড কেক (Cake)", price: "15.00", isQuickAccess: "true" },
      { id: `prod_${userId}_dim`, name: "ডিম সিদ্ধ (Boiled Egg)", price: "15.00", isQuickAccess: "true" },
      { id: `prod_${userId}_goldleaf`, name: "গোল্ডলিফ (Gold Leaf)", price: "18.00", isQuickAccess: "true" },
      { id: `prod_${userId}_benson`, name: "বেনসন (Benson & Hedges)", price: "20.00", isQuickAccess: "true" },
      { id: `prod_${userId}_derby`, name: "ডার্বি (Derby)", price: "9.00", isQuickAccess: "true" },
      { id: `prod_${userId}_water`, name: "মাম পানি ৫০০ মি.লি.", price: "15.00", isQuickAccess: "true" },
    ];

    for (const p of defaultProducts) {
      await db
        .insert(products)
        .values({
          ...p,
          userId: newUser.id,
        })
        .onConflictDoNothing();
    }

    // Set auth cookie
    await setSessionCookie({
      userId: newUser.id,
      phone: newUser.phone,
      shopName: newUser.shopName,
    });

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("signupAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "সাইনআপ করতে ব্যর্থ হয়েছে",
    };
  }
}

export async function loginAction(input: LoginInput) {
  try {
    const phone = input.phone?.trim().replace(/[^0-9]/g, "");
    const pin = input.pin?.trim();

    if (!phone) {
      return { success: false, error: "মোবাইল নম্বর দিন" };
    }
    if (!pin) {
      return { success: false, error: "পিন কোড দিন" };
    }

    const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    if (!user) {
      return {
        success: false,
        error: "এই নম্বরে কোনো দোকান অ্যাকাউন্ট পাওয়া যায়নি। প্রথমে সাইনআপ করুন।",
      };
    }

    const isValid = await bcrypt.compare(pin, user.pinHash);
    if (!isValid) {
      return { success: false, error: "ভুল পিন কোড! সঠিক পিন দিয়ে পুনরায় চেষ্টা করুন।" };
    }

    await setSessionCookie({
      userId: user.id,
      phone: user.phone,
      shopName: user.shopName,
    });

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("loginAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "লগইন করতে সমস্যা হয়েছে",
    };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  revalidatePath("/");
  return { success: true };
}

export async function getCurrentUserAction() {
  return await getSession();
}
