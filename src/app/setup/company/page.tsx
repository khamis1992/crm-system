"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSetting, saveSetting } from "@/lib/settings";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/lib/currency-context";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";

const DEFAULTS = {
  companyName: "Acme CRM Demo",
  alias: "ACME",
  employees: "50-250",
  phone: "555-0100",
  website: "https://acme.example",
  fax: "",
  address: "Doha, Qatar",
  description: "",
  logoName: "",
  currency: "QAR" as CurrencyCode,
};

export default function CompanyPage() {
  const { toast } = useToast();
  const { currency: appCurrency, setCurrency, formatMoney } = useCurrency();
  const [form, setForm] = useState({ ...DEFAULTS, currency: appCurrency });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSetting("company_details", DEFAULTS).then((data) => {
      setForm({
        ...DEFAULTS,
        ...data,
        currency: (data.currency as CurrencyCode) || appCurrency || "QAR",
      });
    });
  }, [appCurrency]);

  async function save() {
    setSaving(true);
    const { error } = await saveSetting("company_details", form);
    await setCurrency(form.currency);
    setSaving(false);
    if (error) toast(error, "error");
    else toast(`Company saved · Currency: ${form.currency}`, "success");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <Link href="/setup" className="rounded p-1 hover:bg-gray-100">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-lg font-semibold">Company Details</h1>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-3xl space-y-4 rounded border bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded border-2 border-dashed text-xs text-gray-400">
              {form.logoName ? form.logoName.slice(0, 8) : "Logo"}
            </div>
            <label className="crm-btn crm-btn-secondary !text-xs cursor-pointer">
              Upload Logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setForm({ ...form, logoName: f.name });
                    toast(`Logo selected: ${f.name}`, "info");
                  }
                }}
              />
            </label>
          </div>

          <div className="rounded border border-blue-100 bg-blue-50 p-4">
            <label className="crm-label">System Currency (base currency)</label>
            <select
              className="crm-input max-w-md"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value as CurrencyCode })}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-600">
              Default is <strong>QAR</strong>. All money fields use this currency.
              Preview: <strong>{formatMoney(12500)}</strong>
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(
              [
                ["companyName", "Company Name"],
                ["alias", "Alias"],
                ["employees", "Employee Count"],
                ["phone", "Phone"],
                ["website", "Website"],
                ["fax", "Fax"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="crm-label">{label}</label>
                <input
                  className="crm-input"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="crm-label">Address</label>
              <textarea
                className="crm-input min-h-[60px]"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="crm-label">Description</label>
              <textarea
                className="crm-input min-h-[60px]"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <button className="crm-btn crm-btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
