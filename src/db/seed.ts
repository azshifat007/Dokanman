import { db } from "./index";
import { users, products, customers, orders, orderItems, transactions } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function seed() {
  console.log("Seeding Dokanman database...");

  const existingUsers = await db.select().from(users);
  let defaultUser = existingUsers[0];

  if (!defaultUser) {
    const pinHash = await bcrypt.hash("1234", 10);
    const [created] = await db
      .insert(users)
      .values({
        id: "usr_tong_mama_01",
        shopName: "মামা টং দোকান ও টি স্টল",
        phone: "01700000000",
        pinHash,
      })
      .returning();
    defaultUser = created;
    console.log("Created default vendor user:", defaultUser.shopName);
  } else {
    console.log("Using existing vendor user:", defaultUser.shopName);
  }

  const userId = defaultUser.id;

  // Initial Products (Tong Specials)
  const defaultProducts = [
    { id: "prod_cha_rang", name: "রং চা (Black Tea)", price: "8.00", isQuickAccess: "true" },
    { id: "prod_cha_dudh", name: "দুধ চা (Milk Tea)", price: "12.00", isQuickAccess: "true" },
    { id: "prod_cha_malai", name: "মালাই চা (Malai Special)", price: "25.00", isQuickAccess: "true" },
    { id: "prod_coffee", name: "কফি (Coffee)", price: "20.00", isQuickAccess: "true" },
    { id: "prod_toast", name: "টোস্ট বিস্কুট (Toast)", price: "6.00", isQuickAccess: "true" },
    { id: "prod_kola", name: "সবরি কলা (Banana)", price: "10.00", isQuickAccess: "true" },
    { id: "prod_cake", name: "পাউন্ড কেক (Cake)", price: "15.00", isQuickAccess: "true" },
    { id: "prod_dim_shiddho", name: "ডিম সিদ্ধ (Boiled Egg)", price: "15.00", isQuickAccess: "true" },
    { id: "prod_goldleaf", name: "গোল্ডলিফ (Gold Leaf)", price: "18.00", isQuickAccess: "true" },
    { id: "prod_benson", name: "বেনসন (Benson & Hedges)", price: "20.00", isQuickAccess: "true" },
    { id: "prod_derby", name: "ডার্বি (Derby)", price: "9.00", isQuickAccess: "true" },
    { id: "prod_water_500", name: "মাম পানি ৫০০ মি.লি.", price: "15.00", isQuickAccess: "true" },
  ];

  for (const prod of defaultProducts) {
    await db
      .insert(products)
      .values({
        ...prod,
        userId,
      })
      .onConflictDoNothing();
  }
  console.log("Default quick access products seeded.");

  // Sample Customers with Bakhi (Due)
  const sampleCustomers = [
    { id: "cust_karim", name: "করিম ভাই (রিকশাওয়ালা)", phone: "01711112222", totalDue: "140.00" },
    { id: "cust_rahim", name: "রাহিম (ভার্সিটি ছাত্র)", phone: "01822223333", totalDue: "320.00" },
    { id: "cust_shakil", name: "শাকিল (মেকানিক মামা)", phone: "01933334444", totalDue: "85.00" },
    { id: "cust_opu", name: "অপু ভাই (দোকানদার)", phone: "01644445555", totalDue: "560.00" },
    { id: "cust_sumon", name: "সুমন ইঞ্জিনিয়ার", phone: "01555556666", totalDue: "0.00" },
  ];

  for (const cust of sampleCustomers) {
    await db
      .insert(customers)
      .values({
        ...cust,
        userId,
      })
      .onConflictDoNothing();
  }
  console.log("Sample customers seeded.");

  // Sample historical transactions
  const [existingCust] = await db.select().from(customers).where(eq(customers.userId, userId)).limit(1);
  if (existingCust) {
    const existingTx = await db.select().from(transactions).limit(1);
    if (existingTx.length === 0) {
      const [order] = await db
        .insert(orders)
        .values({
          id: "ord_demo_01",
          userId,
          customerId: "cust_karim",
          totalAmount: "40.00",
          paidAmount: "0.00",
          dueAmount: "40.00",
          status: "DUE",
        })
        .returning();

      await db.insert(orderItems).values([
        {
          id: "item_01",
          orderId: order.id,
          productId: "prod_cha_dudh",
          productName: "দুধ চা (Milk Tea)",
          quantity: 2,
          unitPrice: "12.00",
          subtotal: "24.00",
        },
        {
          id: "item_02",
          orderId: order.id,
          productId: "prod_toast",
          productName: "টোস্ট বিস্কুট (Toast)",
          quantity: 2,
          unitPrice: "6.00",
          subtotal: "12.00",
        },
      ]);

      await db.insert(transactions).values({
        id: "tx_demo_01",
        userId,
        customerId: "cust_karim",
        orderId: order.id,
        amount: "40.00",
        type: "PURCHASE",
        note: "২ কাপ দুধ চা ও ২ টোস্ট বাকি",
      });
      console.log("Sample order and transaction seeded.");
    }
  }

  console.log("Seeding completed successfully!");
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
