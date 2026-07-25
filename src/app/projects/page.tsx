"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatMoney } from "@/lib/utils";
import { Plus } from "lucide-react";

type Project = {
  id: string;
  project_name: string;
  status: string | null;
  owner_name: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  description: string | null;
};

export default function ProjectsPage() {
  const { toast } = useToast();
  const { displayName } = useAuth();
  const [rows, setRows] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    project_name: "",
    status: "Planning",
    start_date: "",
    end_date: "",
    budget: "",
    description: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (error) toast(error.message, "error");
    setRows((data as Project[]) || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function create() {
    if (!form.project_name.trim()) return toast("Project name required", "error");
    const { error } = await supabase.from("projects").insert({
      project_name: form.project_name,
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      budget: form.budget ? Number(form.budget) : null,
      description: form.description || null,
      owner_name: displayName,
    });
    if (error) return toast(error.message, "error");
    toast("Project created", "success");
    setOpen(false);
    setForm({ project_name: "", status: "Planning", start_date: "", end_date: "", budget: "", description: "" });
    load();
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("projects").update({ status }).eq("id", id);
    if (error) return toast(error.message, "error");
    load();
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-3">
        <h1 className="text-lg font-semibold">Projects</h1>
        <button className="crm-btn crm-btn-primary" onClick={() => setOpen(true)}>
          <Plus size={14} /> Create Project
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading…</div>
      ) : rows.length === 0 ? (
        <EmptyState
          illustration="📁"
          title="No projects yet"
          description="Link deals to project delivery. Create milestones and track budget against CRM opportunities."
          actionLabel="Create Project"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <div className="overflow-hidden rounded border">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Budget</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium text-[var(--crm-blue)]">{p.project_name}</td>
                    <td>{p.owner_name || "—"}</td>
                    <td>
                      <select
                        className="crm-input !w-auto !py-1 text-xs"
                        value={p.status || "Planning"}
                        onChange={(e) => updateStatus(p.id, e.target.value)}
                      >
                        {["Planning", "In Progress", "On Hold", "Completed", "Cancelled"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>{formatDate(p.start_date)}</td>
                    <td>{formatDate(p.end_date)}</td>
                    <td>{formatMoney(p.budget)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Project"
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
            <label className="crm-label">Project Name *</label>
            <input className="crm-input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="crm-label">Status</label>
              <select className="crm-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {["Planning", "In Progress", "On Hold", "Completed"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="crm-label">Budget</label>
              <input type="number" className="crm-input" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            </div>
            <div>
              <label className="crm-label">Start Date</label>
              <input type="date" className="crm-input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label className="crm-label">End Date</label>
              <input type="date" className="crm-input" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="crm-label">Description</label>
            <textarea className="crm-input min-h-[70px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
