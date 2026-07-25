"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULES } from "@/lib/modules";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [q, setQ] = useState("");

  const filtered = MODULES.filter((m) =>
    m.label.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <aside
      className={cn(
        "flex h-screen flex-col bg-[var(--crm-sidebar)] text-white transition-all duration-200 shrink-0",
        collapsed ? "w-[56px]" : "w-[220px]"
      )}
    >
      <div className="flex h-12 items-center gap-2 border-b border-white/10 px-3">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-[var(--crm-blue)] text-xs font-bold">
          Z
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">CRM</div>
            <div className="truncate text-[10px] text-white/50">Zoho-style</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {!collapsed && (
        <div className="px-2 py-2">
          <div className="relative">
            <Search size={12} className="absolute left-2 top-2.5 text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search modules"
              className="w-full rounded border-0 bg-white/10 py-1.5 pl-7 pr-2 text-xs text-white placeholder:text-white/40 outline-none focus:bg-white/15"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-1">
        {filtered.map((m) => {
          const active =
            m.href === "/"
              ? pathname === "/"
              : pathname === m.href || pathname.startsWith(m.href + "/");
          const Icon = m.icon;
          return (
            <Link
              key={m.key}
              href={m.href}
              title={m.label}
              className={cn(
                "mx-1 flex items-center gap-2.5 rounded px-2.5 py-2 text-[13px] transition-colors",
                active
                  ? "bg-[var(--crm-blue)] text-white"
                  : "text-white/75 hover:bg-[var(--crm-sidebar-hover)] hover:text-white"
              )}
            >
              <Icon size={16} className="shrink-0 opacity-90" />
              {!collapsed && <span className="truncate">{m.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="border-t border-white/10 p-3 text-[10px] text-white/40">
          Supabase · zcrm schema
        </div>
      )}
    </aside>
  );
}
