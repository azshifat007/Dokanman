"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, UserPlus, UserCheck, X, Phone } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Customer } from "@/types";
import { NewCustomerModal } from "./NewCustomerModal";
import { useLanguage } from "@/context/LanguageContext";

interface UniversalSearchProps {
  initialCustomers: Customer[];
}

export function UniversalSearch({ initialCustomers }: UniversalSearchProps) {
  const { selectedCustomer, selectCustomer } = useCartStore();
  const { t, formatCurrency } = useLanguage();
  const [query, setQuery] = useState("");
  const [extraCustomers, setExtraCustomers] = useState<Customer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Every customer already ships with the page, so filtering happens locally with
  // zero latency; the list is capped for rendering only.
  const allCustomers = useMemo(
    () => [...extraCustomers, ...initialCustomers],
    [extraCustomers, initialCustomers]
  );

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return allCustomers.slice(0, 15);
    return allCustomers
      .filter(
        (customer) =>
          customer.name.toLowerCase().includes(trimmed) ||
          (customer.phone || "").includes(trimmed)
      )
      .slice(0, 15);
  }, [allCustomers, query]);

  const handleSelect = (customer: Customer) => {
    selectCustomer(customer);
    setIsOpen(false);
    setQuery("");
  };

  const handleClearSelected = () => {
    selectCustomer(null);
  };

  return (
    <>
      <div ref={searchRef} className="relative w-full z-30">
        {selectedCustomer ? (
          /* Active Selected Customer Pill */
          <div className="flex items-center justify-between p-2.5 sm:p-3 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-zinc-950 font-bold flex items-center justify-center text-sm shadow-xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm sm:text-base">
                    {selectedCustomer.name}
                  </span>
                  {selectedCustomer.phone && (
                    <span className="text-zinc-400 text-xs flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3" />
                      {selectedCustomer.phone}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-zinc-400">{t("totalDueLabel")}</span>
                  <span className="font-bold text-rose-400 font-mono">
                    {formatCurrency(selectedCustomer.totalDue)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClearSelected}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors border border-zinc-700"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t("changeCustomer")}</span>
            </button>
          </div>
        ) : (
          /* Search Input & Command Palette Trigger */
          <div className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                id="customer-search"
                type="text"
                value={query}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setQuery("");
                    setIsOpen(false);
                    e.currentTarget.blur();
                  }
                }}
                placeholder={t("searchCustomerPlaceholder")}
                autoComplete="off"
                className="w-full rounded-2xl border border-white/10 bg-zinc-900/80 py-3 pl-10 pr-28 text-sm text-white placeholder-zinc-500 transition-all focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="absolute right-2 flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t("newCustomerBtn")}</span>
              </button>
            </div>

            {/* Dropdown Results */}
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                <div className="p-2 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 px-3 bg-zinc-950/40">
                  <span>{t("customerList")}</span>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="text-amber-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>{t("addCustomer")}</span>
                  </button>
                </div>

                {results.length > 0 ? (
                  <div className="divide-y divide-zinc-800/60">
                    {results.map((c) => {
                      const due = parseFloat(c.totalDue || "0");
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelect(c)}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-zinc-800/80 flex items-center justify-between transition-colors group"
                        >
                          <div>
                            <div className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors">
                              {c.name}
                            </div>
                            {c.phone && (
                              <div className="text-xs text-zinc-400 font-mono">{c.phone}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
                                due > 0
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {t("dueBadge")}: {formatCurrency(due)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-sm text-zinc-400 mb-3">
                      &quot;{query}&quot; — {t("noCustomerFound")}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        setIsModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-zinc-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>
                        {t("createNamedCustomer")} &quot;{query}&quot;
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <NewCustomerModal
        isOpen={isModalOpen}
        initialQuery={query}
        onClose={() => setIsModalOpen(false)}
        onCustomerCreated={(customer) => {
          selectCustomer(customer);
          setExtraCustomers((prev) => [customer, ...prev]);
        }}
      />
    </>
  );
}
