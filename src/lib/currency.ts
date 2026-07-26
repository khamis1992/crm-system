/** App currency configuration — default QAR (Qatar) */

export type CurrencyCode = "QAR" | "USD" | "EUR" | "GBP" | "SAR" | "AED" | "KWD" | "BHD" | "OMR" | "EGP";

export type CurrencyOption = {
  code: CurrencyCode;
  label: string;
  symbol: string;
  locale: string;
};

export const CURRENCIES: CurrencyOption[] = [
  { code: "QAR", label: "Qatari Riyal (QAR)", symbol: "QR", locale: "en-QA" },
  { code: "USD", label: "US Dollar (USD)", symbol: "$", locale: "en-US" },
  { code: "EUR", label: "Euro (EUR)", symbol: "€", locale: "en-EU" },
  { code: "GBP", label: "British Pound (GBP)", symbol: "£", locale: "en-GB" },
  { code: "SAR", label: "Saudi Riyal (SAR)", symbol: "SR", locale: "en-SA" },
  { code: "AED", label: "UAE Dirham (AED)", symbol: "AED", locale: "en-AE" },
  { code: "KWD", label: "Kuwaiti Dinar (KWD)", symbol: "KD", locale: "en-KW" },
  { code: "BHD", label: "Bahraini Dinar (BHD)", symbol: "BD", locale: "en-BH" },
  { code: "OMR", label: "Omani Rial (OMR)", symbol: "OMR", locale: "en-OM" },
  { code: "EGP", label: "Egyptian Pound (EGP)", symbol: "E£", locale: "en-EG" },
];

export const DEFAULT_CURRENCY: CurrencyCode = "QAR";
export const CURRENCY_STORAGE_KEY = "crm-currency";

let currentCode: CurrencyCode = DEFAULT_CURRENCY;

export function getCurrencyCode(): CurrencyCode {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null;
      if (saved && CURRENCIES.some((c) => c.code === saved)) {
        currentCode = saved;
      }
    } catch {
      /* ignore */
    }
  }
  return currentCode;
}

export function setCurrencyCode(code: CurrencyCode) {
  currentCode = code;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, code);
      window.dispatchEvent(new CustomEvent("crm-currency-changed", { detail: code }));
    } catch {
      /* ignore */
    }
  }
}

export function getCurrencyOption(code?: CurrencyCode): CurrencyOption {
  const c = code || getCurrencyCode();
  return CURRENCIES.find((x) => x.code === c) || CURRENCIES[0];
}

export function formatMoneyValue(n: number | null | undefined, code?: CurrencyCode) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  const opt = getCurrencyOption(code);
  try {
    return new Intl.NumberFormat(opt.locale, {
      style: "currency",
      currency: opt.code,
      maximumFractionDigits: opt.code === "KWD" || opt.code === "BHD" || opt.code === "OMR" ? 3 : 2,
      minimumFractionDigits: 0,
    }).format(Number(n));
  } catch {
    return `${opt.symbol} ${Number(n).toLocaleString()}`;
  }
}
