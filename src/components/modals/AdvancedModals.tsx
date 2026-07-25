"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";

export function MassUpdateModal({
  open,
  onClose,
  table,
  recordIds,
  fields,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  table: string;
  recordIds: string[];
  fields: { key: string; label: string; type?: string; options?: string[] }[];
  onDone?: () => void;
}) {
  const [field, setField] = useState(fields[0]?.key || "");
  const [value, setValue] = useState("");
  const [confirm, setConfirm] = useState(false);
  const meta = fields.find((f) => f.key === field);

  async function apply() {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    let v: unknown = value;
    if (meta?.type === "number" || meta?.type === "money") v = Number(value);
    await supabase.from(table).update({ [field]: v }).in("id", recordIds);
    await supabase.from("activities").insert({
      activity_type: "mass_update",
      subject: `Mass updated ${recordIds.length} ${table}`,
      body: `${field} = ${value}`,
      related_to_type: table,
    });
    setConfirm(false);
    setValue("");
    onDone?.();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setConfirm(false);
        onClose();
      }}
      title={confirm ? "Confirm Mass Update" : "Mass Update"}
      width="md"
      footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={() => { setConfirm(false); onClose(); }}>Cancel</button>
          {confirm && <button className="crm-btn crm-btn-secondary" onClick={() => setConfirm(false)}>No</button>}
          <button className="crm-btn crm-btn-primary" onClick={apply} disabled={!field || value === ""}>
            {confirm ? "Yes, Update" : "Update"}
          </button>
        </>
      }
    >
      {confirm ? (
        <p className="text-sm text-gray-600">
          Update <strong>{recordIds.length}</strong> record(s): set <strong>{meta?.label || field}</strong> to{" "}
          <strong>{value}</strong>?
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{recordIds.length} record(s) selected</p>
          <div>
            <label className="crm-label">Select Field</label>
            <select className="crm-input" value={field} onChange={(e) => { setField(e.target.value); setValue(""); }}>
              {fields.map((f) => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="crm-label">New Value</label>
            {meta?.options ? (
              <select className="crm-input" value={value} onChange={(e) => setValue(e.target.value)}>
                <option value="">-None-</option>
                {meta.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input
                className="crm-input"
                type={meta?.type === "number" || meta?.type === "money" ? "number" : meta?.type === "date" ? "date" : "text"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            )}
          </div>
          <button type="button" className="text-xs text-[var(--crm-blue)]" onClick={() => setField(fields.find((f) => f.key.includes("owner"))?.key || field)}>
            Change Owner of the records…
          </button>
        </div>
      )}
    </Modal>
  );
}

export function ExportModal({
  open,
  onClose,
  moduleName,
  fields,
  rows,
}: {
  open: boolean;
  onClose: () => void;
  moduleName: string;
  fields: { key: string; label: string }[];
  rows: Record<string, unknown>[];
}) {
  const [format, setFormat] = useState<"CSV" | "XLS" | "VCF">("CSV");
  const [from, setFrom] = useState("All records");
  const [selected, setSelected] = useState<string[]>(fields.map((f) => f.key));

  function toggle(key: string) {
    setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));
  }

  function exportFile() {
    const cols = fields.filter((f) => selected.includes(f.key));
    const base = moduleName.toLowerCase().replace(/\s+/g, "-");
    let content = "";
    let mime = "text/csv";
    let ext = "csv";

    if (format === "VCF") {
      mime = "text/vcard";
      ext = "vcf";
      content = rows
        .map((r) => {
          const first = String(r.first_name ?? r.deal_name ?? r.account_name ?? r.subject ?? "");
          const last = String(r.last_name ?? "");
          const email = String(r.email ?? "");
          const phone = String(r.phone ?? r.mobile ?? "");
          const org = String(r.company ?? r.account_name ?? "");
          return [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `N:${last};${first};;;`,
            `FN:${[first, last].filter(Boolean).join(" ")}`,
            org ? `ORG:${org}` : "",
            email ? `EMAIL:${email}` : "",
            phone ? `TEL:${phone}` : "",
            "END:VCARD",
          ]
            .filter(Boolean)
            .join("\n");
        })
        .join("\n");
    } else {
      const header = cols.map((c) => c.label).join(format === "XLS" ? "\t" : ",");
      const body = rows
        .map((r) =>
          cols
            .map((c) => {
              const raw = String(r[c.key] ?? "").replace(/"/g, '""');
              return format === "XLS" ? raw : `"${raw}"`;
            })
            .join(format === "XLS" ? "\t" : ",")
        )
        .join("\n");
      content = header + "\n" + body;
      mime = format === "XLS" ? "application/vnd.ms-excel" : "text/csv";
      ext = format === "XLS" ? "xls" : "csv";
    }

    const blob = new Blob([content], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${base}-export.${ext}`;
    a.click();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Export ${moduleName}`}
      width="lg"
      footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={exportFile} disabled={!selected.length}>Export</button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="crm-label">Export From</label>
          <select className="crm-input" value={from} onChange={(e) => setFrom(e.target.value)}>
            <option>All records</option>
            <option>Selected records only</option>
            <option>Current page</option>
            <option>My records</option>
          </select>
          <label className="crm-label mt-3">Export As</label>
          <div className="flex gap-3 text-sm">
            {(["CSV", "XLS", "VCF"] as const).map((f) => (
              <label key={f} className="flex items-center gap-1.5">
                <input type="radio" checked={format === f} onChange={() => setFormat(f)} /> {f}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="crm-label">Fields ({selected.length} selected)</label>
          <div className="max-h-48 overflow-auto rounded border border-gray-200 p-2">
            {fields.map((f) => (
              <label key={f.key} className="flex items-center gap-2 py-1 text-sm">
                <input type="checkbox" checked={selected.includes(f.key)} onChange={() => toggle(f.key)} />
                {f.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function FilterPanel({
  open,
  onClose,
  fields,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  fields: { key: string; label: string }[];
  onApply: (filters: { field: string; op: string; value: string }[]) => void;
}) {
  const [field, setField] = useState(fields[0]?.key || "");
  const [op, setOp] = useState("contains");
  const [value, setValue] = useState("");

  if (!open) return null;

  return (
    <div className="w-72 shrink-0 border-r border-[var(--crm-border)] bg-white">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-semibold">Filters</span>
        <button className="text-xs text-gray-400" onClick={onClose}>Close</button>
      </div>
      <div className="p-3">
        <div className="mb-3 text-xs font-semibold uppercase text-gray-400">System Defined</div>
        {["Touched Records", "Untouched Records", "Locked Records", "Latest Email Status"].map((s) => (
          <button key={s} className="mb-1 block w-full rounded px-2 py-1.5 text-left text-xs hover:bg-blue-50">{s}</button>
        ))}
        <div className="mb-2 mt-4 text-xs font-semibold uppercase text-gray-400">Filter by Fields</div>
        <select className="crm-input mb-2 !py-1.5 text-xs" value={field} onChange={(e) => setField(e.target.value)}>
          {fields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
        </select>
        <select className="crm-input mb-2 !py-1.5 text-xs" value={op} onChange={(e) => setOp(e.target.value)}>
          <option value="contains">contains</option>
          <option value="is">is</option>
          <option value="isn't">isn't</option>
          <option value="starts">starts with</option>
          <option value="gt">greater than</option>
          <option value="lt">less than</option>
        </select>
        <input className="crm-input mb-3 !py-1.5 text-xs" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" />
        <button
          className="crm-btn crm-btn-primary w-full !text-xs"
          onClick={() => {
            onApply([{ field, op, value }]);
            onClose();
          }}
        >
          Apply Filter
        </button>
        <button
          className="crm-btn crm-btn-secondary mt-2 w-full !text-xs"
          onClick={() => {
            onApply([]);
            onClose();
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export function CreatePipelineWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [stages, setStages] = useState([
    { name: "Qualification", prob: 10 },
    { name: "Needs Analysis", prob: 20 },
    { name: "Proposal/Price Quote", prob: 75 },
    { name: "Negotiation/Review", prob: 90 },
    { name: "Closed Won", prob: 100 },
    { name: "Closed Lost", prob: 0 },
  ]);

  function reset() {
    setStep(1);
    setName("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={reset}
      title={`Create Pipeline — Step ${step} of 5`}
      width="xl"
      footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={reset}>Cancel</button>
          {step > 1 && <button className="crm-btn crm-btn-secondary" onClick={() => setStep(step - 1)}>Previous</button>}
          {step < 5 ? (
            <button className="crm-btn crm-btn-primary" disabled={step === 1 && !name.trim()} onClick={() => setStep(step + 1)}>Next</button>
          ) : (
            <button
              className="crm-btn crm-btn-primary"
              onClick={async () => {
                await supabase.from("pipelines").insert({
                  name,
                  module: "deals",
                  is_default: false,
                  stages,
                  description: desc,
                });
                await supabase.from("activities").insert({
                  activity_type: "pipeline",
                  subject: `Pipeline created: ${name}`,
                  body: JSON.stringify({ desc, stages }),
                  related_to_type: "setup",
                });
                reset();
              }}
            >
              Create
            </button>
          )}
        </>
      }
    >
      <div className="mb-4 flex gap-1">
        {["Layout & Stages", "Layout Rules", "Validation", "Wizard", "Review"].map((s, i) => (
          <div key={s} className={`flex-1 rounded px-2 py-1 text-center text-[10px] ${step === i + 1 ? "bg-[var(--crm-blue)] text-white" : "bg-gray-100 text-gray-500"}`}>
            {i + 1}. {s}
          </div>
        ))}
      </div>
      {step === 1 && (
        <div className="space-y-3">
          <div>
            <label className="crm-label">Pipeline Name *</label>
            <input className="crm-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="crm-label">Layout</label>
            <select className="crm-input"><option>Standard</option></select>
          </div>
          <div>
            <label className="crm-label">Description</label>
            <textarea className="crm-input min-h-[60px]" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div>
            <label className="crm-label">Deal Stages</label>
            <div className="space-y-2">
              {stages.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-4 text-gray-300">≡</span>
                  <input className="crm-input !py-1" value={s.name} onChange={(e) => {
                    const n = [...stages];
                    n[i] = { ...n[i], name: e.target.value };
                    setStages(n);
                  }} />
                  <input type="number" className="crm-input !w-20 !py-1" value={s.prob} onChange={(e) => {
                    const n = [...stages];
                    n[i] = { ...n[i], prob: Number(e.target.value) };
                    setStages(n);
                  }} />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              ))}
              <button type="button" className="text-xs text-[var(--crm-blue)]" onClick={() => setStages([...stages, { name: "New Stage", prob: 50 }])}>
                + Add stage
              </button>
            </div>
          </div>
        </div>
      )}
      {step === 2 && <EmptyStep title="Layout Rules" cta="Create Rule" />}
      {step === 3 && <EmptyStep title="Validation Rules" cta="Create Rule" />}
      {step === 4 && <EmptyStep title="Wizards" cta="New Wizard" />}
      {step === 5 && (
        <div className="space-y-2 text-sm">
          <div><span className="text-gray-400">Name:</span> {name}</div>
          <div><span className="text-gray-400">Layout:</span> Standard</div>
          <div><span className="text-gray-400">Description:</span> {desc || "—"}</div>
          <div className="flex flex-wrap gap-1 pt-2">
            {stages.map((s) => (
              <span key={s.name} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{s.name} ({s.prob}%)</span>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

function EmptyStep({ title, cta }: { title: string; cta: string }) {
  return (
    <div className="py-12 text-center">
      <div className="mb-2 text-3xl">📋</div>
      <div className="font-medium">No {title} found</div>
      <p className="mt-1 text-sm text-gray-500">Optional — skip or add later in Setup</p>
      <button type="button" className="crm-btn crm-btn-secondary mt-4 !text-xs">+ {cta}</button>
    </div>
  );
}
