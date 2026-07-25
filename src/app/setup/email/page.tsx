"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSetting, saveSetting } from "@/lib/settings";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

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

type EmailSettings = {
  emails: { email: string; displayName: string; status: string }[];
  bccEnabled: boolean;
  bccAddress: string;
  trackOpens: boolean;
  trackClicks: boolean;
  includeOriginal: boolean;
  font: string;
  fontSize: string;
  signature: string;
  enabledFeatures: string[];
  spf: string;
  dkim: string;
};

const DEFAULTS: EmailSettings = {
  emails: [
    { email: "demo@crm.local", displayName: "Demo User", status: "Verified" },
    { email: "sales@crm.local", displayName: "Sales Team", status: "Verified" },
  ],
  bccEnabled: true,
  bccAddress: "dropbox@crm.local",
  trackOpens: true,
  trackClicks: true,
  includeOriginal: false,
  font: "Segoe UI",
  fontSize: "13",
  signature: "Best regards,\nDemo User",
  enabledFeatures: [],
  spf: "Not Verified",
  dkim: "Not Verified",
};

export default function EmailSetupPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState(TABS[0]);
  const [form, setForm] = useState<EmailSettings>(DEFAULTS);
  const [addOpen, setAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState({ email: "", displayName: "" });

  useEffect(() => {
    getSetting("email_config", DEFAULTS).then(setForm);
  }, []);

  async function persist(next: EmailSettings, msg = "Email settings saved") {
    setForm(next);
    const { error } = await saveSetting("email_config", next);
    if (error) toast(error, "error");
    else toast(msg, "success");
  }

  function copyBcc() {
    navigator.clipboard?.writeText(form.bccAddress);
    toast("BCC address copied", "success");
  }

  function enableFeature(name: string) {
    if (form.enabledFeatures.includes(name)) {
      persist({ ...form, enabledFeatures: form.enabledFeatures.filter((x) => x !== name) }, `${name} disabled`);
    } else {
      persist({ ...form, enabledFeatures: [...form.enabledFeatures, name] }, `${name} enabled`);
    }
  }

  async function addEmail() {
    if (!newEmail.email.trim()) return toast("Email required", "error");
    const next = {
      ...form,
      emails: [...form.emails, { email: newEmail.email, displayName: newEmail.displayName || newEmail.email, status: "Pending" }],
    };
    await persist(next, "Email added");
    setAddOpen(false);
    setNewEmail({ email: "", displayName: "" });
  }

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
                  {form.emails.map((e) => (
                    <tr key={e.email}>
                      <td>{e.email}</td>
                      <td>{e.displayName}</td>
                      <td>{e.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="crm-btn crm-btn-primary mt-3 !text-xs" onClick={() => setAddOpen(true)}>Add Email</button>
            </>
          )}
          {tab === "Authentication" && (
            <div className="space-y-3">
              <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Public domain warning: configure SPF/DKIM for better deliverability.
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded border p-4">
                  <div className="font-medium">SPF</div>
                  <div className="mt-1 text-xs text-amber-600">{form.spf}</div>
                </div>
                <div className="rounded border p-4">
                  <div className="font-medium">DKIM</div>
                  <div className="mt-1 text-xs text-amber-600">{form.dkim}</div>
                </div>
              </div>
              <button
                className="crm-btn crm-btn-primary !text-xs"
                onClick={() => persist({ ...form, spf: "Verified", dkim: "Verified" }, "SPF/DKIM marked verified")}
              >
                Verify Authentication
              </button>
            </div>
          )}
          {tab === "BCC Dropbox" && (
            <div className="space-y-3 text-sm">
              <p className="text-gray-600">Forward or BCC emails to auto-associate with CRM records.</p>
              <div className="rounded bg-gray-50 p-3 font-mono text-sm">
                {form.bccAddress}{" "}
                <button className="ml-2 text-xs text-[var(--crm-blue)]" onClick={copyBcc}>Copy</button>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.bccEnabled}
                  onChange={(e) => persist({ ...form, bccEnabled: e.target.checked }, e.target.checked ? "BCC enabled" : "BCC disabled")}
                />
                Enable BCC Dropbox
              </label>
            </div>
          )}
          {tab === "Compose" && (
            <div className="grid max-w-md gap-3">
              <div>
                <label className="crm-label">Default Font</label>
                <select className="crm-input" value={form.font} onChange={(e) => setForm({ ...form, font: e.target.value })}>
                  <option>Segoe UI</option><option>Arial</option>
                </select>
              </div>
              <div>
                <label className="crm-label">Font Size</label>
                <select className="crm-input" value={form.fontSize} onChange={(e) => setForm({ ...form, fontSize: e.target.value })}>
                  <option>13</option><option>14</option>
                </select>
              </div>
              <div>
                <label className="crm-label">Signature</label>
                <textarea className="crm-input min-h-[80px]" value={form.signature} onChange={(e) => setForm({ ...form, signature: e.target.value })} />
              </div>
              <button className="crm-btn crm-btn-primary !text-xs" onClick={() => persist(form)}>Save Compose Settings</button>
            </div>
          )}
          {tab === "From Address" && (
            <table className="crm-table text-xs">
              <thead><tr><th>Address</th><th>Verified</th></tr></thead>
              <tbody>
                {form.emails.map((e) => (
                  <tr key={e.email}><td>{e.email}</td><td>{e.status === "Verified" ? "Yes" : "No"}</td></tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === "Preference" && (
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.trackOpens} onChange={(e) => setForm({ ...form, trackOpens: e.target.checked })} /> Track email opens
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.trackClicks} onChange={(e) => setForm({ ...form, trackClicks: e.target.checked })} /> Track link clicks
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.includeOriginal} onChange={(e) => setForm({ ...form, includeOriginal: e.target.checked })} /> Include original message in replies
              </label>
              <button className="crm-btn crm-btn-primary mt-3 !text-xs" onClick={() => persist(form)}>Save Preferences</button>
            </div>
          )}
          {tab === "Sharing" && (
            <div>
              <p className="text-sm text-gray-600">Control which users can view emails associated with records they own or have access to.</p>
              <button className="crm-btn crm-btn-primary mt-4 !text-xs" onClick={() => persist({ ...form, enabledFeatures: [...new Set([...form.enabledFeatures, "Sharing"])] }, "Email sharing policy saved")}>
                Save Sharing Policy
              </button>
            </div>
          )}
          {["Email Parsing", "Insights", "Drafts", "Selection"].includes(tab) && (
            <div className="py-10 text-center">
              <div className="mb-2 text-3xl">✉️</div>
              <div className="font-medium">{tab}</div>
              <p className="mt-1 text-sm text-gray-500">
                {form.enabledFeatures.includes(tab) ? "This capability is enabled for your organization." : "Enable this email capability for your organization."}
              </p>
              <button className="crm-btn crm-btn-primary mt-4 !text-xs" onClick={() => enableFeature(tab)}>
                {form.enabledFeatures.includes(tab) ? `Disable ${tab}` : `Enable ${tab}`}
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Organization Email" width="md" footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={() => setAddOpen(false)}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={addEmail}>Add</button>
        </>
      }>
        <div className="space-y-3">
          <div>
            <label className="crm-label">Email</label>
            <input className="crm-input" type="email" value={newEmail.email} onChange={(e) => setNewEmail({ ...newEmail, email: e.target.value })} />
          </div>
          <div>
            <label className="crm-label">Display Name</label>
            <input className="crm-input" value={newEmail.displayName} onChange={(e) => setNewEmail({ ...newEmail, displayName: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
