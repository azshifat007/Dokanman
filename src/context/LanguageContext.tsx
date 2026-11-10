"use client";

import React, { createContext, useContext, useState } from "react";
import { translations, Language, formatCurrency as formatCurrHelper } from "@/i18n/translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: keyof typeof translations.bn) => string;
  formatCurrency: (amount: number | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLang = "bn",
}: {
  children: React.ReactNode;
  initialLang?: Language;
}) {
  // The server reads the dokanman_lang cookie and passes it down, so the first paint
  // already matches the saved preference without a client-side effect.
  const [lang, setLangState] = useState<Language>(initialLang);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("dokanman_lang", newLang);
    document.cookie = `dokanman_lang=${newLang}; path=/; max-age=31536000`;
    document.documentElement.lang = newLang;
  };

  const toggleLang = () => {
    setLang(lang === "bn" ? "en" : "bn");
  };

  const t = (key: keyof typeof translations.bn): string => {
    return translations[lang]?.[key] || translations.bn[key] || (key as string);
  };

  const formatCurrency = (amount: number | string) => {
    return formatCurrHelper(amount, lang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
