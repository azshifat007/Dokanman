import { Suspense } from "react";
import { getDashboardInitialData } from "@/actions/pos-actions";
import { MainApp } from "@/components/MainApp";
import { Customer, Product } from "@/types";
import { Coffee } from "lucide-react";

async function DashboardContent() {
  const data = await getDashboardInitialData();

  return (
    <MainApp
      shopName={data.shop?.shopName || "মামা টং দোকান ও টি স্টল"}
      initialStats={data.stats}
      initialProducts={data.products as unknown as Product[]}
      initialCustomers={data.customers as unknown as Customer[]}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 animate-pulse">
          <Coffee className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white">মামা টং দোকান চালু হচ্ছে...</h2>
        <p className="text-xs text-zinc-500">লোড হচ্ছে ডিজিটাল বাকির খাতা ও সেলস কাউন্টার</p>
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
