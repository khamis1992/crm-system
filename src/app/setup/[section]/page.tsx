"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LEAD_STATUSES, DEAL_STAGES, supabase } from "@/lib/supabase";
import { MODULES } from "@/lib/modules";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { getSetting, saveSetting } from "@/lib/settings";
import { useAuth } from "@/lib/auth-context";

const titles: Record<string, string> = {
  "modules-fields": "Modules and Fields",
  layouts: "Layouts",
  home: "Customize Home Page",
  "detail-page": "Customize Detail Page",
  buttons: "Customize Buttons",
  pipelines: "Pipelines",
  stages: "Stages",
  users: "Users",
  roles: "Roles",
  profiles: "Profiles",
  sharing: "Data Sharing Settings",
  territories: "Territory Hierarchy",
  compliance: "Compliance Settings",
  email: "Email Configuration",
  "calendar-booking": "Calendar Booking",
  cadences: "Cadences",
  workflows: "Workflow Rules",
  blueprint: "Blueprint",
  "recycle-bin": "Recycle Bin",
  "audit-log": "Audit Log",
  storage: "Storage",
};

export default function SetupSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = use(params);
  const title = titles[section] || section;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-[var(--crm-border)] bg-white px-4 py-3">
        <Link href="/setup" className="rounded p-1 hover:bg-gray-100"><ArrowLeft size={18} /></Link>
        <div>
          <div className="text-xs text-gray-400">Setup</div>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {section === "modules-fields" && <ModulesFields />}
        {section === "stages" && <StagesAdmin />}
        {section === "pipelines" && <PipelinesAdmin />}
        {section === "users" && <UsersAdmin />}
        {section === "roles" && <RolesAdmin />}
        {section === "profiles" && <ProfilesAdmin />}
        {section === "sharing" && <SharingAdmin />}
        {section === "email" && <EmailAdmin />}
        {section === "layouts" && <LayoutsAdmin />}
        {section === "buttons" && <ButtonsAdmin />}
        {section === "home" && <HomeAdmin />}
        {section === "detail-page" && <DetailAdmin />}
        {section === "territories" && <TerritoriesAdmin />}
        {section === "compliance" && <ComplianceAdmin />}
        {section === "calendar-booking" && <BookingAdmin />}
        {section === "cadences" && <CadencesAdmin />}
        {section === "workflows" && <WorkflowsRedirect />}
        {section === "blueprint" && <BlueprintAdmin />}
        {section === "recycle-bin" && <RecycleBinAdmin />}
        {section === "audit-log" && <AuditLogAdmin />}
        {section === "storage" && <StorageAdmin />}
        {!titles[section] && <EmptyAdmin text="Section not found" />}
      </div>
    </div>
  );
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded border border-[var(--crm-border)] bg-white">
      <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-2.5">
        <span className="text-sm font-semibold text-[var(--crm-blue)]">{title}</span>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ModulesFields() {
  const { toast } = useToast();
  const mods = MODULES.filter((m) => m.table);
  return (
    <Card title="Modules">
      <table className="crm-table">
        <thead><tr><th>Module</th><th>API Name</th><th>Fields</th><th /></tr></thead>
        <tbody>
          {mods.map((m) => (
            <tr key={m.key}>
              <td className="font-medium">{m.label}</td>
              <td className="text-xs text-gray-500">{m.table}</td>
              <td>Standard + Custom</td>
              <td>
                <Link href={m.href} className="text-xs text-[var(--crm-blue)]" onClick={() => toast(`Opening ${m.label} fields via module list`, "info")}>
                  Manage Fields
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function StagesAdmin() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Lead Status">
        <table className="crm-table text-xs">
          <thead><tr><th>Status</th><th>Probability</th></tr></thead>
          <tbody>
            {LEAD_STATUSES.map((s, i) => (
              <tr key={s}><td>{s}</td><td>{Math.min(100, (i + 1) * 12)}%</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Deal Stages">
        <table className="crm-table text-xs">
          <thead><tr><th>Stage</th><th>Forecast Type</th><th>Probability</th></tr></thead>
          <tbody>
            {DEAL_STAGES.map((s) => (
              <tr key={s}>
                <td>{s}</td>
                <td>{s.includes("Won") ? "Closed" : s.includes("Lost") ? "Omitted" : "Pipeline"}</td>
                <td>{s.includes("Won") ? "100%" : s.includes("Lost") ? "0%" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function PipelinesAdmin() {
  const { toast } = useToast();
  const [rows, setRows] = useState<{ id: string; name: string; module: string; is_default: boolean; stages: unknown[] }[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("pipelines").select("*").order("created_at", { ascending: false });
    if (error) toast(error.message, "error");
    setRows(
      (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        module: p.module,
        is_default: !!p.is_default,
        stages: Array.isArray(p.stages) ? p.stages : [],
      }))
    );
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function create() {
    if (!name.trim()) return toast("Name required", "error");
    const { error } = await supabase.from("pipelines").insert({
      name,
      module: "deals",
      is_default: rows.length === 0,
      stages: DEAL_STAGES.map((s, i) => ({ name: s, prob: Math.min(100, (i + 1) * 12) })),
    });
    if (error) return toast(error.message, "error");
    toast("Pipeline created", "success");
    setOpen(false);
    setName("");
    load();
  }

  return (
    <>
      <Card title="Deal Pipelines" action={<button className="crm-btn crm-btn-primary !text-xs" onClick={() => setOpen(true)}>New Pipeline</button>}>
        <table className="crm-table">
          <thead><tr><th>Pipeline</th><th>Module</th><th>Stages</th><th>Default</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-gray-400">No pipelines</td></tr>}
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="font-medium text-[var(--crm-blue)]">{p.name}</td>
                <td>{p.module}</td>
                <td>{p.stages.length}</td>
                <td>{p.is_default ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="New Pipeline" width="md" footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={create}>Create</button>
        </>
      }>
        <label className="crm-label">Pipeline Name</label>
        <input className="crm-input" value={name} onChange={(e) => setName(e.target.value)} />
      </Modal>
    </>
  );
}

type UserRow = { name: string; email: string; role: string; status: string };

function UsersAdmin() {
  const { toast } = useToast();
  const { displayName, email } = useAuth();
  const [filter, setFilter] = useState("Active Users");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Standard" });

  useEffect(() => {
    getSetting<UserRow[]>("crm_users", []).then((list) => {
      const base: UserRow[] = [
        { name: displayName || "Demo User", email: email || "demo@crm.local", role: "Administrator", status: "Active" },
        ...list,
      ];
      const seen = new Set<string>();
      setUsers(base.filter((u) => {
        if (seen.has(u.email)) return false;
        seen.add(u.email);
        return true;
      }));
    });
  }, [displayName, email]);

  async function addUser() {
    if (!form.email.trim() || !form.name.trim()) return toast("Name and email required", "error");
    const next = [...users, { ...form, status: "Confirm" }];
    setUsers(next);
    await saveSetting("crm_users", next.filter((u) => u.email !== (email || "demo@crm.local")));
    toast("User invited", "success");
    setOpen(false);
    setForm({ name: "", email: "", role: "Standard" });
  }

  const filtered = users.filter((u) => {
    if (filter === "Active Users") return u.status === "Active";
    if (filter === "Inactive Users") return u.status === "Inactive";
    if (filter === "Deleted Users") return u.status === "Deleted";
    return u.status === "Confirm";
  });

  return (
    <>
      <Card title="All Users" action={<button className="crm-btn crm-btn-primary !text-xs" onClick={() => setOpen(true)}>Add New User</button>}>
        <div className="mb-3 flex gap-2 text-xs">
          {["Active Users", "Inactive Users", "Deleted Users", "Confirm / Pending Invites"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded border px-2 py-1 hover:bg-gray-50 ${filter === f ? "border-[var(--crm-blue)] text-[var(--crm-blue)]" : ""}`}>{f}</button>
          ))}
        </div>
        <table className="crm-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.email}>
                <td className="font-medium text-[var(--crm-blue)]">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td><span className={`rounded px-2 py-0.5 text-xs ${u.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{u.status}</span></td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={4} className="py-6 text-center text-gray-400">No users in this view</td></tr>}
          </tbody>
        </table>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="Add New User" width="md" footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={addUser}>Invite</button>
        </>
      }>
        <div className="space-y-3">
          <div><label className="crm-label">Name</label><input className="crm-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="crm-label">Email</label><input className="crm-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div>
            <label className="crm-label">Role</label>
            <select className="crm-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {["Administrator", "Manager", "Standard", "Support"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </>
  );
}

function RolesAdmin() {
  const { toast } = useToast();
  const [roles, setRoles] = useState([
    { name: "CEO", reports: "—", users: 1 },
    { name: "Sales Manager", reports: "CEO", users: 2 },
    { name: "Sales Rep", reports: "Sales Manager", users: 8 },
    { name: "Support", reports: "CEO", users: 3 },
  ]);
  const [selected, setSelected] = useState(roles[1]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  async function addRole() {
    if (!name.trim()) return toast("Role name required", "error");
    const next = [...roles, { name, reports: "CEO", users: 0 }];
    setRoles(next);
    await saveSetting("crm_roles", next);
    toast("Role added", "success");
    setOpen(false);
    setName("");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Role Hierarchy" action={<button className="crm-btn crm-btn-primary !text-xs" onClick={() => setOpen(true)}>New Role</button>}>
        <ul className="space-y-2 text-sm">
          {roles.map((r, i) => (
            <li key={r.name}>
              <button
                style={{ paddingLeft: i * 12 }}
                className={`w-full rounded border border-gray-100 px-3 py-2 text-left hover:bg-blue-50 ${selected.name === r.name ? "border-[var(--crm-blue)] bg-blue-50" : ""}`}
                onClick={() => setSelected(r)}
              >
                <span className="font-medium text-[var(--crm-blue)]">{r.name}</span>
                <span className="ml-2 text-xs text-gray-400">{r.users} users</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Role Detail">
        <div className="space-y-2 text-sm">
          <div><span className="text-gray-400">Name:</span> {selected.name}</div>
          <div><span className="text-gray-400">Reports To:</span> {selected.reports}</div>
          <div><span className="text-gray-400">Share data with peers:</span> Yes</div>
          <Link href="/setup/users" className="crm-btn crm-btn-secondary mt-3 !text-xs inline-flex">Manage Users</Link>
        </div>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="New Role" width="sm" footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={addRole}>Create</button>
        </>
      }>
        <label className="crm-label">Role Name</label>
        <input className="crm-input" value={name} onChange={(e) => setName(e.target.value)} />
      </Modal>
    </div>
  );
}

function ProfilesAdmin() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState(["Administrator", "Standard", "Manager", "Support Agent", "Partner Portal", "Customer Portal"]);
  const [edit, setEdit] = useState<string | null>(null);
  const [perms, setPerms] = useState({ view: true, create: true, edit: true, delete: false, export: true });

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((p) => (
          <div key={p} className="rounded border border-[var(--crm-border)] bg-white p-4">
            <div className="font-medium text-[var(--crm-blue)]">{p}</div>
            <div className="mt-1 text-xs text-gray-500">Permissions profile</div>
            <button className="mt-3 text-xs text-[var(--crm-blue)]" onClick={() => setEdit(p)}>Edit Permissions</button>
          </div>
        ))}
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={`Edit Permissions — ${edit}`} width="md" footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={() => setEdit(null)}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={async () => {
            await saveSetting(`profile_perms_${edit}`, perms);
            toast("Permissions saved", "success");
            setEdit(null);
          }}>Save</button>
        </>
      }>
        <div className="space-y-2 text-sm">
          {Object.entries(perms).map(([k, v]) => (
            <label key={k} className="flex items-center gap-2 capitalize">
              <input type="checkbox" checked={v} onChange={(e) => setPerms({ ...perms, [k]: e.target.checked })} />
              {k}
            </label>
          ))}
        </div>
      </Modal>
    </>
  );
}

function SharingAdmin() {
  const { toast } = useToast();
  const mods = ["Leads", "Contacts", "Accounts", "Deals", "Tasks", "Cases"];
  const levels = ["Private", "Public Read Only", "Public Read/Write", "Public Read/Create/Edit/Delete"];
  const [access, setAccess] = useState<Record<string, string>>(() =>
    Object.fromEntries(mods.map((m, i) => [m, levels[i % levels.length]]))
  );

  useEffect(() => {
    getSetting<Record<string, string>>("sharing_defaults", access).then(setAccess);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    const { error } = await saveSetting("sharing_defaults", access);
    if (error) toast(error, "error");
    else toast("Sharing settings saved", "success");
  }

  return (
    <Card title="Default Organization Permissions" action={<button className="crm-btn crm-btn-primary !text-xs" onClick={save}>Save</button>}>
      <table className="crm-table text-xs">
        <thead><tr><th>Module</th><th>Default Access</th></tr></thead>
        <tbody>
          {mods.map((m) => (
            <tr key={m}>
              <td>{m}</td>
              <td>
                <select className="crm-input !py-1" value={access[m] || levels[0]} onChange={(e) => setAccess({ ...access, [m]: e.target.value })}>
                  {levels.map((l) => <option key={l}>{l}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="crm-btn crm-btn-secondary mt-3 !text-xs" onClick={() => toast("Sharing rules editor opened — defaults above apply org-wide", "info")}>
        Manage Sharing Rules
      </button>
    </Card>
  );
}

function EmailAdmin() {
  return (
    <div className="rounded border bg-white p-6 text-sm">
      <p className="text-gray-600">Full email configuration lives under Channels.</p>
      <Link href="/setup/email" className="crm-btn crm-btn-primary mt-4 !text-xs inline-flex">Open Email Configuration</Link>
    </div>
  );
}

function LayoutsAdmin() {
  const { toast } = useToast();
  const [layouts, setLayouts] = useState([
    { name: "Standard", module: "Leads" },
    { name: "Standard", module: "Contacts" },
    { name: "Standard", module: "Accounts" },
    { name: "Standard", module: "Deals" },
  ]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "Custom Layout", module: "Leads" });

  async function create() {
    const next = [...layouts, form];
    setLayouts(next);
    await saveSetting("page_layouts", next);
    toast("Layout created", "success");
    setOpen(false);
  }

  return (
    <>
      <Card title="Page Layouts" action={<button className="crm-btn crm-btn-primary !text-xs" onClick={() => setOpen(true)}>Create New Layout</button>}>
        <table className="crm-table">
          <thead><tr><th>Layout</th><th>Module</th><th>Profiles</th></tr></thead>
          <tbody>
            {layouts.map((l, i) => (
              <tr key={i}><td className="font-medium text-[var(--crm-blue)]">{l.name}</td><td>{l.module}</td><td>All Profiles</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="Create Layout" width="md" footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={create}>Create</button>
        </>
      }>
        <div className="space-y-3">
          <div><label className="crm-label">Name</label><input className="crm-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div>
            <label className="crm-label">Module</label>
            <select className="crm-input" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })}>
              {["Leads", "Contacts", "Accounts", "Deals", "Tasks"].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </>
  );
}

function ButtonsAdmin() {
  const { toast } = useToast();
  const [view, setView] = useState("List View Buttons");
  const [buttons, setButtons] = useState([
    { name: "Send Proposal", module: "Deals", action: "Open URL" },
    { name: "Qualify Lead", module: "Leads", action: "Update Field" },
  ]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", module: "Leads", action: "Open URL" });

  async function create() {
    if (!form.name.trim()) return toast("Button name required", "error");
    const next = [...buttons, form];
    setButtons(next);
    await saveSetting("custom_buttons", next);
    toast("Button created", "success");
    setOpen(false);
    setForm({ name: "", module: "Leads", action: "Open URL" });
  }

  return (
    <>
      <Card title="Custom Buttons" action={<button className="crm-btn crm-btn-primary !text-xs" onClick={() => setOpen(true)}>New Button</button>}>
        <div className="mb-3 flex gap-2 text-xs">
          {["List View Buttons", "Create/Clone Buttons", "Detail View Buttons"].map((t) => (
            <button key={t} onClick={() => setView(t)} className={`rounded border px-2 py-1 ${view === t ? "border-[var(--crm-blue)] text-[var(--crm-blue)]" : ""}`}>{t}</button>
          ))}
        </div>
        <table className="crm-table text-xs">
          <thead><tr><th>Button</th><th>Module</th><th>Action</th></tr></thead>
          <tbody>
            {buttons.map((b, i) => (
              <tr key={i}><td>{b.name}</td><td>{b.module}</td><td>{b.action}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="New Custom Button" width="md" footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={create}>Create</button>
        </>
      }>
        <div className="space-y-3">
          <div><label className="crm-label">Name</label><input className="crm-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div>
            <label className="crm-label">Module</label>
            <select className="crm-input" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })}>
              {["Leads", "Contacts", "Accounts", "Deals"].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="crm-label">Action</label>
            <select className="crm-input" value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })}>
              {["Open URL", "Update Field", "Invoke Function"].map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </>
  );
}

function HomeAdmin() {
  const { toast } = useToast();
  const widgets = ["My Jobs Today", "Leads Created", "My Contacts", "Deals Closed", "My Open Tasks", "My Meetings"];
  const [visible, setVisible] = useState<Record<string, boolean>>(() => Object.fromEntries(widgets.map((w) => [w, true])));

  useEffect(() => {
    getSetting<Record<string, boolean>>("home_widgets_setup", visible).then(setVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    await saveSetting("home_widgets_setup", visible);
    try {
      const list = widgets.filter((w) => visible[w]);
      localStorage.setItem("crm-home-widgets", JSON.stringify(list));
    } catch { /* ignore */ }
    toast("Home layout saved", "success");
  }

  return (
    <Card title="Home Components" action={<button className="crm-btn crm-btn-primary !text-xs" onClick={save}>Save</button>}>
      <ul className="space-y-2">
        {widgets.map((w) => (
          <li key={w} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
            <span>{w}</span>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={!!visible[w]} onChange={(e) => setVisible({ ...visible, [w]: e.target.checked })} /> Visible
            </label>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function DetailAdmin() {
  const { toast } = useToast();
  const [cfg, setCfg] = useState({ related: true, buttons: true, personalize: true });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {([
        ["related", "Related Lists"],
        ["buttons", "Buttons"],
        ["personalize", "Personalize View"],
      ] as const).map(([key, t]) => (
        <Card key={t} title={t}>
          <p className="text-sm text-gray-500">Configure {t.toLowerCase()} shown on record detail pages.</p>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={cfg[key]} onChange={(e) => setCfg({ ...cfg, [key]: e.target.checked })} /> Enabled
          </label>
          <button
            className="crm-btn crm-btn-secondary mt-3 !text-xs"
            onClick={async () => {
              await saveSetting("detail_page_config", cfg);
              toast(`${t} saved`, "success");
            }}
          >
            Configure
          </button>
        </Card>
      ))}
    </div>
  );
}

function TerritoriesAdmin() {
  const { toast } = useToast();
  const [territories, setTerritories] = useState(["Global", "  North America", "    West Coast", "    East Coast", "  EMEA", "  APAC"]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  async function add() {
    if (!name.trim()) return;
    const next = [...territories, `  ${name}`];
    setTerritories(next);
    await saveSetting("territories", next);
    toast("Territory added", "success");
    setOpen(false);
    setName("");
  }

  return (
    <>
      <Card title="Territories" action={<button className="crm-btn crm-btn-primary !text-xs" onClick={() => setOpen(true)}>Add Territory</button>}>
        <ul className="space-y-2 text-sm">
          {territories.map((t) => (
            <li key={t} className="rounded border border-gray-100 px-3 py-2 font-mono text-xs">{t}</li>
          ))}
        </ul>
        <Link href="/setup/users" className="crm-btn crm-btn-primary mt-3 !text-xs inline-flex">Assign Users</Link>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Territory" width="sm" footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={add}>Add</button>
        </>
      }>
        <label className="crm-label">Name</label>
        <input className="crm-input" value={name} onChange={(e) => setName(e.target.value)} />
      </Modal>
    </>
  );
}

function ComplianceAdmin() {
  const { toast } = useToast();
  const [form, setForm] = useState({ hipaa: false, tfa: true, gdpr: true });

  useEffect(() => {
    getSetting("compliance", form).then(setForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    await saveSetting("compliance", form);
    toast("Compliance settings saved", "success");
  }

  return (
    <Card title="Compliance" action={<button className="crm-btn crm-btn-primary !text-xs" onClick={save}>Save</button>}>
      <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.hipaa} onChange={(e) => setForm({ ...form, hipaa: e.target.checked })} /> Enable HIPAA fields</label>
      <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.tfa} onChange={(e) => setForm({ ...form, tfa: e.target.checked })} /> Require Two-Factor Authentication</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.gdpr} onChange={(e) => setForm({ ...form, gdpr: e.target.checked })} /> GDPR consent tracking</label>
    </Card>
  );
}

function BookingAdmin() {
  const { toast } = useToast();
  const [pages, setPages] = useState([
    { page: "Discovery Call", owner: "Demo User", status: "Active" },
    { page: "Product Demo", owner: "Alex Sales", status: "Active" },
  ]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { displayName } = useAuth();

  async function create() {
    if (!name.trim()) return toast("Name required", "error");
    const next = [...pages, { page: name, owner: displayName, status: "Active" }];
    setPages(next);
    await saveSetting("booking_pages", next);
    toast("Booking page created", "success");
    setOpen(false);
    setName("");
  }

  return (
    <>
      <Card title="Booking Pages" action={<button className="crm-btn crm-btn-primary !text-xs" onClick={() => setOpen(true)}>New Booking Page</button>}>
        <table className="crm-table text-xs">
          <thead><tr><th>Page</th><th>Owner</th><th>Status</th></tr></thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.page}><td>{p.page}</td><td>{p.owner}</td><td>{p.status}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="New Booking Page" width="sm" footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={create}>Create</button>
        </>
      }>
        <label className="crm-label">Page Name</label>
        <input className="crm-input" value={name} onChange={(e) => setName(e.target.value)} />
      </Modal>
    </>
  );
}

function CadencesAdmin() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("All Modules");
  const [cadences, setCadences] = useState<{ name: string; module: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", module: "Leads" });

  async function create() {
    if (!form.name.trim()) return toast("Name required", "error");
    const next = [...cadences, form];
    setCadences(next);
    await saveSetting("cadences", next);
    toast("Cadence created", "success");
    setOpen(false);
    setForm({ name: "", module: "Leads" });
  }

  const list = filter === "All Modules" ? cadences : cadences.filter((c) => c.module === filter);

  return (
    <>
      <Card title="Cadences" action={<button className="crm-btn crm-btn-primary !text-xs" onClick={() => setOpen(true)}>New Cadence</button>}>
        <div className="mb-3 flex gap-2 text-xs">
          {["All Modules", "Leads", "Contacts", "Deals"].map((t) => (
            <button key={t} onClick={() => setFilter(t)} className={`rounded border px-2 py-1 ${filter === t ? "border-[var(--crm-blue)] text-[var(--crm-blue)]" : ""}`}>{t}</button>
          ))}
        </div>
        {list.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No cadences yet. Create a sequence of emails, calls, and tasks.</p>
        ) : (
          <table className="crm-table text-xs">
            <thead><tr><th>Name</th><th>Module</th></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.name}><td>{c.name}</td><td>{c.module}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="New Cadence" width="md" footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={create}>Create</button>
        </>
      }>
        <div className="space-y-3">
          <div><label className="crm-label">Name</label><input className="crm-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div>
            <label className="crm-label">Module</label>
            <select className="crm-input" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })}>
              {["Leads", "Contacts", "Deals"].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </>
  );
}

function WorkflowsRedirect() {
  return (
    <div className="rounded border bg-white p-8 text-center">
      <p className="text-sm text-gray-600">Open the full workflow rule builder.</p>
      <Link href="/setup/workflows" className="crm-btn crm-btn-primary mt-4 !text-xs inline-flex">Open Workflow Builder</Link>
    </div>
  );
}

function BlueprintAdmin() {
  const { toast } = useToast();
  const [rows, setRows] = useState([
    { name: "Lead Qualification", module: "Leads", status: "Published" },
    { name: "Deal Closing", module: "Deals", status: "Draft" },
  ]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", module: "Leads" });

  async function create() {
    if (!form.name.trim()) return toast("Name required", "error");
    const next = [...rows, { ...form, status: "Draft" }];
    setRows(next);
    await saveSetting("blueprints", next);
    toast("Blueprint created", "success");
    setOpen(false);
  }

  return (
    <>
      <Card title="Blueprints" action={<button className="crm-btn crm-btn-primary !text-xs" onClick={() => setOpen(true)}>New Blueprint</button>}>
        <table className="crm-table text-xs">
          <thead><tr><th>Name</th><th>Module</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}><td>{r.name}</td><td>{r.module}</td><td>{r.status}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="New Blueprint" width="md" footer={
        <>
          <button className="crm-btn crm-btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
          <button className="crm-btn crm-btn-primary" onClick={create}>Create</button>
        </>
      }>
        <div className="space-y-3">
          <div><label className="crm-label">Name</label><input className="crm-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div>
            <label className="crm-label">Module</label>
            <select className="crm-input" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })}>
              {["Leads", "Deals", "Cases"].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </>
  );
}

function RecycleBinAdmin() {
  const { toast } = useToast();
  return (
    <div className="rounded border border-[var(--crm-border)] bg-white p-12 text-center">
      <div className="text-sm text-gray-400">Recycle Bin is empty. Deleted records appear here for 60 days.</div>
      <button className="crm-btn crm-btn-secondary mt-4 !text-xs" onClick={() => toast("No items to restore", "info")}>Refresh</button>
    </div>
  );
}

function AuditLogAdmin() {
  const [rows, setRows] = useState<{ time: string; user: string; action: string; module: string }[]>([]);

  useEffect(() => {
    supabase
      .from("activities")
      .select("created_at, owner_name, subject, activity_type, related_to_type")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setRows(
          (data || []).map((a) => ({
            time: new Date(a.created_at).toLocaleString(),
            user: a.owner_name || "System",
            action: a.subject || a.activity_type,
            module: a.related_to_type || "—",
          }))
        );
      });
  }, []);

  return (
    <Card title="Audit Log">
      <table className="crm-table text-xs">
        <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Module</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-400">No audit events yet</td></tr>}
          {rows.map((r, i) => (
            <tr key={i}><td>{r.time}</td><td>{r.user}</td><td>{r.action}</td><td>{r.module}</td></tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function StorageAdmin() {
  const [counts, setCounts] = useState({ docs: 0, activities: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("documents").select("id", { count: "exact", head: true }),
      supabase.from("activities").select("id", { count: "exact", head: true }),
    ]).then(([d, a]) => setCounts({ docs: d.count || 0, activities: a.count || 0 }));
  }, []);

  const usedMb = Math.max(1, counts.docs * 2 + counts.activities * 0.1);
  const pct = Math.min(100, Math.round((usedMb / 5120) * 100));

  return (
    <Card title="Storage Usage">
      <div className="mb-2 flex justify-between text-sm"><span>Used</span><span>{usedMb.toFixed(1)} MB / 5 GB</span></div>
      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full bg-[var(--crm-blue)]" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
        <div className="rounded bg-gray-50 p-3"><div className="font-semibold">{counts.docs}</div><div className="text-xs text-gray-400">Documents</div></div>
        <div className="rounded bg-gray-50 p-3"><div className="font-semibold">{counts.activities}</div><div className="text-xs text-gray-400">Activities</div></div>
        <div className="rounded bg-gray-50 p-3"><div className="font-semibold">{pct}%</div><div className="text-xs text-gray-400">Used</div></div>
      </div>
    </Card>
  );
}

function EmptyAdmin({ text }: { text: string }) {
  return <div className="rounded border border-[var(--crm-border)] bg-white p-12 text-center text-sm text-gray-400">{text}</div>;
}
