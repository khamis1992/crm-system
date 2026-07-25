"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const categories = [
  {
    title: "General",
    items: [
      { label: "Personal Settings", href: "/setup/personal", desc: "Locale, language, appearance" },
      { label: "Company Details", href: "/setup/company", desc: "Org logo & address" },
      { label: "Calendar Preference", href: "/setup/calendar", desc: "Hours & week start" },
    ],
  },
  {
    title: "Customization",
    items: [
      { label: "Modules and Fields", href: "/setup/modules-fields", desc: "Manage modules, fields & layouts" },
      { label: "Layouts", href: "/setup/layouts", desc: "Page layouts per module" },
      { label: "Customize Home", href: "/setup/home", desc: "Dashboard widgets" },
      { label: "Customize Detail Page", href: "/setup/detail-page", desc: "Related lists & buttons" },
      { label: "Customize Buttons", href: "/setup/buttons", desc: "List & form buttons" },
      { label: "Pipelines", href: "/setup/pipelines", desc: "Deal pipelines" },
      { label: "Stages", href: "/setup/stages", desc: "Lead status & deal stages" },
      { label: "Templates", href: "/setup/templates", desc: "Email & inventory templates" },
    ],
  },
  {
    title: "Users and Control",
    items: [
      { label: "Users", href: "/setup/users", desc: "Invite and manage users" },
      { label: "Roles", href: "/setup/roles", desc: "Role hierarchy" },
      { label: "Profiles", href: "/setup/profiles", desc: "Permission profiles" },
      { label: "Data Sharing", href: "/setup/sharing", desc: "Org-wide defaults" },
      { label: "Territories", href: "/setup/territories", desc: "Territory hierarchy" },
      { label: "Compliance", href: "/setup/compliance", desc: "HIPAA, TFA" },
    ],
  },
  {
    title: "Channels",
    items: [
      { label: "All Channels", href: "/setup/channels", desc: "Email, chat, messaging, portals" },
      { label: "Email Configuration", href: "/setup/email", desc: "Org emails & BCC dropbox" },
      { label: "Calendar Booking", href: "/setup/calendar-booking", desc: "Booking pages" },
    ],
  },
  {
    title: "Automation",
    items: [
      { label: "Cadences", href: "/setup/cadences", desc: "Sales engagement sequences" },
      { label: "Workflow Rules", href: "/setup/workflows", desc: "Triggers & 12 action types" },
      { label: "Blueprint", href: "/setup/blueprint", desc: "Guided processes" },
    ],
  },
  {
    title: "Data Administration",
    items: [
      { label: "My Jobs", href: "/my-jobs", desc: "Import / export jobs" },
      { label: "Recycle Bin", href: "/setup/recycle-bin", desc: "Restore deleted records" },
      { label: "Audit Log", href: "/setup/audit-log", desc: "Security audit trail" },
      { label: "Storage", href: "/setup/storage", desc: "File storage usage" },
      { label: "Screenshot Map", href: "/screens", desc: "All 921 images → live routes" },
      { label: "Marketplace", href: "/marketplace", desc: "Extensions catalog" },
    ],
  },
];

export default function SetupPage() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return categories;
    const s = q.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (i) => i.label.toLowerCase().includes(s) || i.desc.toLowerCase().includes(s)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [q]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Setup</h1>
        <p className="text-sm text-gray-500">Search settings or browse categories</p>
        <input
          className="crm-input mt-3 max-w-md"
          placeholder="Search Setup…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="space-y-8">
        {filtered.length === 0 && (
          <div className="text-sm text-gray-400">No settings match “{q}”</div>
        )}
        {filtered.map((cat) => (
          <div key={cat.title}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">{cat.title}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cat.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded border border-[var(--crm-border)] bg-white p-4 hover:border-[var(--crm-blue)] hover:shadow-sm"
                >
                  <div className="font-medium text-[var(--crm-blue)]">{item.label}</div>
                  <div className="mt-1 text-xs text-gray-500">{item.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
