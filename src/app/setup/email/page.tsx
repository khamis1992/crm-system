"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  "Email Configuration",
  "Authentication",
  "BCC Dropbox",
  "Email Parsing",
  "Sharing",
  "Insights",
  "Drafts",
  "From Address",
  "Compose",
  "Selection",
  "Preference",
];

export default function EmailSetupPage() {
  const [tab, setTab] = useState(TABS[0]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <Link href="/setup" className="rounded p-1 hover:bg-gray-100"><ArrowLeft size={18} /></Link>
        <h1 className="text-lg font-semibold">Email Configuration</h1>
      </div>
      <div className="flex gap-1 overflow-x-auto border-b bg-white px-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "whitespace-nowrap border-b-2 px-3 py-2.5 text-xs",
              tab === t ? "border-[var(--crm-blue)] font-semibold text-[var(--crm-blue)]" : "border-transparent text-gray-500"
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="rounded border bg-white p-6">
          {tab === "Email Configuration" && (
            <>
              <h2 className="mb-3 font-semibold">Organization Emails</h2>
              <table className="crm-table text-xs">
                <thead><tr><th>Email</th><th>Display Name</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td>demo@crm.local</td><td>Demo User</td><td>Verified</td></tr>
                  <tr><td>sales@crm.local</td><td>Sales Team</td><td>Verified</td></tr>
                </tbody>
              </table>
              <button className="crm-btn crm-btn-primary mt-3 !text-xs">Add Email</button>
            </>
          )}
          {tab === "Authentication" && (
            <div className="space-y-3">
              <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Public domain warning: configure SPF/DKIM for better deliverability.</div>
              <div className="grid gap-3 md:grid-cols-2">
                <Card title="SPF" status="Not Verified" />
                <Card title="DKIM" status="Not Verified" />
              </div>
              <button className="crm-btn crm-btn-primary !text-xs">Verify Authentication</button>
            </div>
          )}
          {tab === "BCC Dropbox" && (
            <div className="space-y-3 text-sm">
              <p className="text-gray-600">Forward or BCC emails to auto-associate with CRM records.</p>
              <div className="rounded bg-gray-50 p-3 font-mono text-sm">dropbox@crm.local <button className="ml-2 text-xs text-[var(--crm-blue)]">Copy</button></div>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Enable BCC Dropbox</label>
            </div>
          )}
          {tab === "Compose" && (
            <div className="grid max-w-md gap-3">
              <F label="Default Font"><select className="crm-input"><option>Segoe UI</option><option>Arial</option></select></F>
              <F label="Font Size"><select className="crm-input"><option>13</option><option>14</option></select></F>
              <F label="Signature"><textarea className="crm-input min-h-[80px]" defaultValue={"Best regards,\nDemo User"} /></F>
            </div>
          )}
          {tab === "From Address" && (
            <table className="crm-table text-xs">
              <thead><tr><th>Address</th><th>Verified</th></tr></thead>
              <tbody>
                <tr><td>demo@crm.local</td><td>Yes</td></tr>
                <tr><td>sales@crm.local</td><td>Yes</td></tr>
              </tbody>
            </table>
          )}
          {tab === "Preference" && (
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Track email opens</label>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Track link clicks</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Include original message in replies</label>
            </div>
          )}
          {tab === "Sharing" && (
            <p className="text-sm text-gray-600">Control which users can view emails associated with records they own or have access to.</p>
          )}
          {["Email Parsing", "Insights", "Drafts", "Selection"].includes(tab) && (
            <div className="py-10 text-center">
              <div className="mb-2 text-3xl">✉️</div>
              <div className="font-medium">{tab}</div>
              <p className="mt-1 text-sm text-gray-500">Enable this email capability for your organization.</p>
              <button className="crm-btn crm-btn-primary mt-4 !text-xs">Enable {tab}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, status }: { title: string; status: string }) {
  return (
    <div className="rounded border p-4">
      <div className="font-medium">{title}</div>
      <div className="mt-1 text-xs text-amber-600">{status}</div>
    </div>
  );
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="crm-label">{label}</label>{children}</div>;
}
