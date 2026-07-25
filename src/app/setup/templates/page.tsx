"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const EMAIL = [
  { name: "Introduction", folder: "Public", modified: "Jul 10" },
  { name: "Follow-up", folder: "Public", modified: "Jul 12" },
  { name: "Quote attached", folder: "Personal", modified: "Jul 18" },
];
const INV = [
  { name: "Standard Quote", folder: "Quotes", modified: "Jul 1" },
  { name: "Invoice Classic", folder: "Invoices", modified: "Jul 5" },
  { name: "Sales Order", folder: "Sales Orders", modified: "Jun 28" },
];

export default function TemplatesPage() {
  const [tab, setTab] = useState<"email" | "inventory" | "mailmerge">("email");
  const [builder, setBuilder] = useState(false);

  const rows = tab === "inventory" ? INV : EMAIL;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/setup" className="rounded p-1 hover:bg-gray-100"><ArrowLeft size={18} /></Link>
          <h1 className="text-lg font-semibold">Templates</h1>
        </div>
        <button className="crm-btn crm-btn-primary" onClick={() => setBuilder(true)}>+ New Template</button>
      </div>
      <div className="flex gap-1 border-b bg-white px-4">
        {[
          ["email", "Email Templates"],
          ["inventory", "Inventory Templates"],
          ["mailmerge", "Mail Merge"],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k as typeof tab)}
            className={cn("border-b-2 px-3 py-2.5 text-sm", tab === k ? "border-[var(--crm-blue)] font-semibold text-[var(--crm-blue)]" : "border-transparent text-gray-500")}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 border-r bg-white p-3 text-xs">
          <div className="mb-2 font-semibold text-gray-400">Folders</div>
          {["All Templates", "Public", "Personal", "Shared"].map((f) => (
            <button key={f} className="mb-1 block w-full rounded px-2 py-1.5 text-left hover:bg-blue-50">{f}</button>
          ))}
        </div>
        <div className="flex-1 overflow-auto p-4">
          {tab === "mailmerge" ? (
            <div className="rounded border bg-white p-8 text-center text-sm text-gray-500">
              Upload MS Word mail-merge templates (.docx) with merge fields.
              <div className="mt-3"><button className="crm-btn crm-btn-primary !text-xs">Upload Template</button></div>
            </div>
          ) : (
            <div className="overflow-hidden rounded border bg-white">
              <table className="crm-table text-xs">
                <thead><tr><th>Name</th><th>Folder</th><th>Modified</th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.name} className="cursor-pointer" onClick={() => setBuilder(true)}>
                      <td className="font-medium text-[var(--crm-blue)]">{r.name}</td>
                      <td>{r.folder}</td>
                      <td>{r.modified}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {builder && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold">Template Builder</h2>
            <div className="flex gap-2">
              <button className="crm-btn crm-btn-secondary" onClick={() => setBuilder(false)}>Cancel</button>
              <button className="crm-btn crm-btn-primary" onClick={() => setBuilder(false)}>Save</button>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-4 overflow-hidden">
            <div className="border-r p-3 text-xs">
              <div className="mb-2 font-semibold">Sections</div>
              {["Header", "Text", "Image", "Button", "Spacer", "Footer", "Merge Fields"].map((s) => (
                <div key={s} className="mb-1 cursor-grab rounded border px-2 py-1.5 hover:bg-blue-50">{s}</div>
              ))}
            </div>
            <div className="col-span-2 overflow-auto bg-gray-100 p-6">
              <div className="mx-auto min-h-[400px] max-w-lg rounded bg-white p-6 shadow">
                <h3 className="text-lg font-semibold">Hello {"{{First_Name}}"},</h3>
                <p className="mt-3 text-sm text-gray-600">Thank you for your interest in our products…</p>
                <button className="mt-4 rounded bg-[var(--crm-blue)] px-4 py-2 text-sm text-white">View Proposal</button>
              </div>
            </div>
            <div className="border-l p-3 text-xs">
              <div className="mb-2 font-semibold">Properties</div>
              <label className="crm-label">Template Name</label>
              <input className="crm-input mb-2" defaultValue="New Template" />
              <label className="crm-label">Subject</label>
              <input className="crm-input" defaultValue="Following up" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
