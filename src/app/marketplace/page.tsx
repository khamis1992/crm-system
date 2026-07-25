"use client";

import { useState } from "react";

const APPS = [
  { name: "MailChimp Sync", cat: "Marketing", desc: "Sync campaigns and subscribers", price: "Free" },
  { name: "Slack Notifications", cat: "Productivity", desc: "Deal alerts to Slack channels", price: "Free" },
  { name: "DocuSign", cat: "Sales", desc: "Send quotes for e-signature", price: "Paid" },
  { name: "QuickBooks", cat: "Finance", desc: "Sync invoices and payments", price: "Paid" },
  { name: "Google Meet", cat: "Meetings", desc: "Auto-create meeting links", price: "Free" },
  { name: "SMS Gateway", cat: "Channels", desc: "Send SMS from CRM records", price: "Paid" },
  { name: "LinkedIn Sales Nav", cat: "Social", desc: "Import leads from LinkedIn", price: "Paid" },
  { name: "SurveyMonkey", cat: "Feedback", desc: "NPS after closed-won", price: "Free" },
];

export default function MarketplacePage() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<typeof APPS[0] | null>(null);
  const list = APPS.filter((a) => !q || a.name.toLowerCase().includes(q.toLowerCase()) || a.cat.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Marketplace</h1>
          <p className="text-xs text-gray-500">Extensions and integrations for your CRM</p>
        </div>
        <input className="crm-input max-w-xs" placeholder="Search extensions…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((a) => (
          <button
            key={a.name}
            onClick={() => setSelected(a)}
            className="rounded border border-[var(--crm-border)] bg-white p-4 text-left hover:border-[var(--crm-blue)] hover:shadow-sm"
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-blue-50 text-lg"> ext </div>
            <div className="font-medium text-[var(--crm-blue)]">{a.name}</div>
            <div className="text-[11px] text-gray-400">{a.cat} · {a.price}</div>
            <div className="mt-1 text-xs text-gray-500">{a.desc}</div>
          </button>
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">{selected.name}</h2>
            <p className="mt-2 text-sm text-gray-600">{selected.desc}</p>
            <div className="mt-2 text-xs text-gray-400">{selected.cat} · {selected.price}</div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="crm-btn crm-btn-secondary" onClick={() => setSelected(null)}>Close</button>
              <button className="crm-btn crm-btn-primary" onClick={() => { alert(`${selected.name} installed (demo)`); setSelected(null); }}>Install</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
