"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { DataTable, type Column } from "@/components/DataTable";
import { FormSection, Field } from "@/components/FormShell";
import { BulkBar } from "@/components/ui/BulkBar";
import { Dropdown } from "@/components/ui/Dropdown";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/Modal";
import {
  ComposeEmailModal,
  ManageTagsModal,
  ChangeOwnerModal,
  ImportWizardModal,
  MassCreateTasksModal,
  ConvertLeadModal,
  UploadDocumentModal,
  LogCallModal,
} from "@/components/modals/CrmModals";
import {
  MassUpdateModal,
  ExportModal,
  FilterPanel,
  CreatePipelineWizard,
} from "@/components/modals/AdvancedModals";
import { formatDate, formatMoney, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";
import {
  Search,
  Plus,
  ChevronDown,
  MoreHorizontal,
  RefreshCw,
  List,
  LayoutGrid,
  Table2,
  Settings2,
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Printer,
  Download,
  Tag,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Filter,
  SlidersHorizontal,
} from "lucide-react";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "datetime-local" | "email" | "textarea" | "select" | "checkbox" | "money";
  required?: boolean;
  options?: string[];
  section?: string;
  list?: boolean;
  link?: boolean;
};

export type ModuleConfig = {
  table: string;
  title: string;
  href: string;
  createLabel: string;
  fields: FieldDef[];
  ownerField?: string;
  kanbanField?: string;
  kanbanStatuses?: string[];
  supportsConvert?: boolean;
  supportsEmail?: boolean;
  supportsUpload?: boolean;
};

function displayValue(field: FieldDef, row: Record<string, unknown>) {
  const v = row[field.key];
  if (v == null || v === "") return "—";
  if (field.type === "money") return formatMoney(Number(v));
  if (field.type === "date" || field.type === "datetime-local") return formatDate(String(v));
  if (field.type === "checkbox") return v ? "Yes" : "No";
  return String(v);
}

const PAGE_SIZES = [10, 25, 50, 100];

export function GenericListPage({ config }: { config: ModuleConfig }) {
  const { toast } = useToast();
  const { displayName } = useAuth();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"list" | "kanban" | "sheet">("list");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [systemView, setSystemView] = useState(`All ${config.title}`);
  const [sortKey, setSortKey] = useState("created_at");
  const [filters, setFilters] = useState<{ field: string; op: string; value: string }[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);

  const colStorageKey = `crm-cols-${config.table}`;
  const allListFields = config.fields.filter((f) => f.list !== false);
  const [visibleCols, setVisibleCols] = useState<string[]>(() => {
    if (typeof window === "undefined") return allListFields.slice(0, 8).map((f) => f.key);
    try {
      const saved = localStorage.getItem(colStorageKey);
      if (saved) return JSON.parse(saved) as string[];
    } catch { /* ignore */ }
    return allListFields.slice(0, 8).map((f) => f.key);
  });

  const [emailOpen, setEmailOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertLead, setConvertLead] = useState<Record<string, unknown> | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [massUpdateOpen, setMassUpdateOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);

  const listFields = allListFields.filter((f) => visibleCols.includes(f.key));
  const ownerField = config.ownerField || config.fields.find((f) => f.key.includes("owner"))?.key || "owner_name";

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from(config.table).select("*").order("created_at", { ascending: false });
    if (error) toast(error.message, "error");
    setRows((data as Record<string, unknown>[]) || []);
    setLoading(false);
  }, [config.table, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = [...rows];
    if (systemView.startsWith("My ")) {
      const me = displayName.toLowerCase();
      list = list.filter((r) => {
        const owner = String(r[ownerField] || "").toLowerCase();
        return owner.includes(me) || owner.includes("demo") || !owner;
      });
    }
    if (systemView === "Recently Created") {
      list = list.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    }
    if (systemView === "Recently Modified") {
      list = list.slice().sort((a, b) => String(b.updated_at || b.created_at).localeCompare(String(a.updated_at || a.created_at)));
    }
    if (systemView === "Unread Records") {
      list = list.filter((r) => r.read !== true && r.is_read !== true);
    }
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((r) => listFields.some((f) => String(r[f.key] ?? "").toLowerCase().includes(s)));
    }
    for (const f of filters) {
      if (!f.value && f.op !== "empty" && f.op !== "not_empty") continue;
      list = list.filter((r) => {
        const raw = r[f.field];
        const v = String(raw ?? "").toLowerCase();
        const val = f.value.toLowerCase();
        if (f.op === "is") return v === val;
        if (f.op === "isn't") return v !== val;
        if (f.op === "starts") return v.startsWith(val);
        if (f.op === "gt") return Number(r[f.field]) > Number(f.value);
        if (f.op === "lt") return Number(r[f.field]) < Number(f.value);
        if (f.op === "empty") return raw == null || v === "";
        if (f.op === "not_empty") return raw != null && v !== "";
        if (f.op === "touched") return !!r.updated_at && String(r.updated_at) !== String(r.created_at);
        if (f.op === "untouched") return !r.updated_at || String(r.updated_at) === String(r.created_at);
        return v.includes(val);
      });
    }
    list.sort((a, b) => String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? ""), undefined, { numeric: true }));
    return list;
  }, [rows, q, listFields, systemView, ownerField, filters, sortKey, displayName]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [q, pageSize, systemView]);

  const columns: Column<Record<string, unknown> & { id: string }>[] = listFields.map((f, i) => ({
    key: f.key,
    label: f.label,
    href: i === 0 || f.link ? (r) => `${config.href}/${r.id}` : undefined,
    render: (r) => displayValue(f, r),
  }));

  async function doDelete() {
    const { error } = await supabase.from(config.table).delete().in("id", [...selected]);
    if (error) {
      toast(error.message, "error");
      return;
    }
    toast(`Deleted ${selected.size} record(s)`, "success");
    setSelected(new Set());
    load();
  }

  function printPreview() {
    window.print();
  }

  function saveColumns(keys: string[]) {
    setVisibleCols(keys);
    try {
      localStorage.setItem(colStorageKey, JSON.stringify(keys));
    } catch { /* ignore */ }
    setColumnsOpen(false);
    toast("Columns updated", "success");
  }

  const actionItems = [
    { label: "Import", onClick: () => setImportOpen(true) },
    { label: "Export", onClick: () => setExportOpen(true) },
    { label: "Print View", onClick: printPreview },
    { label: "Mass Update", onClick: () => selected.size && setMassUpdateOpen(true), disabled: !selected.size },
    { divider: true, label: "" },
    { label: "Manage Tags", onClick: () => selected.size && setTagsOpen(true), disabled: !selected.size },
    { label: "Mass Delete", onClick: () => selected.size && setDeleteOpen(true), danger: true, disabled: !selected.size },
    { divider: true, label: "" },
    { label: "List View", onClick: () => setView("list"), checked: view === "list" },
    { label: "Sheet View", onClick: () => setView("sheet"), checked: view === "sheet" },
    { label: "Kanban / Canvas", onClick: () => setView("kanban"), checked: view === "kanban" },
    { divider: true, label: "" },
    { label: "Manage Columns", onClick: () => setColumnsOpen(true) },
    ...(config.table === "deals"
      ? [
          { label: "Manage Pipeline", onClick: () => setPipelineOpen(true) },
          { label: "Create Pipeline", onClick: () => setPipelineOpen(true) },
        ]
      : []),
  ];

  const viewOptions = [`All ${config.title}`, `My ${config.title}`, "Recently Created", "Recently Modified", "Unread Records"];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--crm-border)] bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">
            {config.title}
            <span className="ml-2 text-sm font-normal text-gray-500">({filtered.length} Records)</span>
          </h1>
          <Dropdown
            align="left"
            trigger={
              <button className="crm-btn crm-btn-secondary !py-1 !text-xs">
                {systemView} <ChevronDown size={12} />
              </button>
            }
            items={viewOptions.map((v) => ({
              label: v,
              checked: systemView === v,
              onClick: () => setSystemView(v),
            }))}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded border border-[var(--crm-border)]">
            <button title="List" onClick={() => setView("list")} className={cn("px-2.5 py-1.5", view === "list" ? "bg-[var(--crm-blue-light)] text-[var(--crm-blue)]" : "text-gray-500")}>
              <List size={14} />
            </button>
            <button title="Sheet" onClick={() => setView("sheet")} className={cn("border-l border-[var(--crm-border)] px-2.5 py-1.5", view === "sheet" ? "bg-[var(--crm-blue-light)] text-[var(--crm-blue)]" : "text-gray-500")}>
              <Table2 size={14} />
            </button>
            {config.kanbanField && (
              <button title="Kanban" onClick={() => setView("kanban")} className={cn("border-l border-[var(--crm-border)] px-2.5 py-1.5", view === "kanban" ? "bg-[var(--crm-blue-light)] text-[var(--crm-blue)]" : "text-gray-500")}>
                <LayoutGrid size={14} />
              </button>
            )}
          </div>
          <Dropdown
            trigger={<button className="crm-btn crm-btn-secondary !py-1.5"><SlidersHorizontal size={14} /> Sort</button>}
            items={listFields.map((f) => ({
              label: f.label,
              checked: sortKey === f.key,
              onClick: () => setSortKey(f.key),
            }))}
          />
          <button onClick={load} className="crm-btn crm-btn-secondary !py-1.5"><RefreshCw size={14} /></button>
          <Dropdown
            trigger={
              <button className="crm-btn crm-btn-secondary !py-1.5">
                <Settings2 size={14} /> Actions <ChevronDown size={12} />
              </button>
            }
            items={actionItems}
          />
          {config.supportsUpload && (
            <button className="crm-btn crm-btn-secondary" onClick={() => setUploadOpen(true)}>Upload</button>
          )}
          <Link href={`${config.href}/new`} className="crm-btn crm-btn-primary">
            <Plus size={14} /> {config.createLabel}
          </Link>
          <Dropdown
            trigger={<button className="crm-btn crm-btn-secondary !px-2"><MoreHorizontal size={14} /></button>}
            items={[
              { label: "Sheet View", href: "/sheets" },
              { label: "Customize", href: "/setup/layouts" },
              { label: "My Jobs", href: "/my-jobs" },
            ]}
          />
        </div>
      </div>

      <BulkBar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        onEmail={config.supportsEmail !== false ? () => setEmailOpen(true) : undefined}
        onTags={() => setTagsOpen(true)}
        onDelete={() => setDeleteOpen(true)}
        onAssignOwner={() => setOwnerOpen(true)}
        onCreateTasks={() => setTasksOpen(true)}
        onPrint={printPreview}
        onExport={() => setExportOpen(true)}
        onMassConvert={config.supportsConvert ? () => {
          const first = rows.find((r) => selected.has(String(r.id)));
          if (first) {
            setConvertLead(first);
            setConvertOpen(true);
          }
        } : undefined}
        extra={
          selected.size > 0 ? (
            <button onClick={() => setMassUpdateOpen(true)} className="inline-flex items-center gap-1.5 rounded border border-blue-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700">
              Mass Update
            </button>
          ) : null
        }
      />

      <div className="flex items-center gap-2 border-b border-[var(--crm-border)] bg-white px-4 py-2">
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={cn("crm-btn crm-btn-secondary !py-1.5 !text-xs", filterOpen && "bg-blue-50 text-[var(--crm-blue)]")}
        >
          <Filter size={13} /> Filter
        </button>
        <div className="relative max-w-xs flex-1">
          <Search size={13} className="absolute left-2.5 top-2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${config.title.toLowerCase()}…`} className="crm-input !py-1.5 pl-8" />
        </div>
        <span className="text-xs text-gray-400">Filtered By: {systemView}</span>
        {filters.map((f, i) => (
          <span key={i} className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-[var(--crm-blue)]">
            {f.field} {f.op} {f.value}
            <button className="ml-1" onClick={() => setFilters(filters.filter((_, j) => j !== i))}>×</button>
          </span>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        fields={listFields.map((f) => ({ key: f.key, label: f.label }))}
        onApply={setFilters}
      />
      <div className="flex-1 overflow-auto p-4">
        {!loading && filtered.length === 0 ? (
          <EmptyState
            title={`No ${config.title.toLowerCase()} found`}
            description={`Create your first record or import from CSV.`}
            actionLabel={config.createLabel}
            actionHref={`${config.href}/new`}
            illustration="📋"
          />
        ) : view === "sheet" ? (
          <div className="overflow-auto rounded border border-[var(--crm-border)] bg-white">
            <table className="crm-table text-xs">
              <thead>
                <tr>
                  <th style={{ width: 36 }} />
                  {listFields.map((f) => (
                    <th key={f.key}>{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((row) => (
                  <tr key={String(row.id)}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(String(row.id))}
                        onChange={(e) => {
                          const n = new Set(selected);
                          if (e.target.checked) n.add(String(row.id));
                          else n.delete(String(row.id));
                          setSelected(n);
                        }}
                      />
                    </td>
                    {listFields.map((f) => (
                      <td key={f.key}>
                        <input
                          className="w-full border-0 bg-transparent px-1 py-0.5 outline-none focus:bg-blue-50"
                          defaultValue={row[f.key] == null ? "" : String(row[f.key])}
                          onBlur={async (e) => {
                            const val = f.type === "number" || f.type === "money" ? Number(e.target.value) : e.target.value;
                            if (String(row[f.key] ?? "") !== String(e.target.value)) {
                              await supabase.from(config.table).update({ [f.key]: val }).eq("id", row.id);
                              load();
                            }
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t bg-blue-50 px-3 py-2">
              <Link href={`${config.href}/new`} className="text-xs font-medium text-[var(--crm-blue)]">
                + {config.createLabel}
              </Link>
            </div>
          </div>
        ) : view === "kanban" && config.kanbanField && config.kanbanStatuses ? (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {config.kanbanStatuses.map((status) => {
              const cards = filtered.filter((r) => String(r[config.kanbanField!] || config.kanbanStatuses![0]) === status);
              return (
                <div key={status} className="kanban-col">
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-xs font-semibold text-gray-700">{status}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-500">{cards.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto px-2 pb-2">
                    {cards.map((r) => {
                      const titleF = config.fields.find((f) => f.link || f.required) || config.fields[0];
                      return (
                        <div key={String(r.id)} className="kanban-card">
                          <Link href={`${config.href}/${r.id}`} className="mb-1 block font-medium text-[var(--crm-blue)]">
                            {displayValue(titleF, r)}
                          </Link>
                          <div className="text-[11px] text-gray-500">{String(r[ownerField] || "—")}</div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {config.kanbanStatuses!.filter((s) => s !== status).slice(0, 2).map((s) => (
                              <button
                                key={s}
                                className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] hover:bg-blue-100"
                                onClick={async () => {
                                  await supabase.from(config.table).update({ [config.kanbanField!]: s }).eq("id", r.id);
                                  load();
                                }}
                              >
                                → {s.split(/[\s/]/)[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={paged as (Record<string, unknown> & { id: string })[]}
              loading={loading}
              selected={selected}
              onSelect={(id, checked) => {
                const n = new Set(selected);
                if (checked) n.add(id);
                else n.delete(id);
                setSelected(n);
              }}
              onSelectAll={(checked) => setSelected(checked ? new Set(paged.map((r) => String(r.id))) : new Set())}
            />
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select className="crm-input !w-auto !py-1" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                  {PAGE_SIZES.map((n) => <option key={n}>{n}</option>)}
                </select>
                <span>per page · {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border p-1 disabled:opacity-30"><ChevronLeft size={14} /></button>
                <span className="px-2">Page {page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded border p-1 disabled:opacity-30"><ChevronRight size={14} /></button>
              </div>
            </div>
          </>
        )}
      </div>
      </div>

      <ComposeEmailModal open={emailOpen} onClose={() => setEmailOpen(false)} />
      <ManageTagsModal open={tagsOpen} onClose={() => setTagsOpen(false)} recordIds={[...selected]} recordType={config.table} />
      <ChangeOwnerModal open={ownerOpen} onClose={() => setOwnerOpen(false)} recordIds={[...selected]} table={config.table} ownerField={ownerField} onDone={load} />
      <ImportWizardModal open={importOpen} onClose={() => { setImportOpen(false); load(); }} moduleName={config.title} table={config.table} fields={config.fields.map((f) => ({ key: f.key, label: f.label, type: f.type }))} />
      <MassCreateTasksModal open={tasksOpen} onClose={() => setTasksOpen(false)} count={selected.size || 1} />
      <UploadDocumentModal open={uploadOpen} onClose={() => { setUploadOpen(false); load(); }} />
      <ConvertLeadModal open={convertOpen} onClose={() => setConvertOpen(false)} lead={convertLead} onConverted={load} />
      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={doDelete} title="Delete records" message={`Permanently delete ${selected.size} record(s)?`} confirmLabel="Delete" danger />
      <MassUpdateModal
        open={massUpdateOpen}
        onClose={() => setMassUpdateOpen(false)}
        table={config.table}
        recordIds={[...selected]}
        fields={config.fields.map((f) => ({ key: f.key, label: f.label, type: f.type, options: f.options ? [...f.options] : undefined }))}
        onDone={load}
      />
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        moduleName={config.title}
        fields={config.fields.map((f) => ({ key: f.key, label: f.label }))}
        rows={selected.size ? filtered.filter((r) => selected.has(String(r.id))) : filtered}
      />
      <CreatePipelineWizard open={pipelineOpen} onClose={() => setPipelineOpen(false)} />
      <ManageColumnsModal
        open={columnsOpen}
        onClose={() => setColumnsOpen(false)}
        fields={allListFields.map((f) => ({ key: f.key, label: f.label }))}
        selected={visibleCols}
        onSave={saveColumns}
      />
    </div>
  );
}

function ManageColumnsModal({
  open,
  onClose,
  fields,
  selected,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  fields: { key: string; label: string }[];
  selected: string[];
  onSave: (keys: string[]) => void;
}) {
  const [keys, setKeys] = useState(selected);
  useEffect(() => {
    if (open) setKeys(selected);
  }, [open, selected]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage Columns"
      width="md"
      footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={() => onSave(keys.length ? keys : selected)} disabled={!keys.length}>
            Apply
          </button>
        </>
      }
    >
      <p className="mb-3 text-xs text-gray-500">Choose which columns appear in the list view.</p>
      <div className="max-h-72 space-y-1 overflow-auto">
        {fields.map((f) => (
          <label key={f.key} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50">
            <input
              type="checkbox"
              checked={keys.includes(f.key)}
              onChange={() =>
                setKeys((k) => (k.includes(f.key) ? k.filter((x) => x !== f.key) : [...k, f.key]))
              }
            />
            {f.label}
          </label>
        ))}
      </div>
    </Modal>
  );
}

export function GenericFormPage({ config, id }: { config: ModuleConfig; id?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { displayName } = useAuth();
  const isEdit = !!id;
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    config.fields.forEach((f) => {
      init[f.key] = f.type === "checkbox" ? false : "";
    });
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (isEdit) return;
    const ownerKey = config.ownerField || config.fields.find((f) => f.key.includes("owner"))?.key;
    if (ownerKey) {
      setForm((s) => (s[ownerKey] ? s : { ...s, [ownerKey]: displayName }));
    }
  }, [isEdit, config.ownerField, config.fields, displayName]);

  useEffect(() => {
    if (!id) return;
    supabase
      .from(config.table)
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          const next: Record<string, unknown> = {};
          config.fields.forEach((f) => {
            const v = (data as Record<string, unknown>)[f.key];
            next[f.key] = v == null ? (f.type === "checkbox" ? false : "") : v;
          });
          setForm(next);
        }
        setLoaded(true);
      });
  }, [id, config]);

  const sections = useMemo(() => {
    const map = new Map<string, FieldDef[]>();
    config.fields.forEach((f) => {
      const s = f.section || "Information";
      if (!map.has(s)) map.set(s, []);
      map.get(s)!.push(f);
    });
    return [...map.entries()];
  }, [config.fields]);

  async function save(andNew = false) {
    const req = config.fields.find((f) => f.required);
    if (req && !String(form[req.key] ?? "").trim()) {
      setError(`${req.label} is required`);
      return;
    }
    setSaving(true);
    setError("");
    const payload: Record<string, unknown> = {};
    config.fields.forEach((f) => {
      let v = form[f.key];
      if (v === "") v = null;
      if ((f.type === "number" || f.type === "money") && v != null) v = Number(v);
      payload[f.key] = v;
    });

    if (isEdit) {
      const { error: err } = await supabase.from(config.table).update(payload).eq("id", id);
      setSaving(false);
      if (err) return setError(err.message);
      toast("Record updated", "success");
      router.push(`${config.href}/${id}`);
    } else {
      const { data, error: err } = await supabase.from(config.table).insert(payload).select("id").single();
      setSaving(false);
      if (err) return setError(err.message);
      toast("Record created", "success");
      if (andNew) {
        const init: Record<string, unknown> = {};
        config.fields.forEach((f) => { init[f.key] = f.type === "checkbox" ? false : ""; });
        const ownerKey = config.ownerField || config.fields.find((f) => f.key.includes("owner"))?.key;
        if (ownerKey) init[ownerKey] = displayName;
        setForm(init);
      } else {
        router.push(`${config.href}/${data.id}`);
      }
    }
  }

  if (!loaded) return <div className="p-8 text-gray-400">Loading…</div>;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--crm-border)] bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href={isEdit ? `${config.href}/${id}` : config.href} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-lg font-semibold">{isEdit ? `Edit ${config.title.slice(0, -1)}` : config.createLabel}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={isEdit ? `${config.href}/${id}` : config.href} className="crm-btn crm-btn-secondary">Cancel</Link>
          {!isEdit && (
            <button onClick={() => save(true)} disabled={saving} className="crm-btn crm-btn-secondary">Save and New</button>
          )}
          <button onClick={() => save(false)} disabled={saving} className="crm-btn crm-btn-primary">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl rounded border border-[var(--crm-border)] bg-white p-6 shadow-sm">
          {error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          {sections.map(([title, fields]) => (
            <FormSection key={title} title={title}>
              {fields.map((f) => (
                <Field key={f.key} label={f.label} required={f.required} full={f.type === "textarea"}>
                  <FieldInput field={f} value={form[f.key]} onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))} />
                </Field>
              ))}
            </FormSection>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GenericNewPage({ config }: { config: ModuleConfig }) {
  return <GenericFormPage config={config} />;
}

export function GenericEditPage({ config, id }: { config: ModuleConfig; id: string }) {
  return <GenericFormPage config={config} id={id} />;
}

export function GenericDetailPage({ config, id }: { config: ModuleConfig; id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<{ id: string; body: string; created_at: string }[]>([]);
  const [timeline, setTimeline] = useState<{ id: string; activity_type: string; subject: string | null; body: string | null; created_at: string }[]>([]);
  const [relatedLists, setRelatedLists] = useState<{
    tasks: { id: string; subject: string; status: string | null }[];
    calls: { id: string; subject: string }[];
    meetings: { id: string; title: string }[];
    emails: number;
    notes: number;
    docs: number;
  }>({ tasks: [], calls: [], meetings: [], emails: 0, notes: 0, docs: 0 });
  const [tab, setTab] = useState<"overview" | "timeline" | "related">("overview");
  const [quickTaskOpen, setQuickTaskOpen] = useState(false);
  const [quickTaskSubject, setQuickTaskSubject] = useState("Follow up");

  const load = useCallback(() => {
    supabase.from(config.table).select("*").eq("id", id).single().then(({ data }) => setRow(data as Record<string, unknown>));
  }, [config.table, id]);

  const loadRelated = useCallback(async () => {
    const [n, a, t, c, m, d] = await Promise.all([
      supabase.from("notes").select("id, body, created_at").eq("related_to_type", config.table).eq("related_to_id", id).order("created_at", { ascending: false }),
      supabase.from("activities").select("id, activity_type, subject, body, created_at").eq("related_to_type", config.table).eq("related_to_id", id).order("created_at", { ascending: false }).limit(50),
      supabase.from("tasks").select("id, subject, status").eq("related_to_type", config.table).eq("related_to_id", id).order("created_at", { ascending: false }).limit(20),
      supabase.from("calls").select("id, subject").eq("related_to_type", config.table).eq("related_to_id", id).order("created_at", { ascending: false }).limit(20),
      supabase.from("meetings").select("id, title").eq("related_to_type", config.table).eq("related_to_id", id).order("created_at", { ascending: false }).limit(20),
      supabase.from("documents").select("id", { count: "exact", head: true }),
    ]);
    setNotes((n.data as typeof notes) || []);
    setTimeline((a.data as typeof timeline) || []);
    const emailCount = ((a.data as typeof timeline) || []).filter((x) => x.activity_type === "email").length;
    setRelatedLists({
      tasks: (t.data as typeof relatedLists.tasks) || [],
      calls: (c.data as typeof relatedLists.calls) || [],
      meetings: (m.data as typeof relatedLists.meetings) || [],
      emails: emailCount,
      notes: n.data?.length || 0,
      docs: d.count || 0,
    });
  }, [config.table, id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadRelated(); }, [loadRelated]);

  async function remove() {
    const { error } = await supabase.from(config.table).delete().eq("id", id);
    if (error) return toast(error.message, "error");
    toast("Record deleted", "success");
    router.push(config.href);
  }

  async function saveNote() {
    if (!note.trim()) return;
    await supabase.from("notes").insert({
      title: "Note",
      body: note,
      related_to_type: config.table,
      related_to_id: id,
    });
    await supabase.from("activities").insert({
      activity_type: "note",
      subject: "Note added",
      body: note,
      related_to_type: config.table,
      related_to_id: id,
    });
    setNote("");
    toast("Note saved", "success");
    loadRelated();
  }

  function exportRecord() {
    if (!row) return;
    const cols = config.fields;
    const header = cols.map((c) => c.label).join(",");
    const body = cols.map((c) => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`).join(",");
    const blob = new Blob([header + "\n" + body], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${config.table}-${id}.csv`;
    a.click();
    toast("Exported CSV", "success");
  }

  if (!row) return <div className="p-8 text-gray-400">Loading…</div>;

  const titleField = config.fields.find((f) => f.link || f.required) || config.fields[0];
  const title = String(row[titleField.key] || config.title);
  const ownerField = config.ownerField || config.fields.find((f) => f.key.includes("owner"))?.key;
  const emailField = config.fields.find((f) => f.type === "email" || f.key === "email");

  const sections = new Map<string, FieldDef[]>();
  config.fields.forEach((f) => {
    const s = f.section || "Information";
    if (!sections.has(s)) sections.set(s, []);
    sections.get(s)!.push(f);
  });

  const stageField = config.kanbanField;
  const stages = config.kanbanStatuses || [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--crm-border)] bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href={config.href} className="rounded p-1 hover:bg-gray-100"><ArrowLeft size={18} /></Link>
          <div>
            <div className="text-xs text-gray-400">{config.title}</div>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {config.supportsEmail !== false && (
            <button className="crm-btn crm-btn-secondary" onClick={() => setEmailOpen(true)}><Mail size={14} /> Send Email</button>
          )}
          <button className="crm-btn crm-btn-secondary" onClick={() => setCallOpen(true)}><Phone size={14} /> Call</button>
          <Link href={`${config.href}/${id}/edit`} className="crm-btn crm-btn-secondary"><Edit size={14} /> Edit</Link>
          {config.supportsConvert && (
            <button className="crm-btn crm-btn-primary" onClick={() => setConvertOpen(true)}>Convert</button>
          )}
          <Dropdown
            trigger={<button className="crm-btn crm-btn-secondary !px-2"><MoreHorizontal size={14} /></button>}
            items={[
              { label: "Change Owner", onClick: () => setOwnerOpen(true), icon: <UserCog size={14} /> },
              { label: "Manage Tags", onClick: () => setTagsOpen(true), icon: <Tag size={14} /> },
              { label: "Clone", onClick: async () => {
                const clone = { ...row };
                delete clone.id;
                delete clone.created_at;
                delete clone.updated_at;
                const { data } = await supabase.from(config.table).insert(clone).select("id").single();
                if (data) router.push(`${config.href}/${data.id}`);
              }},
              { label: "Print Preview", onClick: () => window.print(), icon: <Printer size={14} /> },
              { label: "Export", onClick: exportRecord, icon: <Download size={14} /> },
              { divider: true, label: "" },
              { label: "Delete", onClick: () => setDeleteOpen(true), danger: true, icon: <Trash2 size={14} /> },
            ]}
          />
        </div>
      </div>

      {/* Stage bar for deals/leads */}
      {stageField && stages.length > 0 && (
        <div className="flex gap-1 overflow-x-auto border-b border-[var(--crm-border)] bg-white px-4 py-2">
          {stages.map((s) => {
            const active = String(row[stageField]) === s;
            return (
              <button
                key={s}
                onClick={async () => {
                  await supabase.from(config.table).update({ [stageField]: s }).eq("id", id);
                  load();
                }}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium",
                  active ? "bg-[var(--crm-blue)] text-white" : "bg-gray-100 text-gray-600 hover:bg-blue-50"
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-4 border-b border-[var(--crm-border)] bg-white px-4">
        {(["overview", "timeline", "related"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-3 py-2.5 text-sm capitalize",
              tab === t ? "border-[var(--crm-blue)] font-semibold text-[var(--crm-blue)]" : "border-transparent text-gray-500"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {tab === "overview" &&
            [...sections.entries()].map(([sec, fields]) => (
              <div key={sec} className="rounded border border-[var(--crm-border)] bg-white">
                <div className="border-b border-[var(--crm-border)] px-4 py-2.5 text-sm font-semibold text-[var(--crm-blue)]">{sec}</div>
                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                  {fields.map((f) => (
                    <div key={f.key}>
                      <div className="text-[11px] text-gray-400">{f.label}</div>
                      <div className="text-sm text-gray-800">{displayValue(f, row)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          {tab === "timeline" && (
            <div className="rounded border border-[var(--crm-border)] bg-white p-4 text-sm text-gray-500">
              Created {formatDate(String(row.created_at))} · Updated {formatDate(String(row.updated_at || row.created_at))}
              <div className="mt-4 space-y-2">
                {timeline.length === 0 && (
                  <>
                    <div className="rounded bg-gray-50 p-3">Record created · {formatDate(String(row.created_at))}</div>
                    <div className="rounded bg-gray-50 p-3">Last modified · {formatDate(String(row.updated_at || row.created_at))}</div>
                  </>
                )}
                {timeline.map((t) => (
                  <div key={t.id} className="rounded border border-gray-100 bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-700">{t.subject || t.activity_type}</span>
                      <span className="text-[11px] text-gray-400">{formatDate(t.created_at)}</span>
                    </div>
                    {t.body && <div className="mt-1 whitespace-pre-wrap text-xs text-gray-500">{t.body}</div>}
                    <div className="mt-1 text-[10px] uppercase tracking-wide text-gray-400">{t.activity_type}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "related" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                {[
                  { label: "Tasks", count: relatedLists.tasks.length, href: "/tasks" },
                  { label: "Calls", count: relatedLists.calls.length, href: "/calls" },
                  { label: "Meetings", count: relatedLists.meetings.length, href: "/meetings" },
                  { label: "Emails", count: relatedLists.emails, href: "/salesinbox" },
                  { label: "Notes", count: relatedLists.notes },
                  { label: "Documents", count: relatedLists.docs, href: "/documents" },
                ].map((r) => (
                  <div key={r.label} className="rounded border border-[var(--crm-border)] bg-white p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{r.label}</span>
                      <span className="font-semibold text-[var(--crm-blue)]">({r.count})</span>
                    </div>
                    {r.href && (
                      <Link href={r.href} className="mt-1 block text-[11px] text-[var(--crm-blue)]">View all →</Link>
                    )}
                  </div>
                ))}
              </div>
              <div className="rounded border border-[var(--crm-border)] bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold text-[var(--crm-blue)]">Open Tasks</div>
                  <button className="text-xs text-[var(--crm-blue)]" onClick={() => setQuickTaskOpen(true)}>+ Add Task</button>
                </div>
                {relatedLists.tasks.length === 0 && <div className="text-xs text-gray-400">No related tasks</div>}
                <ul className="space-y-1 text-sm">
                  {relatedLists.tasks.map((t) => (
                    <li key={t.id}>
                      <Link href={`/tasks/${t.id}`} className="text-[var(--crm-blue)]">{t.subject}</Link>
                      <span className="ml-2 text-[11px] text-gray-400">{t.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded border border-[var(--crm-border)] bg-white p-4">
                <div className="mb-2 text-sm font-semibold text-[var(--crm-blue)]">Calls</div>
                {relatedLists.calls.length === 0 && <div className="text-xs text-gray-400">No related calls — use Call button</div>}
                <ul className="space-y-1 text-sm">
                  {relatedLists.calls.map((c) => (
                    <li key={c.id}><Link href={`/calls/${c.id}`} className="text-[var(--crm-blue)]">{c.subject}</Link></li>
                  ))}
                </ul>
              </div>
              <div className="rounded border border-[var(--crm-border)] bg-white p-4">
                <div className="mb-2 text-sm font-semibold text-[var(--crm-blue)]">Meetings</div>
                {relatedLists.meetings.length === 0 && <div className="text-xs text-gray-400">No related meetings</div>}
                <ul className="space-y-1 text-sm">
                  {relatedLists.meetings.map((m) => (
                    <li key={m.id}><Link href={`/meetings/${m.id}`} className="text-[var(--crm-blue)]">{m.title}</Link></li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded border border-[var(--crm-border)] bg-white">
            <div className="border-b border-[var(--crm-border)] px-4 py-2.5 text-sm font-semibold text-[var(--crm-blue)]">Notes</div>
            <div className="p-4">
              <textarea className="crm-input min-h-[80px]" placeholder="Add a note…" value={note} onChange={(e) => setNote(e.target.value)} />
              <button className="crm-btn crm-btn-primary mt-2 !text-xs" onClick={saveNote}>Save Note</button>
              <div className="mt-3 max-h-48 space-y-2 overflow-auto">
                {notes.map((n) => (
                  <div key={n.id} className="rounded bg-gray-50 p-2 text-xs text-gray-600">
                    <div className="mb-0.5 text-[10px] text-gray-400">{formatDate(n.created_at)}</div>
                    {n.body}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded border border-[var(--crm-border)] bg-white">
            <div className="border-b border-[var(--crm-border)] px-4 py-2.5 text-sm font-semibold text-[var(--crm-blue)]">Stage History</div>
            <div className="space-y-2 p-4 text-xs text-gray-600">
              {stages.length ? stages.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", String(row[stageField!]) === s ? "bg-[var(--crm-blue)]" : i < stages.indexOf(String(row[stageField!] || "")) ? "bg-emerald-500" : "bg-gray-300")} />
                  {s}
                </div>
              )) : <div>No stage pipeline for this module</div>}
            </div>
          </div>
          <div className="rounded border border-[var(--crm-border)] bg-white p-4 text-xs text-gray-500">
            Owner: {ownerField ? String(row[ownerField] || "—") : "—"}
          </div>
        </div>
      </div>

      <ComposeEmailModal open={emailOpen} onClose={() => { setEmailOpen(false); loadRelated(); }} to={emailField ? String(row[emailField.key] || "") : ""} recordName={title} relatedType={config.table} relatedId={id} />
      <LogCallModal open={callOpen} onClose={() => { setCallOpen(false); loadRelated(); }} contactName={title} relatedType={config.table} relatedId={id} />
      <ManageTagsModal open={tagsOpen} onClose={() => setTagsOpen(false)} recordIds={[id]} recordType={config.table} />
      <ChangeOwnerModal open={ownerOpen} onClose={() => setOwnerOpen(false)} recordIds={[id]} table={config.table} ownerField={ownerField} onDone={load} />
      <ConvertLeadModal open={convertOpen} onClose={() => setConvertOpen(false)} lead={row} onConverted={() => router.push("/contacts")} />
      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={remove} title="Delete record" message="Are you sure you want to delete this record?" confirmLabel="Delete" danger />
      <Modal
        open={quickTaskOpen}
        onClose={() => setQuickTaskOpen(false)}
        title="Add Related Task"
        width="md"
        footer={
          <>
            <button className="crm-btn crm-btn-secondary" onClick={() => setQuickTaskOpen(false)}>Cancel</button>
            <button
              className="crm-btn crm-btn-primary"
              onClick={async () => {
                if (!quickTaskSubject.trim()) return toast("Subject required", "error");
                const { error } = await supabase.from("tasks").insert({
                  subject: quickTaskSubject,
                  status: "Not Started",
                  priority: "Normal",
                  related_to_type: config.table,
                  related_to_id: id,
                  due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
                });
                if (error) return toast(error.message, "error");
                toast("Task created", "success");
                setQuickTaskOpen(false);
                setQuickTaskSubject("Follow up");
                loadRelated();
              }}
            >
              Create
            </button>
          </>
        }
      >
        <label className="crm-label">Subject</label>
        <input className="crm-input" value={quickTaskSubject} onChange={(e) => setQuickTaskSubject(e.target.value)} />
      </Modal>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "textarea") {
    return <textarea className="crm-input min-h-[80px]" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
  }
  if (field.type === "select") {
    return (
      <select className="crm-input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
        <option value="">-None-</option>
        {(field.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> Yes
      </label>
    );
  }
  const inputType =
    field.type === "money" || field.type === "number" ? "number"
      : field.type === "date" ? "date"
        : field.type === "datetime-local" ? "datetime-local"
          : field.type === "email" ? "email" : "text";
  return (
    <input type={inputType} className="crm-input" value={value == null ? "" : String(value)} onChange={(e) => onChange(e.target.value)} />
  );
}
