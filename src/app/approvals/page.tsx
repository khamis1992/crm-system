"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

const TABS = ["My Approvals", "My Delegate Approvals", "All Approvals"];

export default function ApprovalsPage() {
  const [tab, setTab] = useState(TABS[0]);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-[var(--crm-border)] px-4 py-3">
        <h1 className="text-lg font-semibold">Approvals</h1>
      </div>
      <div className="flex gap-1 border-b border-[var(--crm-border)] px-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-3 py-2.5 text-sm",
              tab === t ? "border-[var(--crm-blue)] font-semibold text-[var(--crm-blue)]" : "border-transparent text-gray-500"
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <EmptyState
        illustration="✅"
        title={`No ${tab.toLowerCase()}`}
        description="Approval requests for discounts, quotes, and process rules will appear here when workflow rules are configured in Setup."
        actionLabel="Open Setup → Automation"
        actionHref="/setup"
      />
    </div>
  );
}
