"use client";

import { useState } from "react";
import { Header } from "./Header";
import { UniversalSearch } from "./UniversalSearch";
import { QuickItemGrid } from "./QuickItemGrid";
import { CartPanel } from "./CartPanel";
import { CustomerLedger } from "./CustomerLedger";
import { ExpenseTracker } from "./ExpenseTracker";
import { DailyClosingModal } from "./DailyClosingModal";
import { BackupImportExportModal } from "./BackupImportExportModal";
import { ProductCatalogModal } from "./ProductCatalogModal";
import { Customer, Product, DashboardStats, Expense } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { LanguageProvider } from "@/context/LanguageContext";
import { Language } from "@/i18n/translations";
import { useRouter } from "next/navigation";

interface MainAppProps {
  initialLang?: Language;
  shopName: string;
  phone?: string;
  initialStats: DashboardStats;
  initialProducts: Product[];
  initialCustomers: Customer[];
  initialExpenses: Expense[];
}

function MainAppContent({
  shopName,
  phone,
  initialStats,
  initialProducts,
  initialCustomers,
  initialExpenses,
}: MainAppProps) {
  const [tab, setTab] = useState<"pos" | "ledger" | "expenses">("pos");
  const [isDailySlipOpen, setIsDailySlipOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
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
      {/* Persistent Global Header */}
      <Header
        shopName={shopName}
        phone={phone}
        stats={initialStats}
        currentTab={tab}
        onTabChange={(newTab) => setTab(newTab)}
        onOpenDailySlip={() => setIsDailySlipOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenProducts={() => setIsProductsOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {tab === "pos" ? (
          <div className="space-y-4">
            {/* Universal Search Bar (Sticky Top) */}
            <div className="sticky top-24 z-20">
              <UniversalSearch initialCustomers={initialCustomers} />
            </div>

            {/* Primary Working Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Panel: Quick Items Grid */}
              <div className="lg:col-span-7 space-y-4 order-2 lg:order-1">
                <QuickItemGrid products={initialProducts} />
              </div>

              {/* Right Panel: Cart & Settlement */}
              <div className="lg:col-span-5 order-1 lg:order-2 sticky top-40">
                <CartPanel />
              </div>
            </div>
          </div>
        ) : tab === "ledger" ? (
          /* Digital Ledger View */
          <div>
            <CustomerLedger
              customers={initialCustomers}
              onOpenCartForCustomer={handleOpenCartForCustomer}
              onRefresh={handleRefresh}
            />
          </div>
        ) : (
          /* Expenses View */
          <div>
            <ExpenseTracker
              initialExpenses={initialExpenses}
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

      {/* Modals */}
      <DailyClosingModal
        isOpen={isDailySlipOpen}
        onClose={() => setIsDailySlipOpen(false)}
        shopName={shopName}
        stats={initialStats}
      />

      <BackupImportExportModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        shopName={shopName}
        onRefresh={handleRefresh}
      />

      <ProductCatalogModal
        isOpen={isProductsOpen}
        onClose={() => setIsProductsOpen(false)}
        products={initialProducts}
        onRefresh={handleRefresh}
      />
    </div>
  );
}

export function MainApp({ initialLang, ...props }: MainAppProps) {
  return (
    <LanguageProvider initialLang={initialLang}>
      <MainAppContent {...props} />
    </LanguageProvider>
  );
}
