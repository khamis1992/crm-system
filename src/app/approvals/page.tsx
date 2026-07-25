"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth-context";
import { Plus } from "lucide-react";

const TABS = ["My Approvals", "My Delegate Approvals", "All Approvals"];

type Approval = {
  id: string;
  title: string;
  module: string;
  requested_by: string | null;
  assigned_to: string | null;
  status: string;
  comments: string | null;
  created_at: string;
};

export default function ApprovalsPage() {
  const { toast } = useToast();
  const { displayName } = useAuth();
  const [tab, setTab] = useState(TABS[0]);
  const [rows, setRows] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    module: "Deals",
    assigned_to: "Demo User",
    comments: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("approvals")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast(error.message, "error");
    setRows((data as Approval[]) || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = rows.filter((r) => {
    if (tab === "My Approvals") return r.assigned_to === displayName || r.status === "Pending";
    if (tab === "My Delegate Approvals") return r.requested_by === displayName;
    return true;
  });

  async function createApproval() {
    if (!form.title.trim()) {
      toast("Title is required", "error");
      return;
    }
    const { error } = await supabase.from("approvals").insert({
      title: form.title,
      module: form.module,
      assigned_to: form.assigned_to,
      comments: form.comments,
      requested_by: displayName,
      status: "Pending",
    });
    if (error) return toast(error.message, "error");
    toast("Approval request created", "success");
    setCreateOpen(false);
    setForm({ title: "", module: "Deals", assigned_to: "Demo User", comments: "" });
    load();
  }

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("approvals").update({ status }).eq("id", id);
    if (error) return toast(error.message, "error");
    toast(`Marked ${status}`, "success");
    await supabase.from("activities").insert({
      activity_type: "approval",
      subject: `Approval ${status}`,
      body: `Approval ${id} → ${status}`,
      related_to_type: "approvals",
      related_to_id: id,
      owner_name: displayName,
    });
    load();
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-3">
        <h1 className="text-lg font-semibold">Approvals</h1>
        <button className="crm-btn crm-btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={14} /> New Request
        </button>
      </div>
      <div className="flex gap-1 border-b border-[var(--crm-border)] px-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-3 py-2.5 text-sm",
              tab === t ? "border-[var(--crm-blue)] font-semibold text-[var(--crm-blue)]" : "border-transparent text-gray-500"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          illustration="✅"
          title={`No ${tab.toLowerCase()}`}
          description="Create an approval request for discounts, quotes, or process rules."
          actionLabel="New Request"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <div className="overflow-hidden rounded border border-[var(--crm-border)]">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Module</th>
                  <th>Requested By</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium">{r.title}</td>
                    <td>{r.module}</td>
                    <td>{r.requested_by || "—"}</td>
                    <td>{r.assigned_to || "—"}</td>
                    <td>
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-xs font-medium",
                          r.status === "Approved" && "bg-emerald-50 text-emerald-700",
                          r.status === "Rejected" && "bg-red-50 text-red-700",
                          r.status === "Pending" && "bg-amber-50 text-amber-700"
                        )}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="space-x-2">
                      {r.status === "Pending" && (
                        <>
                          <button className="text-xs font-medium text-emerald-600" onClick={() => setStatus(r.id, "Approved")}>
                            Approve
                          </button>
                          <button className="text-xs font-medium text-red-600" onClick={() => setStatus(r.id, "Rejected")}>
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Approval Request"
        width="md"
        footer={
          <>
            <button className="crm-btn crm-btn-secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </button>
            <button className="crm-btn crm-btn-primary" onClick={createApproval}>
              Submit
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="crm-label">Title *</label>
            <input className="crm-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="crm-label">Module</label>
            <select className="crm-input" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })}>
              {["Deals", "Quotes", "Invoices", "Leads", "Cases"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="crm-label">Assign To</label>
            <select className="crm-input" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
              {["Demo User", "Alex Sales", "Sam Manager", "Jordan AE"].map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="crm-label">Comments</label>
            <textarea className="crm-input min-h-[70px]" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
