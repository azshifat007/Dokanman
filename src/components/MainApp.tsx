"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { Dashboard } from "./Dashboard";
import { UniversalSearch } from "./UniversalSearch";
import { QuickItemGrid } from "./QuickItemGrid";
import { CartPanel } from "./CartPanel";
import { CustomerLedger } from "./CustomerLedger";
import { ExpenseTracker } from "./ExpenseTracker";
import { DailyClosingModal } from "./DailyClosingModal";
import { BackupImportExportModal } from "./BackupImportExportModal";
import { ProductCatalogModal } from "./ProductCatalogModal";
import { SettingsModal } from "./SettingsModal";
import { SettleDueModal } from "./SettleDueModal";
import { logoutAction } from "@/actions/auth-actions";
import { AppTab, Customer, Product, DashboardStats, DashboardInsights, Expense } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { Language } from "@/i18n/translations";

interface MainAppProps {
  initialLang?: Language;
  shopName: string;
  phone?: string;
  initialStats: DashboardStats;
  initialInsights: DashboardInsights;
  initialProducts: Product[];
  initialCustomers: Customer[];
  initialExpenses: Expense[];
}

const TAB_ORDER: AppTab[] = ["dashboard", "pos", "ledger", "expenses"];

function MainAppContent({
  shopName,
  phone,
  initialStats,
  initialInsights,
  initialProducts,
  initialCustomers,
  initialExpenses,
}: MainAppProps) {
  const [tab, setTab] = useState<AppTab>("dashboard");
  const [isDailySlipOpen, setIsDailySlipOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settleCustomer, setSettleCustomer] = useState<Customer | null>(null);
  const { selectCustomer, items, getSubtotal } = useCartStore();
  const { lang, t, formatCurrency } = useLanguage();
  const router = useRouter();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleOpenCartForCustomer = (customer: Customer) => {
    selectCustomer(customer);
    setTab("pos");
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const handleCollectDue = (customerId: string) => {
    const customer = initialCustomers.find((entry) => entry.id === customerId);
    if (customer) setSettleCustomer(customer);
  };

  const handleLogout = async () => {
    if (
      confirm(
        lang === "bn" ? "আপনি কি দোকান থেকে লগআউট করতে চান?" : "Are you sure you want to log out?"
      )
    ) {
      await logoutAction();
      router.push("/login");
      router.refresh();
    }
  };

  // Keyboard shortcuts keep the counter usable without reaching for the mouse.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (isTyping) return;

      if (event.key === "/") {
        const search = document.getElementById("customer-search");
        if (search) {
          event.preventDefault();
          search.focus();
        }
        return;
      }

      if (event.altKey && !event.ctrlKey && !event.metaKey) {
        const index = Number(event.key) - 1;
        if (index >= 0 && index < TAB_ORDER.length) {
          event.preventDefault();
          setTab(TAB_ORDER[index]);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-sans text-white selection:bg-amber-500 selection:text-black">
      <Header
        shopName={shopName}
        phone={phone}
        stats={initialStats}
        currentTab={tab}
        onTabChange={setTab}
        onOpenDailySlip={() => setIsDailySlipOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenProducts={() => setIsProductsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-3 py-3 pb-32 sm:px-4 sm:py-4 lg:pb-6">
        <div key={tab} className="animate-fade">
          {tab === "dashboard" ? (
            <Dashboard
              shopName={shopName}
              stats={initialStats}
              insights={initialInsights}
              customers={initialCustomers}
              onNavigate={setTab}
              onCollectDue={handleCollectDue}
              onOpenDailySlip={() => setIsDailySlipOpen(true)}
              onOpenBackup={() => setIsBackupOpen(true)}
              onOpenProducts={() => setIsProductsOpen(true)}
            />
          ) : tab === "pos" ? (
            <div className="space-y-4">
              <div className="lg:sticky lg:top-[124px] lg:z-20">
                <UniversalSearch initialCustomers={initialCustomers} />
              </div>

              {/* Items come first on mobile so the cart never covers a tap target. */}
              <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
                <div className="order-1 space-y-4 lg:col-span-7">
                  <QuickItemGrid products={initialProducts} />
                </div>

                <div
                  id="cart-panel"
                  className="order-2 scroll-mt-28 lg:sticky lg:top-[196px] lg:col-span-5"
                >
                  <CartPanel />
                </div>
              </div>
            </div>
          ) : tab === "ledger" ? (
            <CustomerLedger
              customers={initialCustomers}
              shopName={shopName}
              onOpenCartForCustomer={handleOpenCartForCustomer}
              onRefresh={handleRefresh}
            />
          ) : (
            <ExpenseTracker initialExpenses={initialExpenses} onRefresh={handleRefresh} />
          )}
        </div>
      </main>

      <footer className="px-4 pb-28 pt-2 text-center text-[11px] text-zinc-600 md:pb-6">
        <p>দোকানম্যান (Dokanman) — {t("footerTagline")}</p>
      </footer>

      {/* Mobile cart shortcut, parked above the bottom navigation */}
      {tab === "pos" && cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(58px+env(safe-area-inset-bottom))] z-30 flex items-center justify-between gap-3 border-t border-white/10 bg-zinc-900/95 px-3 py-2 backdrop-blur lg:hidden">
          <div className="text-xs text-zinc-300">
            <span className="font-bold text-white">{cartCount}</span>{" "}
            {lang === "bn" ? "টি আইটেম" : "items"} •{" "}
            <span className="font-mono font-bold text-amber-400">
              {formatCurrency(getSubtotal())}
            </span>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById("cart-panel")?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-zinc-950 active:scale-[0.98]"
          >
            {t("viewCart")}
          </button>
        </div>
      )}

      <MobileNav
        currentTab={tab}
        onTabChange={setTab}
        onOpenProducts={() => setIsProductsOpen(true)}
        onOpenDailySlip={() => setIsDailySlipOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

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

      <SettleDueModal
        customer={settleCustomer}
        isOpen={!!settleCustomer}
        onClose={() => setSettleCustomer(null)}
        onSuccess={() => {
          setSettleCustomer(null);
          router.refresh();
        }}
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
