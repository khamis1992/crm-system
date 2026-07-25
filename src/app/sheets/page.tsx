"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { MODULES } from "@/lib/modules";

type Sheet = {
  id: string;
  name: string;
  module: string;
  created_by: string | null;
  updated_at: string;
};

export default function SheetsPage() {
  const { toast } = useToast();
  const { displayName } = useAuth();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", module: "Leads" });

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("sheets").select("*").order("updated_at", { ascending: false });
    if (error) toast(error.message, "error");
    setSheets((data as Sheet[]) || []);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function create() {
    if (!form.name.trim()) return toast("Name required", "error");
    const { error } = await supabase.from("sheets").insert({
      name: form.name,
      module: form.module,
      created_by: displayName,
    });
    if (error) return toast(error.message, "error");
    toast("Sheet created", "success");
    setOpen(false);
    setForm({ name: "", module: "Leads" });
    load();
  }

  function moduleHref(module: string) {
    const m = MODULES.find((x) => x.label === module || x.table === module.toLowerCase());
    return m?.href || "/leads";
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Sheets</h1>
          <p className="text-xs text-gray-500">Spreadsheet views linked to CRM modules</p>
        </div>
        <button className="crm-btn crm-btn-primary" onClick={() => setOpen(true)}>
          <Plus size={14} /> New Sheet
        </button>
      </div>
      <div className="overflow-hidden rounded border border-[var(--crm-border)] bg-white">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Sheet Name</th>
              <th>Related Module</th>
              <th>Created By</th>
              <th>Last Modified</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sheets.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  No sheets yet — create one to open a module in sheet view
                </td>
              </tr>
            )}
            {sheets.map((s) => (
              <tr key={s.id}>
                <td className="font-medium text-[var(--crm-blue)]">{s.name}</td>
                <td>{s.module}</td>
                <td>{s.created_by || "—"}</td>
                <td>{formatDate(s.updated_at)}</td>
                <td>
                  <Link href={moduleHref(s.module)} className="text-xs text-[var(--crm-blue)]">
                    Open Sheet View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New Sheet"
        width="md"
        footer={
          <>
            <button className="crm-btn crm-btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button className="crm-btn crm-btn-primary" onClick={create}>Create</button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="crm-label">Sheet Name *</label>
            <input className="crm-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="crm-label">Module</label>
            <select className="crm-input" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })}>
              {MODULES.filter((m) => m.table).map((m) => (
                <option key={m.key}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
