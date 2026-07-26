"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CURRENCIES,
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  formatMoneyValue,
  getCurrencyCode,
  setCurrencyCode as persistCurrency,
  type CurrencyCode,
  type CurrencyOption,
} from "@/lib/currency";
import { getSetting, saveSetting } from "@/lib/settings";

type CurrencyContextValue = {
  currency: CurrencyCode;
  currencyOption: CurrencyOption;
  currencies: CurrencyOption[];
  setCurrency: (code: CurrencyCode) => Promise<void>;
  formatMoney: (n: number | null | undefined) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    // Ensure default QAR is stored on first visit
    if (typeof window !== "undefined" && !localStorage.getItem(CURRENCY_STORAGE_KEY)) {
      persistCurrency(DEFAULT_CURRENCY);
    }
    setCurrencyState(getCurrencyCode());
    getSetting<{ currency?: string }>("company_details", {}).then((company) => {
      const code = ((company.currency as CurrencyCode) || getCurrencyCode() || DEFAULT_CURRENCY) as CurrencyCode;
      if (CURRENCIES.some((c) => c.code === code)) {
        setCurrencyState(code);
        persistCurrency(code);
      }
    });

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<CurrencyCode>).detail;
      if (detail) setCurrencyState(detail);
    };
    window.addEventListener("crm-currency-changed", onChange);
    return () => window.removeEventListener("crm-currency-changed", onChange);
  }, []);

  const setCurrency = useCallback(async (code: CurrencyCode) => {
    setCurrencyState(code);
    persistCurrency(code);
    // Merge into company_details
    const company = await getSetting<Record<string, unknown>>("company_details", {});
    await saveSetting("company_details", { ...company, currency: code });
    // Also keep personal settings in sync if present
    try {
      const personal = JSON.parse(localStorage.getItem("crm-personal-settings") || "{}");
      personal.currency = code;
      localStorage.setItem("crm-personal-settings", JSON.stringify(personal));
      localStorage.setItem(CURRENCY_STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  const currencyOption = useMemo(
    () => CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0],
    [currency]
  );

  const formatMoney = useCallback(
    (n: number | null | undefined) => formatMoneyValue(n, currency),
    [currency]
  );

  const value = useMemo(
    () => ({
      currency,
      currencyOption,
      currencies: CURRENCIES,
      setCurrency,
      formatMoney,
    }),
    [currency, currencyOption, setCurrency, formatMoney]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
