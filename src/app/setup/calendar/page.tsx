"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSetting, saveSetting } from "@/lib/settings";
import { useToast } from "@/components/ui/Toast";

const DEFAULTS = {
  hourFormat: "12 Hours",
  dailyStart: "09:00",
  dailyEnd: "18:00",
  weekStarts: "Sunday",
  hideWeekends: false,
  shareEvents: true,
  showOnHome: true,
};

export default function CalendarPrefPage() {
  const { toast } = useToast();
  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSetting("calendar_preference", DEFAULTS).then(setForm);
  }, []);

  async function save() {
    setSaving(true);
    const { error } = await saveSetting("calendar_preference", form);
    setSaving(false);
    if (error) toast(error, "error");
    else toast("Calendar preferences saved", "success");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <Link href="/setup" className="rounded p-1 hover:bg-gray-100"><ArrowLeft size={18} /></Link>
        <h1 className="text-lg font-semibold">Calendar Preference</h1>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-xl space-y-3 rounded border bg-white p-6">
          <F label="Hour Format">
            <select className="crm-input" value={form.hourFormat} onChange={(e) => setForm({ ...form, hourFormat: e.target.value })}>
              <option>12 Hours</option><option>24 Hours</option>
            </select>
          </F>
          <F label="Daily start">
            <input type="time" className="crm-input" value={form.dailyStart} onChange={(e) => setForm({ ...form, dailyStart: e.target.value })} />
          </F>
          <F label="Daily end">
            <input type="time" className="crm-input" value={form.dailyEnd} onChange={(e) => setForm({ ...form, dailyEnd: e.target.value })} />
          </F>
          <F label="Week starts on">
            <select className="crm-input" value={form.weekStarts} onChange={(e) => setForm({ ...form, weekStarts: e.target.value })}>
              <option>Sunday</option><option>Monday</option>
            </select>
          </F>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.hideWeekends} onChange={(e) => setForm({ ...form, hideWeekends: e.target.checked })} /> Hide weekends
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.shareEvents} onChange={(e) => setForm({ ...form, shareEvents: e.target.checked })} /> Share calendar events
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.showOnHome} onChange={(e) => setForm({ ...form, showOnHome: e.target.checked })} /> Show events on CRM Home
          </label>
          <button className="crm-btn crm-btn-primary mt-2" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="crm-label">{label}</label>{children}</div>;
}
