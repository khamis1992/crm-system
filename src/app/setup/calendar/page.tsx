"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CalendarPrefPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <Link href="/setup" className="rounded p-1 hover:bg-gray-100"><ArrowLeft size={18} /></Link>
        <h1 className="text-lg font-semibold">Calendar Preference</h1>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-xl space-y-3 rounded border bg-white p-6">
          <F label="Hour Format"><select className="crm-input"><option>12 Hours</option><option>24 Hours</option></select></F>
          <F label="Daily start"><input type="time" className="crm-input" defaultValue="09:00" /></F>
          <F label="Daily end"><input type="time" className="crm-input" defaultValue="18:00" /></F>
          <F label="Week starts on"><select className="crm-input"><option>Sunday</option><option>Monday</option></select></F>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Hide weekends</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Share calendar events</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Show events on CRM Home</label>
          <button className="crm-btn crm-btn-primary mt-2">Save</button>
        </div>
      </div>
    </div>
  );
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="crm-label">{label}</label>{children}</div>;
}
