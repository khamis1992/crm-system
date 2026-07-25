"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

const ACTIONS = [
  "Email Notification",
  "Field Update",
  "Assign Owner",
  "Create Record",
  "Schedule Call",
  "Create Meeting",
  "Convert",
  "Webhook",
  "Create Campaign",
  "Zoho Flow",
  "Custom Function",
  "Add Tags",
];

type Rule = {
  id: string;
  name: string;
  module: string;
  status: string;
  trigger: string;
  condition: string;
  actions: string[];
};

export default function WorkflowsPage() {
  const { toast } = useToast();
  const [rules, setRules] = useState<Rule[]>([]);
  const [builder, setBuilder] = useState(false);
  const [actionMenu, setActionMenu] = useState(false);
  const [actionForm, setActionForm] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", module: "Leads", trigger: "Create", condition: "", actions: [] as string[] });
  const [step, setStep] = useState<"meta" | "builder">("meta");

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("workflow_rules").select("*").order("created_at", { ascending: false });
    if (error) {
      toast(error.message, "error");
      return;
    }
    setRules(
      (data || []).map((r) => ({
        id: r.id,
        name: r.name,
        module: r.module,
        status: r.active ? "Active" : "Inactive",
        trigger: r.trigger_type || "Create",
        condition: Array.isArray(r.conditions) && r.conditions[0]
          ? `${r.conditions[0].field || ""} ${r.conditions[0].op || ""} ${r.conditions[0].value || ""}`.trim() || "None"
          : r.description || "None",
        actions: Array.isArray(r.actions) ? r.actions.map(String) : [],
      }))
    );
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveRule() {
    const { error } = await supabase.from("workflow_rules").insert({
      name: form.name || "Untitled Rule",
      module: form.module,
      description: form.condition || null,
      trigger_type: form.trigger,
      conditions: form.condition ? [{ field: "custom", op: "is", value: form.condition }] : [],
      actions: form.actions,
      active: true,
    });
    if (error) return toast(error.message, "error");
    toast("Workflow rule saved", "success");
    setBuilder(false);
    setStep("meta");
    setForm({ name: "", module: "Leads", trigger: "Create", condition: "", actions: [] });
    load();
  }

  async function deleteRule(id: string) {
    const { error } = await supabase.from("workflow_rules").delete().eq("id", id);
    if (error) return toast(error.message, "error");
    toast("Rule deleted", "success");
    load();
  }

  async function toggleRule(id: string, status: string) {
    const { error } = await supabase.from("workflow_rules").update({ active: status !== "Active" }).eq("id", id);
    if (error) return toast(error.message, "error");
    load();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--crm-border)] bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/setup" className="rounded p-1 hover:bg-gray-100"><ArrowLeft size={18} /></Link>
          <div>
            <div className="text-xs text-gray-400">Setup · Automation</div>
            <h1 className="text-lg font-semibold">Workflow Rules</h1>
          </div>
        </div>
        <button className="crm-btn crm-btn-primary" onClick={() => { setBuilder(true); setStep("meta"); }}>
          <Plus size={14} /> Create Rule
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="overflow-hidden rounded border border-[var(--crm-border)] bg-white">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Module</th>
                <th>Trigger</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">No workflow rules yet</td>
                </tr>
              )}
              {rules.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium text-[var(--crm-blue)]">{r.name}</td>
                  <td>{r.module}</td>
                  <td>{r.trigger}</td>
                  <td>
                    <button
                      className={`rounded px-2 py-0.5 text-xs ${r.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                      onClick={() => toggleRule(r.id, r.status)}
                    >
                      {r.status}
                    </button>
                  </td>
                  <td className="text-xs text-gray-500">
                    <div className="flex items-center justify-between gap-2">
                      <span>{r.actions.join(", ") || "—"}</span>
                      <button className="text-gray-400 hover:text-red-500" onClick={() => deleteRule(r.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={builder}
        onClose={() => setBuilder(false)}
        title={step === "meta" ? "Create Workflow Rule" : `Rule Builder — ${form.name || "Untitled"}`}
        width="2xl"
        footer={
          <>
            <button className="crm-btn crm-btn-secondary" onClick={() => setBuilder(false)}>Cancel</button>
            {step === "builder" && <button className="crm-btn crm-btn-secondary" onClick={() => setStep("meta")}>Back</button>}
            {step === "meta" ? (
              <button className="crm-btn crm-btn-primary" disabled={!form.name} onClick={() => setStep("builder")}>Next</button>
            ) : (
              <button className="crm-btn crm-btn-primary" onClick={saveRule}>Save Rule</button>
            )}
          </>
        }
      >
        {step === "meta" ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="crm-label">Rule Name *</label>
              <input className="crm-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="crm-label">Module *</label>
              <select className="crm-input" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })}>
                {["Leads", "Contacts", "Accounts", "Deals", "Tasks", "Cases"].map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="crm-label">When</label>
              <select className="crm-input" value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })}>
                <option>Create</option>
                <option>Edit</option>
                <option>Create or Edit</option>
                <option>Delete</option>
                <option>Field Update</option>
                <option>Date Based</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="crm-label">Description</label>
              <textarea className="crm-input min-h-[60px]" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Section title="1. When">
              <div className="text-sm">On <strong>{form.trigger}</strong> of <strong>{form.module}</strong></div>
            </Section>
            <Section title="2. Condition">
              <input
                className="crm-input"
                placeholder="e.g. Stage is Closed Won"
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
              />
            </Section>
            <Section
              title="3. Instant Actions"
              action={
                <div className="relative">
                  <button className="crm-btn crm-btn-secondary !text-xs" onClick={() => setActionMenu(!actionMenu)}>
                    + Add Action
                  </button>
                  {actionMenu && (
                    <div className="absolute right-0 z-10 mt-1 max-h-64 w-56 overflow-auto rounded border bg-white py-1 shadow-lg">
                      {ACTIONS.map((a) => (
                        <button
                          key={a}
                          className="block w-full px-3 py-2 text-left text-xs hover:bg-blue-50"
                          onClick={() => {
                            setForm({ ...form, actions: [...form.actions, a] });
                            setActionMenu(false);
                            setActionForm(a);
                          }}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              }
            >
              {form.actions.length === 0 && <div className="text-xs text-gray-400">No actions yet</div>}
              <ul className="space-y-1">
                {form.actions.map((a, i) => (
                  <li key={i} className="flex items-center justify-between rounded border px-2 py-1.5 text-xs">
                    <button className="text-[var(--crm-blue)]" onClick={() => setActionForm(a)}>{a}</button>
                    <button className="text-red-400" onClick={() => setForm({ ...form, actions: form.actions.filter((_, j) => j !== i) })}>×</button>
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="4. Time-Based Actions">
              <div className="flex gap-2 text-xs">
                <select className="crm-input !py-1"><option>1</option><option>2</option><option>24</option></select>
                <select className="crm-input !py-1"><option>Hours Later</option><option>Days Later</option></select>
                <span className="self-center text-gray-400">then run scheduled actions</span>
              </div>
            </Section>
          </div>
        )}
      </Modal>

      <Modal open={!!actionForm} onClose={() => setActionForm(null)} title={`Action: ${actionForm}`} width="md" footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={() => setActionForm(null)}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={() => setActionForm(null)}>Done</button>
        </>
      }>
        {actionForm === "Email Notification" && (
          <div className="space-y-2">
            <label className="crm-label">Template</label>
            <select className="crm-input"><option>Introduction</option><option>Follow-up</option></select>
            <label className="crm-label">From</label>
            <input className="crm-input" defaultValue="demo@crm.local" />
            <label className="crm-label">To</label>
            <select className="crm-input"><option>Record Owner</option><option>Related Contact</option><option>Role: Sales Manager</option></select>
          </div>
        )}
        {actionForm === "Field Update" && (
          <div className="space-y-2">
            <label className="crm-label">Field</label>
            <select className="crm-input"><option>Lead Status</option><option>Stage</option><option>Rating</option></select>
            <label className="crm-label">New Value</label>
            <input className="crm-input" />
          </div>
        )}
        {actionForm === "Assign Owner" && (
          <div className="space-y-2">
            <label className="crm-label">Assign To</label>
            <select className="crm-input"><option>Demo User</option><option>Alex Sales</option><option>Round Robin</option></select>
          </div>
        )}
        {actionForm === "Webhook" && (
          <div className="space-y-2">
            <label className="crm-label">URL</label>
            <input className="crm-input" placeholder="https://" />
            <label className="crm-label">Method</label>
            <select className="crm-input"><option>POST</option><option>GET</option><option>PUT</option></select>
          </div>
        )}
        {actionForm && !["Email Notification", "Field Update", "Assign Owner", "Webhook"].includes(actionForm) && (
          <p className="text-sm text-gray-600">Configure <strong>{actionForm}</strong> parameters. Saved with the workflow rule.</p>
        )}
      </Modal>
    </div>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className={cn("rounded border border-[var(--crm-border)] p-3")}>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--crm-blue)]">{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}
