"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/Toast";
import { CurrencyProvider, useCurrency } from "@/lib/currency-context";

function CurrencyAwareTree({ children }: { children: ReactNode }) {
  const { currency } = useCurrency();
  // Remount UI when currency changes so formatMoney() refreshes everywhere
  return <div key={currency} className="contents">{children}</div>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <ToastProvider>
          <CurrencyAwareTree>{children}</CurrencyAwareTree>
        </ToastProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
