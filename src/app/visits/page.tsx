"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth-context";
import { formatDateTime } from "@/lib/utils";
import { Plus, MapPin } from "lucide-react";

type Visit = {
  id: string;
  title: string;
  location: string | null;
  check_in: string | null;
  check_out: string | null;
  status: string | null;
  owner_name: string | null;
  notes: string | null;
};

export default function VisitsPage() {
  const { toast } = useToast();
  const { displayName } = useAuth();
  const [rows, setRows] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", location: "", notes: "", status: "Scheduled" });

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("visits").select("*").order("created_at", { ascending: false });
    if (error) toast(error.message, "error");
    setRows((data as Visit[]) || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function create() {
    if (!form.title.trim()) return toast("Title required", "error");
    const { error } = await supabase.from("visits").insert({
      title: form.title,
      location: form.location || null,
      notes: form.notes || null,
      status: form.status,
      owner_name: displayName,
      check_in: form.status === "Checked In" ? new Date().toISOString() : null,
    });
    if (error) return toast(error.message, "error");
    toast("Visit logged", "success");
    setOpen(false);
    setForm({ title: "", location: "", notes: "", status: "Scheduled" });
    load();
  }

  async function checkIn(id: string) {
    const { error } = await supabase
      .from("visits")
      .update({ status: "Checked In", check_in: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast(error.message, "error");
    toast("Checked in", "success");
    load();
  }

  async function checkOut(id: string) {
    const { error } = await supabase
      .from("visits")
      .update({ status: "Completed", check_out: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast(error.message, "error");
    toast("Checked out", "success");
    load();
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-3">
        <h1 className="text-lg font-semibold">Visits</h1>
        <button className="crm-btn crm-btn-primary" onClick={() => setOpen(true)}>
          <Plus size={14} /> Log Visit
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading…</div>
      ) : rows.length === 0 ? (
        <EmptyState
          illustration="📍"
          title="No visits yet"
          description="Track field sales check-ins and customer site visits with location and notes."
          actionLabel="Log Visit"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            {rows.map((v) => (
              <div key={v.id} className="flex items-start justify-between gap-3 rounded border border-[var(--crm-border)] p-4">
                <div>
                  <div className="font-medium text-[var(--crm-blue)]">{v.title}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={12} /> {v.location || "No location"} · {v.owner_name}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    In: {formatDateTime(v.check_in)} · Out: {formatDateTime(v.check_out)}
                  </div>
                  {v.notes && <div className="mt-2 text-sm text-gray-600">{v.notes}</div>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-[var(--crm-blue)]">{v.status}</span>
                  {v.status === "Scheduled" && (
                    <button className="crm-btn crm-btn-primary !text-xs" onClick={() => checkIn(v.id)}>Check In</button>
                  )}
                  {v.status === "Checked In" && (
                    <button className="crm-btn crm-btn-secondary !text-xs" onClick={() => checkOut(v.id)}>Check Out</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Log Visit"
        width="md"
        footer={
          <>
            <button className="crm-btn crm-btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button className="crm-btn crm-btn-primary" onClick={create}>Save</button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="crm-label">Title *</label>
            <input className="crm-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="crm-label">Location</label>
            <input className="crm-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Address or site name" />
          </div>
          <div>
            <label className="crm-label">Status</label>
            <select className="crm-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Scheduled</option>
              <option>Checked In</option>
              <option>Completed</option>
            </select>
          </div>
          <div>
            <label className="crm-label">Notes</label>
            <textarea className="crm-input min-h-[70px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
