"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { supabase, DEAL_STAGES } from "@/lib/supabase";
import { fullName } from "@/lib/utils";
import { Paperclip, Bold, Italic, Underline, List, Link2 } from "lucide-react";

/* ───────── Compose Email ───────── */
export function ComposeEmailModal({
  open,
  onClose,
  to = "",
  recordName = "",
}: {
  open: boolean;
  onClose: () => void;
  to?: string;
  recordName?: string;
}) {
  const [form, setForm] = useState({
    from: "demo@crm.local",
    to,
    cc: "",
    bcc: "",
    subject: "",
    body: "",
    followUp: false,
    template: "",
  });
  const [showCc, setShowCc] = useState(false);

  useEffect(() => {
    if (open) setForm((f) => ({ ...f, to, subject: recordName ? `Re: ${recordName}` : "" }));
  }, [open, to, recordName]);

  async function send() {
    await supabase.from("activities").insert({
      activity_type: "email",
      subject: form.subject || "Email sent",
      body: `To: ${form.to}\n\n${form.body}`,
      related_to_type: "email",
      owner_name: "Demo User",
    });
    if (form.followUp) {
      await supabase.from("tasks").insert({
        subject: `Follow up: ${form.subject || recordName}`,
        status: "Not Started",
        priority: "Normal",
        due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      });
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Compose Email"
      width="xl"
      footer={
        <>
          <label className="mr-auto flex items-center gap-2 text-xs text-gray-600">
            <input type="checkbox" checked={form.followUp} onChange={(e) => setForm({ ...form, followUp: e.target.checked })} />
            Create follow-up task
          </label>
          <button className="crm-btn crm-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={send}>Send</button>
        </>
      }
    >
      <div className="space-y-3">
        <Row label="From">
          <select className="crm-input" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })}>
            <option>demo@crm.local</option>
            <option>sales@crm.local</option>
          </select>
        </Row>
        <Row label="To">
          <div className="flex gap-2">
            <input className="crm-input" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
            <button type="button" className="text-xs text-[var(--crm-blue)] whitespace-nowrap" onClick={() => setShowCc(!showCc)}>
              Cc/Bcc
            </button>
          </div>
        </Row>
        {showCc && (
          <>
            <Row label="Cc">
              <input className="crm-input" value={form.cc} onChange={(e) => setForm({ ...form, cc: e.target.value })} />
            </Row>
            <Row label="Bcc">
              <input className="crm-input" value={form.bcc} onChange={(e) => setForm({ ...form, bcc: e.target.value })} />
            </Row>
          </>
        )}
        <Row label="Template">
          <select className="crm-input" value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value, body: e.target.value === "intro" ? "Hi,\n\nThank you for your interest...\n\nBest regards" : form.body })}>
            <option value="">-None-</option>
            <option value="intro">Introduction</option>
            <option value="follow">Follow-up</option>
            <option value="quote">Quote attached</option>
          </select>
        </Row>
        <Row label="Subject">
          <input className="crm-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        </Row>
        <div className="flex gap-1 border border-b-0 border-gray-200 bg-gray-50 px-2 py-1 rounded-t">
          {[Bold, Italic, Underline, List, Link2, Paperclip].map((Icon, i) => (
            <button key={i} type="button" className="rounded p-1.5 text-gray-500 hover:bg-white">
              <Icon size={14} />
            </button>
          ))}
        </div>
        <textarea
          className="crm-input min-h-[180px] !rounded-t-none"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          placeholder="Write your message…"
        />
      </div>
    </Modal>
  );
}

/* ───────── Log Call ───────── */
export function LogCallModal({ open, onClose, contactName = "" }: { open: boolean; onClose: () => void; contactName?: string }) {
  const [form, setForm] = useState({
    subject: "",
    call_type: "Outbound",
    call_purpose: "Prospecting",
    call_start: new Date().toISOString().slice(0, 16),
    call_duration_minutes: "5",
    call_result: "",
    description: "",
    followUp: false,
  });

  async function save() {
    await supabase.from("calls").insert({
      subject: form.subject || `Call with ${contactName || "contact"}`,
      call_type: form.call_type,
      call_purpose: form.call_purpose,
      call_start: form.call_start,
      call_duration_minutes: Number(form.call_duration_minutes) || 0,
      call_result: form.call_result,
      description: form.description,
    });
    if (form.followUp) {
      await supabase.from("tasks").insert({
        subject: `Follow up call: ${form.subject}`,
        status: "Not Started",
        priority: "High",
        due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      });
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log a Call"
      width="lg"
      footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="crm-btn crm-btn-secondary" onClick={() => { setForm({ ...form, followUp: true }); save(); }}>
            Save & Follow-up
          </button>
          <button className="crm-btn crm-btn-primary" onClick={save}>Save</button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Subject" full>
          <input className="crm-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Call subject" />
        </Field>
        <Field label="Call Type">
          <select className="crm-input" value={form.call_type} onChange={(e) => setForm({ ...form, call_type: e.target.value })}>
            <option>Outbound</option><option>Inbound</option><option>Missed</option>
          </select>
        </Field>
        <Field label="Call Purpose">
          <select className="crm-input" value={form.call_purpose} onChange={(e) => setForm({ ...form, call_purpose: e.target.value })}>
            <option>Prospecting</option><option>Administrative</option><option>Negotiation</option><option>Demo</option><option>Project</option><option>Support</option>
          </select>
        </Field>
        <Field label="Call Start Time">
          <input type="datetime-local" className="crm-input" value={form.call_start} onChange={(e) => setForm({ ...form, call_start: e.target.value })} />
        </Field>
        <Field label="Call Duration (min)">
          <input type="number" className="crm-input" value={form.call_duration_minutes} onChange={(e) => setForm({ ...form, call_duration_minutes: e.target.value })} />
        </Field>
        <Field label="Call Result" full>
          <input className="crm-input" value={form.call_result} onChange={(e) => setForm({ ...form, call_result: e.target.value })} placeholder="Interested / Left voicemail / …" />
        </Field>
        <Field label="Description" full>
          <textarea className="crm-input min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}

/* ───────── Convert Lead ───────── */
export function ConvertLeadModal({
  open,
  onClose,
  lead,
  onConverted,
}: {
  open: boolean;
  onClose: () => void;
  lead: Record<string, unknown> | null;
  onConverted?: () => void;
}) {
  const [createDeal, setCreateDeal] = useState(true);
  const [dealName, setDealName] = useState("");
  const [amount, setAmount] = useState("");
  const [stage, setStage] = useState("Qualification");
  const [closing, setClosing] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [owner, setOwner] = useState("Demo User");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setDealName(`${lead.company || fullName(lead.first_name as string, lead.last_name as string)} - Deal`);
    }
  }, [lead]);

  if (!lead) return null;

  async function convert() {
    setSaving(true);
    const { data: account } = await supabase
      .from("accounts")
      .insert({
        account_name: (lead!.company as string) || fullName(lead!.first_name as string, lead!.last_name as string),
        phone: lead!.phone as string,
        website: lead!.website as string,
        industry: lead!.industry as string,
        account_owner: owner,
      })
      .select("id")
      .single();

    const { data: contact } = await supabase
      .from("contacts")
      .insert({
        first_name: lead!.first_name as string,
        last_name: lead!.last_name as string,
        email: lead!.email as string,
        phone: lead!.phone as string,
        title: lead!.title as string,
        account_id: account?.id,
        lead_source: lead!.lead_source as string,
        contact_owner: owner,
      })
      .select("id")
      .single();

    if (createDeal) {
      await supabase.from("deals").insert({
        deal_name: dealName,
        amount: amount ? Number(amount) : 0,
        stage,
        closing_date: closing,
        account_id: account?.id,
        contact_id: contact?.id,
        lead_source: lead!.lead_source as string,
        deal_owner: owner,
        probability: 10,
      });
    }

    await supabase.from("leads").update({ converted: true, lead_status: "Qualified" }).eq("id", lead!.id);
    await supabase.from("activities").insert({
      activity_type: "convert",
      subject: "Lead Converted",
      body: `Converted ${fullName(lead!.first_name as string, lead!.last_name as string)} to Contact/Account`,
      related_to_type: "lead",
      related_to_id: lead!.id as string,
    });
    setSaving(false);
    onConverted?.();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Convert Lead"
      width="2xl"
      footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="crm-btn crm-btn-primary" disabled={saving} onClick={convert}>
            {saving ? "Converting…" : "Convert"}
          </button>
        </>
      }
    >
      <p className="mb-4 text-sm text-gray-600">
        Create new Contact & Account for <strong>{fullName(lead.first_name as string, lead.last_name as string)}</strong>
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Panel title="Contact">
          <Item label="First Name" value={String(lead.first_name || "")} />
          <Item label="Last Name" value={String(lead.last_name || "")} />
          <Item label="Email" value={String(lead.email || "")} />
          <Item label="Phone" value={String(lead.phone || "")} />
          <div className="mt-2 text-xs text-emerald-600">✓ Create new contact</div>
        </Panel>
        <Panel title="Account">
          <Item label="Account Name" value={String(lead.company || fullName(lead.first_name as string, lead.last_name as string))} />
          <Item label="Phone" value={String(lead.phone || "")} />
          <Item label="Website" value={String(lead.website || "")} />
          <div className="mt-2 text-xs text-emerald-600">✓ Create new account</div>
        </Panel>
      </div>
      <div className="mt-4 rounded border border-[var(--crm-border)] p-4">
        <label className="mb-3 flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={createDeal} onChange={(e) => setCreateDeal(e.target.checked)} />
          Create a new Deal for this Account
        </label>
        {createDeal && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Deal Name" full>
              <input className="crm-input" value={dealName} onChange={(e) => setDealName(e.target.value)} />
            </Field>
            <Field label="Amount">
              <input type="number" className="crm-input" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label="Closing Date">
              <input type="date" className="crm-input" value={closing} onChange={(e) => setClosing(e.target.value)} />
            </Field>
            <Field label="Stage">
              <select className="crm-input" value={stage} onChange={(e) => setStage(e.target.value)}>
                {DEAL_STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Owner">
              <input className="crm-input" value={owner} onChange={(e) => setOwner(e.target.value)} />
            </Field>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ───────── Manage Tags ───────── */
export function ManageTagsModal({
  open,
  onClose,
  recordIds,
  recordType,
}: {
  open: boolean;
  onClose: () => void;
  recordIds: string[];
  recordType: string;
}) {
  const [tags, setTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (!open) return;
    supabase.from("tags").select("*").then(({ data }) => setTags((data as typeof tags) || []));
  }, [open]);

  async function save() {
    for (const rid of recordIds) {
      for (const tid of selected) {
        await supabase.from("record_tags").insert({ tag_id: tid, record_type: recordType, record_id: rid });
      }
    }
    onClose();
  }

  async function createTag() {
    if (!newTag.trim()) return;
    const { data } = await supabase.from("tags").insert({ name: newTag.trim(), color: "#3b82f6" }).select("*").single();
    if (data) {
      setTags((t) => [...t, data as (typeof tags)[0]]);
      setSelected((s) => new Set(s).add((data as { id: string }).id));
      setNewTag("");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Manage Tags (${recordIds.length} record${recordIds.length > 1 ? "s" : ""})`}
      width="md"
      footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={save}>Save</button>
        </>
      }
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {tags.map((t) => {
          const on = selected.has(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                const n = new Set(selected);
                if (on) n.delete(t.id);
                else n.add(t.id);
                setSelected(n);
              }}
              className="rounded-full border px-3 py-1 text-xs font-medium"
              style={{
                borderColor: t.color,
                background: on ? t.color : "#fff",
                color: on ? "#fff" : t.color,
              }}
            >
              {t.name}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input className="crm-input" placeholder="Create new tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} />
        <button className="crm-btn crm-btn-secondary" onClick={createTag}>Create Tag</button>
      </div>
    </Modal>
  );
}

/* ───────── Change / Assign Owner ───────── */
export function ChangeOwnerModal({
  open,
  onClose,
  recordIds,
  table,
  ownerField = "lead_owner",
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  recordIds: string[];
  table: string;
  ownerField?: string;
  onDone?: () => void;
}) {
  const users = ["Demo User", "Alex Sales", "Sam Manager", "Jordan AE", "Riley Support"];
  const [owner, setOwner] = useState("Demo User");
  const [notify, setNotify] = useState(true);
  const [related, setRelated] = useState({ notes: true, attachments: true, activities: true });

  async function save() {
    await supabase.from(table).update({ [ownerField]: owner }).in("id", recordIds);
    if (notify) {
      await supabase.from("activities").insert({
        activity_type: "owner",
        subject: "Owner changed",
        body: `Assigned ${recordIds.length} ${table} to ${owner}`,
        related_to_type: table,
      });
    }
    onDone?.();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change Owner"
      width="md"
      footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={save}>Save</button>
        </>
      }
    >
      <p className="mb-3 text-sm text-gray-600">{recordIds.length} record(s) selected</p>
      <Field label="Change Owner">
        <select className="crm-input" value={owner} onChange={(e) => setOwner(e.target.value)}>
          {users.map((u) => <option key={u}>{u}</option>)}
        </select>
      </Field>
      <div className="mt-4 space-y-2 text-sm">
        <div className="font-medium text-gray-700">Also change owner for related records</div>
        {(["notes", "attachments", "activities"] as const).map((k) => (
          <label key={k} className="flex items-center gap-2 capitalize">
            <input type="checkbox" checked={related[k]} onChange={(e) => setRelated({ ...related, [k]: e.target.checked })} />
            {k}
          </label>
        ))}
        <label className="flex items-center gap-2 pt-2">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          Email owner about this transfer
        </label>
      </div>
    </Modal>
  );
}

/* ───────── Import Wizard ───────── */
export function ImportWizardModal({ open, onClose, moduleName }: { open: boolean; onClose: () => void; moduleName: string }) {
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState("");
  const [dup, setDup] = useState("skip");

  function reset() {
    setStep(1);
    setFileName("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={reset}
      title={`Import ${moduleName} — Step ${step} of 3`}
      width="lg"
      footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={reset}>Cancel</button>
          {step > 1 && <button className="crm-btn crm-btn-secondary" onClick={() => setStep(step - 1)}>Back</button>}
          {step < 3 ? (
            <button className="crm-btn crm-btn-primary" disabled={step === 1 && !fileName} onClick={() => setStep(step + 1)}>Next</button>
          ) : (
            <button className="crm-btn crm-btn-primary" onClick={async () => {
              await supabase.from("activities").insert({
                activity_type: "import",
                subject: `Import ${moduleName}`,
                body: `File: ${fileName}, duplicate handling: ${dup}`,
                related_to_type: "job",
              });
              reset();
            }}>Finish Import</button>
          )}
        </>
      }
    >
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Upload a CSV or XLSX file to import {moduleName}.</p>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-12">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
              className="text-sm"
            />
            {fileName && <p className="mt-3 text-sm font-medium text-[var(--crm-blue)]">{fileName}</p>}
          </div>
          <div className="text-xs text-gray-400">Supported: CSV, XLS, XLSX · Max 25MB · UTF-8 recommended</div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Map columns</p>
          <table className="crm-table text-xs">
            <thead>
              <tr><th>File Column</th><th>CRM Field</th></tr>
            </thead>
            <tbody>
              {["First Name", "Last Name", "Email", "Company", "Phone", "Lead Source"].map((c) => (
                <tr key={c}>
                  <td>{c}</td>
                  <td>
                    <select className="crm-input !py-1">
                      <option>{c}</option>
                      <option>-None-</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Duplicate handling</p>
          {[
            { v: "skip", l: "Skip duplicates" },
            { v: "overwrite", l: "Overwrite existing records" },
            { v: "clone", l: "Clone as new records" },
          ].map((o) => (
            <label key={o.v} className="flex items-center gap-2 text-sm">
              <input type="radio" name="dup" checked={dup === o.v} onChange={() => setDup(o.v)} />
              {o.l}
            </label>
          ))}
          <div className="mt-4 rounded bg-blue-50 p-3 text-sm text-blue-800">
            Ready to import <strong>{fileName}</strong> into {moduleName}. Job will appear under My Jobs.
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ───────── Upload Document ───────── */
export function UploadDocumentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ title: "", folder: "My Documents", description: "", access: "Everyone", file_name: "" });

  async function save() {
    await supabase.from("documents").insert({
      title: form.title || form.file_name || "Untitled",
      folder: form.folder,
      description: form.description,
      file_name: form.file_name,
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload Document"
      width="md"
      footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={save}>Upload</button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <input type="file" onChange={(e) => setForm({ ...form, file_name: e.target.files?.[0]?.name || "", title: form.title || e.target.files?.[0]?.name || "" })} />
        </div>
        <Field label="Name"><input className="crm-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Folder">
          <select className="crm-input" value={form.folder} onChange={(e) => setForm({ ...form, folder: e.target.value })}>
            <option>My Documents</option><option>Sales Collateral</option><option>Legal</option><option>Shared</option>
          </select>
        </Field>
        <Field label="Access Permissions">
          <select className="crm-input" value={form.access} onChange={(e) => setForm({ ...form, access: e.target.value })}>
            <option>Everyone</option><option>Selected Users</option><option>Just Me</option>
          </select>
        </Field>
        <Field label="Description"><textarea className="crm-input min-h-[60px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

/* ───────── Mass Create Tasks ───────── */
export function MassCreateTasksModal({
  open,
  onClose,
  count,
}: {
  open: boolean;
  onClose: () => void;
  count: number;
}) {
  const [subject, setSubject] = useState("Follow up");
  const [due, setDue] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [priority, setPriority] = useState("Normal");

  async function save() {
    const rows = Array.from({ length: count }, (_, i) => ({
      subject: `${subject} (${i + 1})`,
      due_date: due,
      priority,
      status: "Not Started",
    }));
    await supabase.from("tasks").insert(rows);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Create Tasks for ${count} record(s)`}
      width="md"
      footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={save}>Create Tasks</button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Subject"><input className="crm-input" value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
        <Field label="Due Date"><input type="date" className="crm-input" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
        <Field label="Priority">
          <select className="crm-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option>Highest</option><option>High</option><option>Normal</option><option>Low</option><option>Lowest</option>
          </select>
        </Field>
      </div>
    </Modal>
  );
}

/* helpers */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div>{children}</div>
    </div>
  );
}
function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="crm-label">{label}</label>
      {children}
    </div>
  );
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-[var(--crm-border)] p-3">
      <div className="mb-2 text-sm font-semibold text-[var(--crm-blue)]">{title}</div>
      {children}
    </div>
  );
}
function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-1.5 text-sm">
      <span className="text-gray-400">{label}: </span>
      <span>{value || "—"}</span>
    </div>
  );
}
