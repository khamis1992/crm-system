"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSetting, saveSetting, saveLocal } from "@/lib/settings";
import { useToast } from "@/components/ui/Toast";

const DEFAULTS = {
  locale: "United States",
  language: "English (US)",
  nameOrder: "First Last",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12 Hours",
  timeZone: "GMT+03:00 Asia/Qatar",
  currency: "USD — $",
  appearance: "Light",
};

export default function PersonalSettingsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSetting("personal_settings", DEFAULTS).then(setForm);
  }, []);

  async function save() {
    setSaving(true);
    const { error } = await saveSetting("personal_settings", form);
    saveLocal("crm-personal-settings", form);
    setSaving(false);
    if (error) toast(error, "error");
    else toast("Personal settings saved", "success");
  }

  return (
    <Shell title="Personal Settings">
      <Grid>
        <F label="Country Locale">
          <select className="crm-input" value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })}>
            <option>United States</option><option>United Kingdom</option><option>Qatar</option>
          </select>
        </F>
        <F label="Language">
          <select className="crm-input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
            <option>English (US)</option><option>Arabic</option>
          </select>
        </F>
        <F label="Display Name Order">
          <select className="crm-input" value={form.nameOrder} onChange={(e) => setForm({ ...form, nameOrder: e.target.value })}>
            <option>First Last</option><option>Last, First</option>
          </select>
        </F>
        <F label="Date Format">
          <select className="crm-input" value={form.dateFormat} onChange={(e) => setForm({ ...form, dateFormat: e.target.value })}>
            <option>MM/DD/YYYY</option><option>DD/MM/YYYY</option>
          </select>
        </F>
        <F label="Time Format">
          <select className="crm-input" value={form.timeFormat} onChange={(e) => setForm({ ...form, timeFormat: e.target.value })}>
            <option>12 Hours</option><option>24 Hours</option>
          </select>
        </F>
        <F label="Time Zone">
          <select className="crm-input" value={form.timeZone} onChange={(e) => setForm({ ...form, timeZone: e.target.value })}>
            <option>GMT-08:00 Pacific</option><option>GMT+03:00 Asia/Qatar</option>
          </select>
        </F>
        <F label="Currency Locale">
          <select className="crm-input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
            <option>USD — $</option><option>QAR</option><option>EUR</option>
          </select>
        </F>
        <F label="Appearance">
          <select className="crm-input" value={form.appearance} onChange={(e) => setForm({ ...form, appearance: e.target.value })}>
            <option>Light</option><option>Dark</option><option>Auto</option>
          </select>
        </F>
      </Grid>
      <button className="crm-btn crm-btn-primary mt-4" onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </button>
    </Shell>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <Link href="/setup" className="rounded p-1 hover:bg-gray-100"><ArrowLeft size={18} /></Link>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-3xl rounded border bg-white p-6">{children}</div>
      </div>
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="crm-label">{label}</label>{children}</div>;
}

export { Shell, Grid, F };
