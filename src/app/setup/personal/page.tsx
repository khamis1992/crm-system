"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PersonalSettingsPage() {
  return (
    <Shell title="Personal Settings">
      <Grid>
        <F label="Country Locale"><select className="crm-input"><option>United States</option><option>United Kingdom</option><option>Qatar</option></select></F>
        <F label="Language"><select className="crm-input"><option>English (US)</option><option>Arabic</option></select></F>
        <F label="Display Name Order"><select className="crm-input"><option>First Last</option><option>Last, First</option></select></F>
        <F label="Date Format"><select className="crm-input"><option>MM/DD/YYYY</option><option>DD/MM/YYYY</option></select></F>
        <F label="Time Format"><select className="crm-input"><option>12 Hours</option><option>24 Hours</option></select></F>
        <F label="Time Zone"><select className="crm-input"><option>GMT-08:00 Pacific</option><option>GMT+03:00 Asia/Qatar</option></select></F>
        <F label="Currency Locale"><select className="crm-input"><option>USD — $</option><option>QAR</option><option>EUR</option></select></F>
        <F label="Appearance"><select className="crm-input"><option>Light</option><option>Dark</option><option>Auto</option></select></F>
      </Grid>
      <button className="crm-btn crm-btn-primary mt-4">Save</button>
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
