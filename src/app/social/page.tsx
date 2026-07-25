"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Plus, Trash2 } from "lucide-react";

type Brand = {
  id: string;
  brand_name: string;
  platform: string;
  handle: string | null;
  status: string | null;
};

export default function SocialPage() {
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ brand_name: "", platform: "LinkedIn", handle: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("social_brands").select("*").order("created_at", { ascending: false });
    if (error) toast(error.message, "error");
    setBrands((data as Brand[]) || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function addBrand() {
    if (!form.brand_name.trim()) return toast("Brand name required", "error");
    const { error } = await supabase.from("social_brands").insert({
      brand_name: form.brand_name,
      platform: form.platform,
      handle: form.handle || null,
      status: "Connected",
    });
    if (error) return toast(error.message, "error");
    toast(`${form.platform} brand connected`, "success");
    setOpen(false);
    setForm({ brand_name: "", platform: "LinkedIn", handle: "" });
    load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("social_brands").delete().eq("id", id);
    if (error) return toast(error.message, "error");
    toast("Brand removed", "success");
    load();
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-3">
        <h1 className="text-lg font-semibold">Social</h1>
        <button className="crm-btn crm-btn-primary" onClick={() => setOpen(true)}>
          <Plus size={14} /> Add Brand
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading…</div>
      ) : brands.length === 0 ? (
        <EmptyState
          illustration="📣"
          title="Connect your social brands"
          description="Monitor mentions and convert social interactions into leads. Add a brand to get started."
          actionLabel="Add Brand"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <div key={b.id} className="rounded border border-[var(--crm-border)] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-[var(--crm-blue)]">{b.brand_name}</div>
                  <div className="text-xs text-gray-500">{b.platform} · {b.handle || "—"}</div>
                  <span className="mt-2 inline-block rounded bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                    {b.status}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-red-500" onClick={() => remove(b.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Social Brand"
        width="md"
        footer={
          <>
            <button className="crm-btn crm-btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button className="crm-btn crm-btn-primary" onClick={addBrand}>Connect</button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="crm-label">Brand Name *</label>
            <input className="crm-input" value={form.brand_name} onChange={(e) => setForm({ ...form, brand_name: e.target.value })} />
          </div>
          <div>
            <label className="crm-label">Platform</label>
            <select className="crm-input" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              {["LinkedIn", "Twitter / X", "Facebook", "Instagram"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="crm-label">Handle</label>
            <input className="crm-input" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} placeholder="@company" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
