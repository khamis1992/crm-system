"use client";

import { useEffect, useState } from "react";
import { supabase, type Lead, type Deal, type CrmTask, type Meeting, type Contact } from "@/lib/supabase";
import { formatDate, formatDateTime, formatMoney, fullName } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";
import { Plus, MoreHorizontal } from "lucide-react";

const COLORS = ["#2c5cc5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

export default function HomePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [callsCount, setCallsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const allWidgets = [
    "My Jobs Today",
    "Leads Created",
    "My Contacts",
    "Deals Closed",
    "My Open Tasks",
    "My Meetings",
    "Recent Leads",
    "Open Deals",
    "Workspace Snapshot",
  ];
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
    if (typeof window === "undefined") return allWidgets;
    try {
      const s = localStorage.getItem("crm-home-widgets");
      if (s) return JSON.parse(s) as string[];
    } catch { /* ignore */ }
    return allWidgets;
  });

  function saveWidgets(next: string[]) {
    setVisibleWidgets(next);
    try {
      localStorage.setItem("crm-home-widgets", JSON.stringify(next));
    } catch { /* ignore */ }
    setCustomizeOpen(false);
  }

  const show = (name: string) => visibleWidgets.includes(name);

  useEffect(() => {
    (async () => {
      const [l, d, t, m, c, calls] = await Promise.all([
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("deals").select("*, accounts(account_name)").order("created_at", { ascending: false }),
        supabase.from("tasks").select("*").order("due_date", { ascending: true }),
        supabase.from("meetings").select("*").order("from_datetime", { ascending: true }),
        supabase.from("contacts").select("*").order("created_at", { ascending: false }),
        supabase.from("calls").select("id", { count: "exact", head: true }),
      ]);
      setLeads((l.data as Lead[]) || []);
      setDeals((d.data as Deal[]) || []);
      setTasks((t.data as CrmTask[]) || []);
      setMeetings((m.data as Meeting[]) || []);
      setContacts((c.data as Contact[]) || []);
      setCallsCount(calls.count || 0);
      setLoading(false);
    })();
  }, []);

  const leadsByStatus = Object.entries(
    leads.reduce<Record<string, number>>((acc, x) => {
      const s = x.lead_status || "Open";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const dealsByStage = Object.entries(
    deals.reduce<Record<string, number>>((acc, x) => {
      const s = x.stage || "Qualification";
      acc[s] = (acc[s] || 0) + Number(x.amount || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.split("/")[0], value }));

  const closedWon = deals.filter((d) => d.stage === "Closed Won");
  const pipeline = deals.filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost");

  if (loading) {
    return <div className="flex h-full items-center justify-center text-gray-400">Loading dashboard…</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Home</h1>
          <p className="text-xs text-gray-500">Sales dashboard · last 30 days</p>
        </div>
        <div className="flex gap-2">
          <button className="crm-btn crm-btn-secondary !text-xs" onClick={() => setCustomizeOpen(true)}>
            Customize
          </button>
          <Link href="/leads/new" className="crm-btn crm-btn-primary !text-xs">
            <Plus size={14} /> Create Lead
          </Link>
        </div>
      </div>

      {customizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setCustomizeOpen(false)}>
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-3 font-semibold">Customize Home</h2>
            <div className="max-h-72 space-y-2 overflow-auto">
              {allWidgets.map((w) => (
                <label key={w} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={visibleWidgets.includes(w)}
                    onChange={() =>
                      setVisibleWidgets((v) =>
                        v.includes(w) ? v.filter((x) => x !== w) : [...v, w]
                      )
                    }
                  />
                  {w}
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="crm-btn crm-btn-secondary" onClick={() => setCustomizeOpen(false)}>Cancel</button>
              <button className="crm-btn crm-btn-primary" onClick={() => saveWidgets(visibleWidgets)}>Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* My Jobs Today */}
        {show("My Jobs Today") && <Widget title="My Jobs Today">
          <div className="space-y-3 p-4">
            <JobRow label="Calls" count={callsCount} href="/calls" />
            <JobRow label="Tasks" count={tasks.filter((t) => !t.completed && t.status !== "Completed").length} href="/tasks" />
            <JobRow label="Meetings" count={meetings.length} href="/meetings" />
          </div>
        </Widget>}

        {/* Leads Created */}
        {show("Leads Created") && <Widget title="Leads Created" action={<Link href="/leads" className="text-xs text-[var(--crm-blue)]">View</Link>}>
          <div className="p-3">
            <div className="mb-2 text-2xl font-semibold text-[var(--crm-blue)]">{leads.length}</div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadsByStatus}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={50} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2c5cc5" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Widget>}

        {/* Contacts */}
        {show("My Contacts") && <Widget title="My Contacts" action={<Link href="/contacts" className="text-xs text-[var(--crm-blue)]">View</Link>}>
          <ul className="divide-y divide-gray-100">
            {contacts.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-[var(--crm-blue)]">
                  {(c.first_name?.[0] || "") + (c.last_name?.[0] || "")}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/contacts/${c.id}`} className="block truncate font-medium text-[var(--crm-blue)]">
                    {fullName(c.first_name, c.last_name)}
                  </Link>
                  <div className="truncate text-[11px] text-gray-500">{c.title || c.email}</div>
                </div>
              </li>
            ))}
            {contacts.length === 0 && <li className="px-4 py-6 text-center text-gray-400">No contacts</li>}
          </ul>
        </Widget>}

        {/* Deals Closed */}
        {show("Deals Closed") && <Widget title="Deals Closed" action={<Link href="/deals" className="text-xs text-[var(--crm-blue)]">View</Link>}>
          <div className="p-4">
            <div className="mb-1 text-2xl font-semibold text-emerald-600">
              {formatMoney(closedWon.reduce((s, d) => s + Number(d.amount || 0), 0))}
            </div>
            <div className="mb-3 text-xs text-gray-500">{closedWon.length} deals won · Pipeline {formatMoney(pipeline.reduce((s, d) => s + Number(d.amount || 0), 0))}</div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dealsByStage} dataKey="value" nameKey="name" innerRadius={40} outerRadius={60} paddingAngle={2}>
                    {dealsByStage.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatMoney(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Widget>}

        {/* Open Tasks */}
        {show("My Open Tasks") && <Widget title="My Open Tasks" action={<Link href="/tasks" className="text-xs text-[var(--crm-blue)]">View</Link>}>
          <ul className="divide-y divide-gray-100">
            {tasks.filter((t) => t.status !== "Completed").slice(0, 6).map((t) => (
              <li key={t.id} className="flex items-start gap-2 px-4 py-2.5">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={!!t.completed || t.status === "Completed"}
                  onChange={async (e) => {
                    const completed = e.target.checked;
                    await supabase.from("tasks").update({
                      completed,
                      status: completed ? "Completed" : "Not Started",
                    }).eq("id", t.id);
                    setTasks((prev) =>
                      prev.map((x) =>
                        x.id === t.id ? { ...x, completed, status: completed ? "Completed" : "Not Started" } : x
                      )
                    );
                  }}
                />
                <div className="min-w-0 flex-1">
                  <Link href={`/tasks/${t.id}`} className="block truncate font-medium text-[var(--crm-blue)]">
                    {t.subject}
                  </Link>
                  <div className="text-[11px] text-gray-500">
                    Due {formatDate(t.due_date)} · {t.priority}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Widget>}

        {/* Meetings */}
        {show("My Meetings") && <Widget title="My Meetings" action={<Link href="/meetings" className="text-xs text-[var(--crm-blue)]">View</Link>}>
          <ul className="divide-y divide-gray-100">
            {meetings.slice(0, 5).map((m) => (
              <li key={m.id} className="px-4 py-2.5">
                <Link href={`/meetings/${m.id}`} className="font-medium text-[var(--crm-blue)]">
                  {m.title}
                </Link>
                <div className="text-[11px] text-gray-500">
                  {formatDateTime(m.from_datetime)} · {m.location || "No location"}
                </div>
              </li>
            ))}
          </ul>
        </Widget>}

        {/* Recent Leads */}
        {show("Recent Leads") && <Widget title="Recent Leads" action={<Link href="/leads" className="text-xs text-[var(--crm-blue)]">View All</Link>}>
          <div className="overflow-x-auto">
            <table className="crm-table text-xs">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 6).map((l) => (
                  <tr key={l.id}>
                    <td>
                      <Link href={`/leads/${l.id}`}>{fullName(l.first_name, l.last_name)}</Link>
                    </td>
                    <td>{l.company || "—"}</td>
                    <td>
                      <StatusPill status={l.lead_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Widget>}

        {/* Pipeline Deals */}
        {show("Open Deals") && <Widget title="Open Deals" action={<Link href="/deals" className="text-xs text-[var(--crm-blue)]">View</Link>}>
          <ul className="divide-y divide-gray-100">
            {pipeline.slice(0, 6).map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                <div className="min-w-0">
                  <Link href={`/deals/${d.id}`} className="block truncate font-medium text-[var(--crm-blue)]">
                    {d.deal_name}
                  </Link>
                  <div className="text-[11px] text-gray-500">{d.stage}</div>
                </div>
                <div className="shrink-0 font-semibold text-emerald-700">{formatMoney(d.amount)}</div>
              </li>
            ))}
          </ul>
        </Widget>}

        {/* Quick stats */}
        {show("Workspace Snapshot") && <Widget title="Workspace Snapshot">
          <div className="grid grid-cols-2 gap-3 p-4">
            <Stat label="Leads" value={leads.length} href="/leads" />
            <Stat label="Contacts" value={contacts.length} href="/contacts" />
            <Stat label="Deals" value={deals.length} href="/deals" />
            <Stat label="Tasks" value={tasks.length} href="/tasks" />
          </div>
        </Widget>}
      </div>
    </div>
  );
}

function Widget({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="widget-card">
      <div className="widget-header">
        <span>{title}</span>
        <div className="flex items-center gap-2">
          {action}
          <MoreHorizontal size={14} className="text-gray-400" />
        </div>
      </div>
      {children}
    </div>
  );
}

function JobRow({ label, count, href }: { label: string; count: number; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded border border-gray-100 px-3 py-2 hover:bg-gray-50">
      <span className="text-sm">{label}</span>
      <span className="rounded-full bg-[var(--crm-blue-light)] px-2.5 py-0.5 text-xs font-semibold text-[var(--crm-blue)]">
        {count}
      </span>
    </Link>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-lg bg-[var(--crm-bg)] p-3 text-center hover:bg-blue-50">
      <div className="text-xl font-semibold text-[var(--crm-blue)]">{value}</div>
      <div className="text-[11px] text-gray-500">{label}</div>
    </Link>
  );
}

function StatusPill({ status }: { status: string | null }) {
  const colors: Record<string, string> = {
    Open: "bg-blue-100 text-blue-700",
    Contacted: "bg-indigo-100 text-indigo-700",
    Qualified: "bg-emerald-100 text-emerald-700",
    "Junk Lead": "bg-gray-100 text-gray-600",
    "Lost Lead": "bg-red-100 text-red-700",
  };
  const c = colors[status || ""] || "bg-gray-100 text-gray-600";
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${c}`}>{status || "—"}</span>;
}
