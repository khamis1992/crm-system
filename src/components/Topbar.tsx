"use client";

import {
  Bell,
  HelpCircle,
  Plus,
  Search,
  Settings,
  Grid3X3,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULES } from "@/lib/modules";
import { Dropdown } from "@/components/ui/Dropdown";
import { useState } from "react";
import {
  ComposeEmailModal,
  LogCallModal,
} from "@/components/modals/CrmModals";

export function Topbar() {
  const pathname = usePathname();
  const mod =
    MODULES.find(
      (m) =>
        m.href !== "/" &&
        (pathname === m.href || pathname.startsWith(m.href + "/"))
    ) || MODULES[0];

  const [emailOpen, setEmailOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const createItems = MODULES.filter((m) => m.createLabel).map((m) => ({
    label: m.createLabel!,
    href: `${m.href}/new`,
  }));

  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--crm-border)] bg-white px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[var(--crm-blue)] text-[11px] font-bold text-white">
              CRM
            </div>
            <span className="text-sm font-semibold text-[var(--crm-text)]">{mod.label}</span>
          </div>
        </div>

        <div className="flex max-w-md flex-1 items-center px-6">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              placeholder="Search CRM (Ctrl+K)"
              className="w-full rounded-full border border-[var(--crm-border)] bg-[var(--crm-bg)] py-1.5 pl-9 pr-3 text-xs outline-none focus:border-[var(--crm-blue)] focus:bg-white"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = (e.target as HTMLInputElement).value;
                  if (q) window.location.href = `/leads?q=${encodeURIComponent(q)}`;
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Dropdown
            trigger={
              <button className="crm-btn crm-btn-primary mr-2 !py-1.5 !text-xs">
                <Plus size={14} />
                {mod.createLabel || "Create"}
              </button>
            }
            items={[
              ...createItems.slice(0, 12),
              { divider: true, label: "" },
              { label: "Compose Email", onClick: () => setEmailOpen(true) },
              { label: "Log a Call", onClick: () => setCallOpen(true) },
            ]}
          />
          <Dropdown
            trigger={
              <button className="rounded p-2 text-gray-500 hover:bg-gray-100">
                <Grid3X3 size={16} />
              </button>
            }
            items={[
              { label: "CRM Home", href: "/" },
              { label: "My Jobs", href: "/my-jobs" },
              { label: "Approvals", href: "/approvals" },
              { label: "Sheets", href: "/sheets" },
              { label: "Setup", href: "/setup" },
            ]}
          />
          <div className="relative">
            <button
              className="rounded p-2 text-gray-500 hover:bg-gray-100"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell size={16} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 z-50 mt-1 w-80 rounded border border-[var(--crm-border)] bg-white shadow-lg">
                <div className="border-b px-3 py-2 text-sm font-semibold">Notifications</div>
                <div className="max-h-64 overflow-auto p-2 text-xs text-gray-600">
                  <div className="rounded p-2 hover:bg-gray-50">Deal Closed Won — Stark Fleet Deal</div>
                  <div className="rounded p-2 hover:bg-gray-50">New lead assigned — NovaSoft</div>
                  <div className="rounded p-2 hover:bg-gray-50">Task due today — Update forecast numbers</div>
                </div>
              </div>
            )}
          </div>
          <button className="rounded p-2 text-gray-500 hover:bg-gray-100" title="Help">
            <HelpCircle size={16} />
          </button>
          <Link href="/setup" className="rounded p-2 text-gray-500 hover:bg-gray-100">
            <Settings size={16} />
          </Link>
          <Dropdown
            trigger={
              <div className="ml-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-semibold text-white">
                DU
              </div>
            }
            items={[
              { label: "Demo User", disabled: true },
              { label: "My Preferences", href: "/setup/users" },
              { label: "My Jobs", href: "/my-jobs" },
              { divider: true, label: "" },
              { label: "Sign out", onClick: () => alert("Demo mode — no auth session") },
            ]}
          />
        </div>
      </header>
      <ComposeEmailModal open={emailOpen} onClose={() => setEmailOpen(false)} />
      <LogCallModal open={callOpen} onClose={() => setCallOpen(false)} />
    </>
  );
}
