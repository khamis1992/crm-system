"use client";

import {
  Bell,
  HelpCircle,
  Plus,
  Search,
  Settings,
  Grid3X3,
  Keyboard,
  BookOpen,
  ExternalLink,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MODULES } from "@/lib/modules";
import { Dropdown } from "@/components/ui/Dropdown";
import { useEffect, useState } from "react";
import { ComposeEmailModal, LogCallModal } from "@/components/modals/CrmModals";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/lib/currency-context";
import { supabase } from "@/lib/supabase";
import { Modal } from "@/components/ui/Modal";

type SearchHit = { module: string; href: string; title: string; subtitle?: string };

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { displayName, email, signOut } = useAuth();
  const { toast } = useToast();
  const { currency } = useCurrency();
  const mod =
    MODULES.find(
      (m) => m.href !== "/" && (pathname === m.href || pathname.startsWith(m.href + "/"))
    ) || MODULES[0];

  const [emailOpen, setEmailOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [showHits, setShowHits] = useState(false);
  const [notifs, setNotifs] = useState<{ id: string; text: string }[]>([]);

  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const createItems = MODULES.filter((m) => m.createLabel).map((m) => ({
    label: m.createLabel!,
    href: `${m.href}/new`,
  }));

  useEffect(() => {
    supabase
      .from("activities")
      .select("id, subject, body")
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setNotifs(
          (data || []).map((a) => ({
            id: a.id,
            text: a.subject || a.body || "Activity",
          }))
        );
      });
  }, []);

  async function runGlobalSearch(query: string) {
    if (!query.trim()) {
      setHits([]);
      return;
    }
    setSearching(true);
    const s = query.trim();
    const results: SearchHit[] = [];

    const [leads, contacts, accounts, deals, tasks] = await Promise.all([
      supabase.from("leads").select("id, first_name, last_name, company, email").or(`first_name.ilike.%${s}%,last_name.ilike.%${s}%,company.ilike.%${s}%,email.ilike.%${s}%`).limit(5),
      supabase.from("contacts").select("id, first_name, last_name, email").or(`first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%`).limit(5),
      supabase.from("accounts").select("id, account_name, phone").or(`account_name.ilike.%${s}%,phone.ilike.%${s}%`).limit(5),
      supabase.from("deals").select("id, deal_name, stage, amount").or(`deal_name.ilike.%${s}%,stage.ilike.%${s}%`).limit(5),
      supabase.from("tasks").select("id, subject, status").or(`subject.ilike.%${s}%,status.ilike.%${s}%`).limit(5),
    ]);

    for (const r of leads.data || []) {
      results.push({
        module: "Leads",
        href: `/leads/${r.id}`,
        title: [r.first_name, r.last_name].filter(Boolean).join(" ") || "Lead",
        subtitle: r.company || r.email || undefined,
      });
    }
    for (const r of contacts.data || []) {
      results.push({
        module: "Contacts",
        href: `/contacts/${r.id}`,
        title: [r.first_name, r.last_name].filter(Boolean).join(" ") || "Contact",
        subtitle: r.email || undefined,
      });
    }
    for (const r of accounts.data || []) {
      results.push({
        module: "Accounts",
        href: `/accounts/${r.id}`,
        title: r.account_name,
        subtitle: r.phone || undefined,
      });
    }
    for (const r of deals.data || []) {
      results.push({
        module: "Deals",
        href: `/deals/${r.id}`,
        title: r.deal_name,
        subtitle: r.stage || undefined,
      });
    }
    for (const r of tasks.data || []) {
      results.push({
        module: "Tasks",
        href: `/tasks/${r.id}`,
        title: r.subject,
        subtitle: r.status || undefined,
      });
    }

    setHits(results);
    setSearching(false);
    setShowHits(true);
  }

  async function handleSignOut() {
    await signOut();
    toast("Signed out", "info");
    router.push("/login");
  }

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

        <div className="relative flex max-w-md flex-1 items-center px-6">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search CRM (Enter)"
              className="w-full rounded-full border border-[var(--crm-border)] bg-[var(--crm-bg)] py-1.5 pl-9 pr-8 text-xs outline-none focus:border-[var(--crm-blue)] focus:bg-white"
              onFocus={() => hits.length && setShowHits(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runGlobalSearch(q);
                if (e.key === "Escape") setShowHits(false);
              }}
            />
            {q && (
              <button
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setQ("");
                  setHits([]);
                  setShowHits(false);
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          {showHits && (
            <div className="absolute left-6 right-6 top-10 z-50 max-h-80 overflow-auto rounded border border-[var(--crm-border)] bg-white shadow-lg">
              {searching && <div className="p-3 text-xs text-gray-400">Searching…</div>}
              {!searching && hits.length === 0 && (
                <div className="p-3 text-xs text-gray-400">No results for “{q}”</div>
              )}
              {hits.map((h, i) => (
                <button
                  key={i}
                  className="flex w-full flex-col gap-0.5 border-b border-gray-50 px-3 py-2 text-left hover:bg-blue-50"
                  onClick={() => {
                    setShowHits(false);
                    router.push(h.href);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[var(--crm-blue)]">{h.title}</span>
                    <span className="text-[10px] text-gray-400">{h.module}</span>
                  </div>
                  {h.subtitle && <span className="text-[11px] text-gray-500">{h.subtitle}</span>}
                </button>
              ))}
            </div>
          )}
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
              {notifs.length > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 z-50 mt-1 w-80 rounded border border-[var(--crm-border)] bg-white shadow-lg">
                <div className="border-b px-3 py-2 text-sm font-semibold">Notifications</div>
                <div className="max-h-64 overflow-auto p-2 text-xs text-gray-600">
                  {notifs.length === 0 && (
                    <div className="p-3 text-center text-gray-400">No notifications</div>
                  )}
                  {notifs.map((n) => (
                    <div key={n.id} className="rounded p-2 hover:bg-gray-50">
                      {n.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            className="rounded p-2 text-gray-500 hover:bg-gray-100"
            title="Help"
            onClick={() => setHelpOpen(true)}
          >
            <HelpCircle size={16} />
          </button>
          <Link
            href="/setup/company"
            className="rounded px-2 py-1 text-[11px] font-semibold text-[var(--crm-blue)] hover:bg-blue-50"
            title="System currency — change in Setup → Company"
          >
            {currency}
          </Link>
          <Link href="/setup" className="rounded p-2 text-gray-500 hover:bg-gray-100">
            <Settings size={16} />
          </Link>
          <Dropdown
            trigger={
              <div className="ml-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-semibold text-white">
                {initials || "U"}
              </div>
            }
            items={[
              { label: displayName, disabled: true },
              ...(email ? [{ label: email, disabled: true }] : []),
              { label: "My Preferences", href: "/setup/users" },
              { label: "My Jobs", href: "/my-jobs" },
              { divider: true, label: "" },
              { label: "Sign out", onClick: handleSignOut },
            ]}
          />
        </div>
      </header>

      <ComposeEmailModal open={emailOpen} onClose={() => setEmailOpen(false)} />
      <LogCallModal open={callOpen} onClose={() => setCallOpen(false)} />

      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Help & Resources" width="md">
        <div className="space-y-3 text-sm">
          <a
            href="https://supabase.com/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded border px-3 py-2 hover:bg-gray-50"
          >
            <BookOpen size={16} className="text-[var(--crm-blue)]" />
            Supabase Documentation
            <ExternalLink size={12} className="ml-auto text-gray-400" />
          </a>
          <div className="rounded border px-3 py-2">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <Keyboard size={16} className="text-[var(--crm-blue)]" /> Keyboard shortcuts
            </div>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>
                <kbd className="rounded bg-gray-100 px-1">Enter</kbd> in search — global search
              </li>
              <li>
                <kbd className="rounded bg-gray-100 px-1">Esc</kbd> — close panels / search
              </li>
            </ul>
          </div>
          <div className="rounded border bg-gray-50 px-3 py-2 text-xs text-gray-500">
            CRM system · Supabase backend · Schema <code>zcrm</code>
          </div>
        </div>
      </Modal>
    </>
  );
}
