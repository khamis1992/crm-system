"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const channels = [
  { name: "Email", href: "/setup/email", desc: "Org emails, BCC dropbox, authentication, compose settings" },
  { name: "Chat", desc: "Zia / live chat integration", promo: true },
  { name: "Business Messaging", desc: "WhatsApp & Facebook messaging", promo: true },
  { name: "Portals", desc: "Customer self-service portal", promo: true },
  { name: "Calendar Booking", href: "/setup/calendar-booking", desc: "Public booking pages" },
];

export default function ChannelsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <Link href="/setup" className="rounded p-1 hover:bg-gray-100"><ArrowLeft size={18} /></Link>
        <h1 className="text-lg font-semibold">Channels</h1>
      </div>
      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((c) => (
          <div key={c.name} className="rounded border bg-white p-4">
            <div className="font-medium text-[var(--crm-blue)]">{c.name}</div>
            <p className="mt-1 text-xs text-gray-500">{c.desc}</p>
            {c.href ? (
              <Link href={c.href} className="crm-btn crm-btn-secondary mt-3 !text-xs">Configure</Link>
            ) : (
              <button className="crm-btn crm-btn-primary mt-3 !text-xs" onClick={() => alert(`Enable ${c.name}`)}>Enable</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
