"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSetting, saveSetting } from "@/lib/settings";
import { useToast } from "@/components/ui/Toast";

const CHANNELS = [
  { name: "Email", href: "/setup/email", desc: "Org emails, BCC dropbox, authentication, compose settings" },
  { name: "Chat", desc: "Zia / live chat integration", key: "chat" },
  { name: "Business Messaging", desc: "WhatsApp & Facebook messaging", key: "messaging" },
  { name: "Portals", desc: "Customer self-service portal", key: "portals" },
  { name: "Calendar Booking", href: "/setup/calendar-booking", desc: "Public booking pages" },
];

export default function ChannelsPage() {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getSetting<Record<string, boolean>>("channels_enabled", {}).then(setEnabled);
  }, []);

  async function toggle(key: string, name: string) {
    const next = { ...enabled, [key]: !enabled[key] };
    setEnabled(next);
    const { error } = await saveSetting("channels_enabled", next);
    if (error) toast(error, "error");
    else toast(`${name} ${next[key] ? "enabled" : "disabled"}`, "success");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <Link href="/setup" className="rounded p-1 hover:bg-gray-100"><ArrowLeft size={18} /></Link>
        <h1 className="text-lg font-semibold">Channels</h1>
      </div>
      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 lg:grid-cols-3">
        {CHANNELS.map((c) => (
          <div key={c.name} className="rounded border bg-white p-4">
            <div className="font-medium text-[var(--crm-blue)]">{c.name}</div>
            <p className="mt-1 text-xs text-gray-500">{c.desc}</p>
            {c.href ? (
              <Link href={c.href} className="crm-btn crm-btn-secondary mt-3 !text-xs">Configure</Link>
            ) : (
              <button
                className={`crm-btn mt-3 !text-xs ${enabled[c.key!] ? "crm-btn-secondary" : "crm-btn-primary"}`}
                onClick={() => toggle(c.key!, c.name)}
              >
                {enabled[c.key!] ? "Disable" : "Enable"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
