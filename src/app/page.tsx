import { Suspense } from "react";
import { cookies } from "next/headers";
import { getDashboardInitialData } from "@/actions/pos-actions";
import { MainApp } from "@/components/MainApp";
import { Customer, Product, Expense, DashboardInsights } from "@/types";
import { Language } from "@/i18n/translations";
import { Coffee } from "lucide-react";

async function DashboardContent() {
  const data = await getDashboardInitialData();
  const cookieLang = (await cookies()).get("dokanman_lang")?.value;
  const initialLang: Language = cookieLang === "en" ? "en" : "bn";

  return (
    <MainApp
      initialLang={initialLang}
      shopName={data.shop?.shopName || "মামা টং দোকান ও টি স্টল"}
      phone={data.shop?.phone}
      initialStats={data.stats}
      initialInsights={data.insights as DashboardInsights}
      initialProducts={data.products as unknown as Product[]}
      initialCustomers={data.customers as unknown as Customer[]}
      initialExpenses={(data.expenses || []) as unknown as Expense[]}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#f7f5ef] dark:bg-zinc-950 p-3 sm:p-4">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="h-14 animate-pulse rounded-2xl bg-black/[0.04] dark:bg-white/[0.04]" />
        <div className="h-24 animate-pulse rounded-2xl bg-black/[0.06] dark:bg-white/[0.06]" />
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-black/[0.04] dark:bg-white/[0.04]" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="h-64 animate-pulse rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] lg:col-span-8" />
          <div className="h-64 animate-pulse rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] lg:col-span-4" />
        </div>
      </div>
      <div className="sr-only">
        <Coffee className="h-4 w-4" />
        লোড হচ্ছে ডিজিটাল বাকির খাতা ও সেলস কাউন্টার
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
