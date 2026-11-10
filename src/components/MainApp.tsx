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
import { SettingsModal } from "./SettingsModal";
import { Customer, Product, DashboardStats, Expense } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { selectCustomer, items, getSubtotal } = useCartStore();
  const { t, lang, formatCurrency } = useLanguage();
  const router = useRouter();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 pb-24 lg:pb-5 space-y-4">
        {tab === "pos" ? (
          <div className="space-y-4">
            {/* Universal Search Bar (sticky only on desktop, where the header is short) */}
            <div className="lg:sticky lg:top-24 lg:z-20">
              <UniversalSearch initialCustomers={initialCustomers} />
            </div>

            {/* Primary Working Area: items first on mobile so taps are never covered */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-7 space-y-4 order-1">
                <QuickItemGrid products={initialProducts} />
              </div>

              <div
                id="cart-panel"
                className="lg:col-span-5 order-2 lg:sticky lg:top-40 scroll-mt-24"
              >
                <CartPanel />
              </div>
            </div>
          </div>
        ) : tab === "ledger" ? (
          /* Digital Ledger View */
          <div>
            <CustomerLedger
              customers={initialCustomers}
              shopName={shopName}
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
        <p>দোকানম্যান (Dokanman) — {t("footerTagline")}</p>
      </footer>

      {/* Mobile cart shortcut: keeps totals visible without covering the item grid */}
      {tab === "pos" && cartCount > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 px-3 py-2.5 flex items-center justify-between gap-3">
          <div className="text-xs text-zinc-300">
            <span className="font-bold text-white">{cartCount}</span>{" "}
            {lang === "bn" ? "টি আইটেম" : "items"} •{" "}
            <span className="font-mono font-bold text-amber-400">
              {formatCurrency(getSubtotal())}
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              document.getElementById("cart-panel")?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs font-black"
          >
            {t("viewCart")}
          </button>
        </div>
      )}

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

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        shopName={shopName}
        phone={phone}
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
