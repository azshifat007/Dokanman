# AGENT.MD — Technical Specification & Blueprint
## Project Name: Dokanman (দোকান Management Web App)

---

## 1. Project Overview & Vision

**Dokanman** is a mobile-first, high-performance web app designed specifically for local Bangladeshi "Tong" (tea/snack stall) vendors. 

### Core Requirements:
* **Target Users:** Non-technical local stall owners needing lightning-fast record-keeping.
* **Primary Problem:** High volume of small transactions and managing individual customer credit/loans ("বাকি" - Bakhi).
* **Core Philosophy:** **Sub-second interaction.** Paper-notebook replacement UI. Big touch targets, keyboard/barcode support, minimal typing required.
* **Tech Stack:**
  * **Framework:** Next.js (App Router, Server Actions, RSC)
  * **Database:** Neon PostgreSQL (Serverless)
  * **ORM:** Drizzle ORM
  * **Styling:** Tailwind CSS + Shadcn UI
  * **State Management:** Zustand (for real-time cart and quick action state)
  * **Auth:** NextAuth.js (Credentials/PIN-based or Mobile OTP)
  * **PWA:** Next-PWA for home-screen installation and fast caching.

---

## 2. Core Functional Requirements

### A. Universal Search & Quick Action Bar (Top Priority Feature)
* **Real-time Filter:** Search customers by Name, Phone Number, or last ordered items.
* **Search-to-Select Logic:**
  * Existing customer selection opens active session cart instantly.
  * If customer doesn't exist, provide an inline **"Create New Customer (+)"** button without breaking the billing flow.
* **Quick Item Grid:** Display a persistent grid of top-selling preset items (e.g., "চা - ৳10", "টোস্ট - ৳6", "কফি - ৳20", "সিগারেট - ৳18"). Tapping an item immediately increments the total in the active cart.

### B. Cart & Instant Billing Engine
* **Dynamic Cart:** Supports quantity increment/decrement, dynamic custom pricing, and item notes.
* **Instant Calculation:** Real-time calculation of subtotal, previous balance, and combined new balance.
* **Payment Toggles:**
  * **Paid (নগদ/বিকাশ):** Marks order as paid, records cash entry.
  * **Unpaid (বাকি):** Adds entire bill amount to customer's active due ledger (`total_due`).
  * **Partial Paid (আংশিক):** Accepts a paid amount, routes the remaining balance to `total_due`.

### C. Digital Ledger System (বাকির খাতা)
* **Customer Profile & History:** Detailed audit trail of purchases, partial payments, and total unpaid debt.
* **Payment Settlement:** Instant payment entry that subtracts from the customer's aggregate `total_due`.
* **Quick Reminders:** UI button to generate SMS/WhatsApp payment reminder link.

---

## 3. Database Architecture (Drizzle ORM Schema)

```typescript
// src/db/schema.ts
import { pgTable, text, timestamp, decimal, integer, pgEnum } from "drizzle-orm/pg-core";

export const paymentStatusEnum = pgEnum("payment_status", ["PAID", "DUE", "PARTIAL"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["PURCHASE", "PAYMENT"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  shopName: text("shop_name").notNull(),
  phone: text("phone").notNull().unique(),
  pinHash: text("pin_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone"),
  totalDue: decimal("total_due", { precision: 12, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isQuickAccess: text("is_quick_access").default("true").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull(),
  dueAmount: decimal("due_amount", { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  orderId: text("order_id").references(() => orders.id, { onDelete: "set null" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

## 4. Key Server Actions & API Specifications

### `createOrderAction(payload)`
* **Input:** `customerId?`, `items: [{ productId, productName, quantity, unitPrice }]`, `paidAmount`, `dueAmount`
* **Execution Flow:**
  1. Calculate total order amount.
  2. Insert record in `orders` table.
  3. Bulk insert items into `order_items`.
  4. If `dueAmount > 0` and `customerId` exists:
     * Increment `customers.totalDue` by `dueAmount`.
     * Insert record in `transactions` with type `PURCHASE`.
  5. Revalidate cache tags (`revalidateTag('dashboard')`, `revalidateTag('customers')`).

### `settleCustomerDueAction(payload)`
* **Input:** `customerId`, `amountPaid`, `note`
* **Execution Flow:**
  1. Fetch customer's current `totalDue`.
  2. Decrement `totalDue` by `amountPaid`.
  3. Insert record into `transactions` with type `PAYMENT`.
  4. Return remaining balance.

---

## 5. User Experience & UI Specifications

### Layout Architecture (`/dashboard`)
1. **Header Zone:** Shop Name, Quick Financial Summary (Today's Cash Collection vs. Today's Due).
2. **Universal Search Bar (Sticky Top):**
   * Command Palette UI (`cmdk` or custom inputs) with instant fuzzy matching.
3. **Primary Working Area (Split View on Desktop / Tabbed View on Mobile):**
   * **Left Panel:** Preset Quick-Tap Items Grid (`Tea`, `Coffee`, `Toast`, `Cigarette`). Tapping directly modifies active cart.
   * **Right Panel:** Cart & Transaction Settlement Card.
     * Selected Customer Details & Previous Due indicator.
     * Itemized List with dynamic quantity controls (+/-).
     * Quick payment buttons: **[ক্যাশ পরিশোধ]** (Green), **[সম্পূর্ণ বাকি]** (Red), **[আংশিক জমা]** (Yellow).

---

## 6. Implementation Roadmap for AI Agents

1. **Phase 1: Environment & Schema Setup**
   * Set up Next.js App Router, Tailwind CSS, Shadcn UI components.
   * Connect Neon database via `@neondatabase/serverless` and Drizzle ORM.
   * Run initial schema migrations.

2. **Phase 2: Core POS & Universal Search Engine**
   * Build optimistic client-side Zustand store for cart management.
   * Implement Server Action for instant user search using PostgreSQL `ILIKE` or `pg_trgm`.

3. **Phase 3: Ledger & Due Management**
   * Build customer profile view (`/customers/[id]`).
   * Implement `settleCustomerDueAction` and render full transaction ledger.

4. **Phase 4: Mobile Optimization & PWA**
   * Add manifest file, icons, and offline fallback strategy using Service Workers.
   * Fine-tune UI element sizing for single-thumb mobile usage.
