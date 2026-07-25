"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LEAD_STATUSES, DEAL_STAGES, supabase } from "@/lib/supabase";
import { MODULES } from "@/lib/modules";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

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
        {section === "workflows" && <SimpleTable title="Workflow Rules" cols={["Rule", "Module", "Status"]} rows={[["Notify owner on deal stage", "Deals", "Active"], ["Assign lead round-robin", "Leads", "Active"]]} />}
        {section === "blueprint" && <SimpleTable title="Blueprints" cols={["Name", "Module", "Status"]} rows={[["Lead Qualification", "Leads", "Published"], ["Deal Closing", "Deals", "Draft"]]} />}
        {section === "recycle-bin" && <EmptyAdmin text="Recycle Bin is empty. Deleted records appear here for 60 days." />}
        {section === "audit-log" && <SimpleTable title="Audit Log" cols={["Time", "User", "Action", "Module"]} rows={[["Jul 25, 10:12", "Demo User", "Created Lead", "Leads"], ["Jul 25, 09:40", "Demo User", "Updated Deal Stage", "Deals"]]} />}
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
              <td><button className="text-xs text-[var(--crm-blue)]">Manage Fields</button></td>
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

  useEffect(() => {
    load();
  }, [load]);

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
            {rows.length === 0 && (
              <tr><td colSpan={4} className="py-6 text-center text-gray-400">No pipelines — create one or run migration seed</td></tr>
            )}
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

function UsersAdmin() {
  const users = [
    { name: "Demo User", email: "demo@crm.local", role: "Administrator", status: "Active" },
    { name: "Alex Sales", email: "alex@crm.local", role: "Standard", status: "Active" },
    { name: "Sam Manager", email: "sam@crm.local", role: "Manager", status: "Active" },
    { name: "Pending Invite", email: "new@crm.local", role: "Standard", status: "Confirm" },
  ];
  return (
    <Card title="All Users" action={<button className="crm-btn crm-btn-primary !text-xs">Add New User</button>}>
      <div className="mb-3 flex gap-2 text-xs">
        {["Active Users", "Inactive Users", "Deleted Users", "Confirm / Pending Invites"].map((f) => (
          <button key={f} className="rounded border px-2 py-1 hover:bg-gray-50">{f}</button>
        ))}
      </div>
      <table className="crm-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.email}>
              <td className="font-medium text-[var(--crm-blue)]">{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td><span className={`rounded px-2 py-0.5 text-xs ${u.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{u.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function RolesAdmin() {
  const roles = [
    { name: "CEO", reports: "—", users: 1 },
    { name: "Sales Manager", reports: "CEO", users: 2 },
    { name: "Sales Rep", reports: "Sales Manager", users: 8 },
    { name: "Support", reports: "CEO", users: 3 },
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Role Hierarchy">
        <ul className="space-y-2 text-sm">
          {roles.map((r, i) => (
            <li key={r.name} style={{ paddingLeft: i * 16 }} className="rounded border border-gray-100 px-3 py-2">
              <span className="font-medium text-[var(--crm-blue)]">{r.name}</span>
              <span className="ml-2 text-xs text-gray-400">{r.users} users</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Role Detail">
        <div className="space-y-2 text-sm">
          <div><span className="text-gray-400">Name:</span> Sales Manager</div>
          <div><span className="text-gray-400">Reports To:</span> CEO</div>
          <div><span className="text-gray-400">Share data with peers:</span> Yes</div>
          <button className="crm-btn crm-btn-secondary mt-3 !text-xs">Manage Users</button>
        </div>
      </Card>
    </div>
  );
}

function ProfilesAdmin() {
  const profiles = ["Administrator", "Standard", "Manager", "Support Agent", "Partner Portal", "Customer Portal"];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {profiles.map((p) => (
        <div key={p} className="rounded border border-[var(--crm-border)] bg-white p-4">
          <div className="font-medium text-[var(--crm-blue)]">{p}</div>
          <div className="mt-1 text-xs text-gray-500">Permissions profile</div>
          <button className="mt-3 text-xs text-[var(--crm-blue)]">Edit Permissions</button>
        </div>
      ))}
    </div>
  );
}

function SharingAdmin() {
  const mods = ["Leads", "Contacts", "Accounts", "Deals", "Tasks", "Cases"];
  const levels = ["Private", "Public Read Only", "Public Read/Write", "Public Read/Create/Edit/Delete"];
  return (
    <Card title="Default Organization Permissions">
      <table className="crm-table text-xs">
        <thead><tr><th>Module</th><th>Default Access</th></tr></thead>
        <tbody>
          {mods.map((m, i) => (
            <tr key={m}>
              <td>{m}</td>
              <td>
                <select className="crm-input !py-1" defaultValue={levels[i % levels.length]}>
                  {levels.map((l) => <option key={l}>{l}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="crm-btn crm-btn-secondary mt-3 !text-xs">Manage Sharing Rules</button>
    </Card>
  );
}

function EmailAdmin() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Organization Emails" action={<button className="crm-btn crm-btn-primary !text-xs">Add Email</button>}>
        <table className="crm-table text-xs">
          <thead><tr><th>Email</th><th>Display Name</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>demo@crm.local</td><td>Demo User</td><td>Verified</td></tr>
            <tr><td>sales@crm.local</td><td>Sales Team</td><td>Verified</td></tr>
          </tbody>
        </table>
      </Card>
      <Card title="BCC Dropbox">
        <p className="text-sm text-gray-600">Forward emails to <code className="rounded bg-gray-100 px-1">dropbox@crm.local</code> to auto-attach to CRM records.</p>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked /> Enable BCC Dropbox
        </label>
      </Card>
    </div>
  );
}

function LayoutsAdmin() {
  return (
    <Card title="Page Layouts" action={<button className="crm-btn crm-btn-primary !text-xs">Create New Layout</button>}>
      <table className="crm-table">
        <thead><tr><th>Layout</th><th>Module</th><th>Profiles</th></tr></thead>
        <tbody>
          {["Leads", "Contacts", "Accounts", "Deals"].map((m) => (
            <tr key={m}><td className="font-medium text-[var(--crm-blue)]">Standard</td><td>{m}</td><td>All Profiles</td></tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function ButtonsAdmin() {
  return (
    <Card title="Custom Buttons" action={<button className="crm-btn crm-btn-primary !text-xs">New Button</button>}>
      <div className="mb-3 flex gap-2 text-xs">
        {["List View Buttons", "Create/Clone Buttons", "Detail View Buttons"].map((t) => (
          <button key={t} className="rounded border px-2 py-1">{t}</button>
        ))}
      </div>
      <table className="crm-table text-xs">
        <thead><tr><th>Button</th><th>Module</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>Send Proposal</td><td>Deals</td><td>Open URL</td></tr>
          <tr><td>Qualify Lead</td><td>Leads</td><td>Update Field</td></tr>
        </tbody>
      </table>
    </Card>
  );
}

function HomeAdmin() {
  const widgets = ["My Jobs Today", "Leads Created", "My Contacts", "Deals Closed", "My Open Tasks", "My Meetings"];
  return (
    <Card title="Home Components">
      <ul className="space-y-2">
        {widgets.map((w) => (
          <li key={w} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
            <span>{w}</span>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" defaultChecked /> Visible</label>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function DetailAdmin() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {["Related Lists", "Buttons", "Personalize View"].map((t) => (
        <Card key={t} title={t}>
          <p className="text-sm text-gray-500">Configure {t.toLowerCase()} shown on record detail pages.</p>
          <button className="crm-btn crm-btn-secondary mt-3 !text-xs">Configure</button>
        </Card>
      ))}
    </div>
  );
}

function TerritoriesAdmin() {
  return (
    <Card title="Territories">
      <ul className="space-y-2 text-sm">
        {["Global", "  North America", "    West Coast", "    East Coast", "  EMEA", "  APAC"].map((t) => (
          <li key={t} className="rounded border border-gray-100 px-3 py-2 font-mono text-xs">{t}</li>
        ))}
      </ul>
      <button className="crm-btn crm-btn-primary mt-3 !text-xs">Assign Users</button>
    </Card>
  );
}

function ComplianceAdmin() {
  return (
    <Card title="Compliance">
      <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" /> Enable HIPAA fields</label>
      <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Require Two-Factor Authentication</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> GDPR consent tracking</label>
    </Card>
  );
}

function BookingAdmin() {
  return (
    <Card title="Booking Pages" action={<button className="crm-btn crm-btn-primary !text-xs">New Booking Page</button>}>
      <table className="crm-table text-xs">
        <thead><tr><th>Page</th><th>Owner</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Discovery Call</td><td>Demo User</td><td>Active</td></tr>
          <tr><td>Product Demo</td><td>Alex Sales</td><td>Active</td></tr>
        </tbody>
      </table>
    </Card>
  );
}

function CadencesAdmin() {
  return (
    <Card title="Cadences" action={<button className="crm-btn crm-btn-primary !text-xs">New Cadence</button>}>
      <div className="mb-3 flex gap-2 text-xs">
        {["All Modules", "Leads", "Contacts", "Deals"].map((t) => (
          <button key={t} className="rounded border px-2 py-1">{t}</button>
        ))}
      </div>
      <p className="py-8 text-center text-sm text-gray-400">No cadences yet. Create a sequence of emails, calls, and tasks.</p>
    </Card>
  );
}

function StorageAdmin() {
  return (
    <Card title="Storage Usage">
      <div className="mb-2 flex justify-between text-sm"><span>Used</span><span>1.2 GB / 5 GB</span></div>
      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full w-[24%] bg-[var(--crm-blue)]" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
        <div className="rounded bg-gray-50 p-3"><div className="font-semibold">820 MB</div><div className="text-xs text-gray-400">Attachments</div></div>
        <div className="rounded bg-gray-50 p-3"><div className="font-semibold">280 MB</div><div className="text-xs text-gray-400">Emails</div></div>
        <div className="rounded bg-gray-50 p-3"><div className="font-semibold">100 MB</div><div className="text-xs text-gray-400">Other</div></div>
      </div>
    </Card>
  );
}

function SimpleTable({ title, cols, rows }: { title: string; cols: string[]; rows: string[][] }) {
  return (
    <Card title={title}>
      <table className="crm-table text-xs">
        <thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function EmptyAdmin({ text }: { text: string }) {
  return <div className="rounded border border-[var(--crm-border)] bg-white p-12 text-center text-sm text-gray-400">{text}</div>;
}
