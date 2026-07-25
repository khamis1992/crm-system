"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";

type App = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  installed: boolean | null;
};

export default function MarketplacePage() {
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [apps, setApps] = useState<App[]>([]);
  const [selected, setSelected] = useState<App | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("marketplace_apps").select("*").order("name");
    if (error) toast(error.message, "error");
    setApps((data as App[]) || []);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const list = apps.filter(
    (a) =>
      !q ||
      a.name.toLowerCase().includes(q.toLowerCase()) ||
      (a.category || "").toLowerCase().includes(q.toLowerCase())
  );

  async function toggleInstall(app: App) {
    const installed = !app.installed;
    const { error } = await supabase.from("marketplace_apps").update({ installed }).eq("id", app.id);
    if (error) return toast(error.message, "error");
    toast(installed ? `${app.name} installed` : `${app.name} uninstalled`, "success");
    setSelected(null);
    load();
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Marketplace</h1>
          <p className="text-xs text-gray-500">Extensions and integrations for your CRM</p>
        </div>
        <input
          className="crm-input max-w-xs"
          placeholder="Search extensions…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelected(a)}
            className="rounded border border-[var(--crm-border)] bg-white p-4 text-left hover:border-[var(--crm-blue)] hover:shadow-sm"
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-blue-50 text-lg">⚡</div>
            <div className="font-medium text-[var(--crm-blue)]">{a.name}</div>
            <div className="text-[11px] text-gray-400">
              {a.category} · {a.installed ? "Installed" : "Available"}
            </div>
            <div className="mt-1 text-xs text-gray-500">{a.description}</div>
          </button>
        ))}
        {!list.length && (
          <div className="col-span-full py-12 text-center text-sm text-gray-400">
            No apps found. Run the Supabase migration to seed marketplace apps.
          </div>
        )}
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">{selected.name}</h2>
            <p className="mt-2 text-sm text-gray-600">{selected.description}</p>
            <div className="mt-2 text-xs text-gray-400">
              {selected.category} · {selected.installed ? "Installed" : "Not installed"}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="crm-btn crm-btn-secondary" onClick={() => setSelected(null)}>
                Close
              </button>
              <button className="crm-btn crm-btn-primary" onClick={() => toggleInstall(selected)}>
                {selected.installed ? "Uninstall" : "Install"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
