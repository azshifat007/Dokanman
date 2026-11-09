"use client";

import { useState } from "react";
import { Header } from "./Header";
import { UniversalSearch } from "./UniversalSearch";
import { QuickItemGrid } from "./QuickItemGrid";
import { CartPanel } from "./CartPanel";
import { CustomerLedger } from "./CustomerLedger";
import { Customer, Product, DashboardStats } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";

interface MainAppProps {
  shopName: string;
  initialStats: DashboardStats;
  initialProducts: Product[];
  initialCustomers: Customer[];
}

export function MainApp({
  shopName,
  initialStats,
  initialProducts,
  initialCustomers,
}: MainAppProps) {
  const [tab, setTab] = useState<"pos" | "ledger">("pos");
  const { selectCustomer } = useCartStore();
  const router = useRouter();

  const handleOpenCartForCustomer = (customer: Customer) => {
    selectCustomer(customer);
    setTab("pos");
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Persistent Global Header with Live Metrics */}
      <Header
        shopName={shopName}
        stats={initialStats}
        currentTab={tab}
        onTabChange={(newTab) => setTab(newTab)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {tab === "pos" ? (
          <div className="space-y-4">
            {/* Universal Search Bar (Sticky Top) */}
            <div className="sticky top-24 z-20">
              <UniversalSearch initialCustomers={initialCustomers} />
            </div>

            {/* Primary Working Area (Split View on Desktop / Stacked on Mobile) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Panel: Preset Quick-Tap Items Grid */}
              <div className="lg:col-span-7 space-y-4 order-2 lg:order-1">
                <QuickItemGrid products={initialProducts} />
              </div>

              {/* Right Panel: Cart & Transaction Settlement Card */}
              <div className="lg:col-span-5 order-1 lg:order-2 sticky top-40">
                <CartPanel />
              </div>
            </div>
          </div>
        ) : (
          /* Digital Ledger View (বাকির খাতা) */
          <div>
            <CustomerLedger
              customers={initialCustomers}
              onOpenCartForCustomer={handleOpenCartForCustomer}
              onRefresh={handleRefresh}
            />
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-zinc-900 bg-zinc-950 text-zinc-600 text-xs py-4 text-center">
        <p>
          দোকানম্যান (Dokanman) — লোকাল টং ও মুদি দোকানের দ্রুততম ডিজিটাল বাকির খাতা ও সেলস পিওএস।
        </p>
      </footer>
    </div>
  );
}
