"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CompanyPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <Link href="/setup" className="rounded p-1 hover:bg-gray-100"><ArrowLeft size={18} /></Link>
        <h1 className="text-lg font-semibold">Company Details</h1>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-3xl space-y-4 rounded border bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded border-2 border-dashed text-xs text-gray-400">Logo</div>
            <button className="crm-btn crm-btn-secondary !text-xs">Upload Logo</button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Company Name", "Acme CRM Demo"],
              ["Alias", "ACME"],
              ["Employee Count", "50-250"],
              ["Phone", "555-0100"],
              ["Website", "https://acme.example"],
              ["Fax", ""],
            ].map(([l, v]) => (
              <div key={l}>
                <label className="crm-label">{l}</label>
                <input className="crm-input" defaultValue={v} />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="crm-label">Address</label>
              <textarea className="crm-input min-h-[60px]" defaultValue="100 Market St, San Francisco, CA" />
            </div>
            <div className="md:col-span-2">
              <label className="crm-label">Description</label>
              <textarea className="crm-input min-h-[60px]" />
            </div>
          </div>
          <button className="crm-btn crm-btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
}
