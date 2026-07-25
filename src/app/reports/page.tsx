"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Plus, Folder, Trash2 } from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
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

const FOLDERS = ["Created By Me", "Shared with Me", "Public Reports", "Favourites", "Recent Reports"];
const MODULE_MAP: Record<string, { table: string; cols: { key: string; label: string }[] }> = {
  Leads: {
    table: "leads",
    cols: [
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "email", label: "Email" },
      { key: "company", label: "Company" },
      { key: "lead_status", label: "Status" },
      { key: "lead_source", label: "Source" },
      { key: "lead_owner", label: "Owner" },
      { key: "created_at", label: "Created Time" },
    ],
  },
  Contacts: {
    table: "contacts",
    cols: [
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "contact_owner", label: "Owner" },
      { key: "created_at", label: "Created Time" },
    ],
  },
  Accounts: {
    table: "accounts",
    cols: [
      { key: "account_name", label: "Name" },
      { key: "industry", label: "Industry" },
      { key: "phone", label: "Phone" },
      { key: "account_owner", label: "Owner" },
      { key: "created_at", label: "Created Time" },
    ],
  },
  Deals: {
    table: "deals",
    cols: [
      { key: "deal_name", label: "Name" },
      { key: "amount", label: "Amount" },
      { key: "stage", label: "Status" },
      { key: "deal_owner", label: "Owner" },
      { key: "closing_date", label: "Closing Date" },
      { key: "created_at", label: "Created Time" },
    ],
  },
  Tasks: {
    table: "tasks",
    cols: [
      { key: "subject", label: "Name" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "owner_name", label: "Owner" },
      { key: "due_date", label: "Due Date" },
    ],
  },
  Cases: {
    table: "cases",
    cols: [
      { key: "subject", label: "Name" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "case_origin", label: "Origin" },
      { key: "created_at", label: "Created Time" },
    ],
  },
};

const COLORS = ["#2c5cc5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

type ReportRow = {
  id: string;
  name: string;
  folder: string;
  module: string;
  columns: string[];
  chart_type: string;
  x_axis: string | null;
  y_axis: string | null;
};

export default function ReportsPage() {
  const { toast } = useToast();
  const [folder, setFolder] = useState("Public Reports");
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [builder, setBuilder] = useState(false);
  const [module, setModule] = useState("Leads");
  const [reportName, setReportName] = useState("Untitled Report");
  const [cols, setCols] = useState<string[]>(MODULE_MAP.Leads.cols.map((c) => c.key));
  const [chart, setChart] = useState("Bar");
  const [xAxis, setXAxis] = useState("lead_status");
  const [yAxis, setYAxis] = useState("Record Count");
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadReports = useCallback(async () => {
    const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
    if (error) {
      toast(error.message, "error");
      return;
    }
    setReports(
      (data || []).map((r) => ({
        id: r.id,
        name: r.name,
        folder: r.folder || "Created By Me",
        module: r.module,
        columns: Array.isArray(r.columns) ? r.columns : [],
        chart_type: r.chart_type || "Table",
        x_axis: r.x_axis,
        y_axis: r.y_axis,
      }))
    );
  }, [toast]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const list = reports.filter((r) => folder === "Recent Reports" || r.folder === folder);
  const moduleMeta = MODULE_MAP[module] || MODULE_MAP.Leads;

  const chartData = useMemo(() => {
    if (!preview.length || !xAxis) return [];
    const map: Record<string, number> = {};
    for (const row of preview) {
      const key = String(row[xAxis] ?? "—");
      if (yAxis === "Amount" && row.amount != null) {
        map[key] = (map[key] || 0) + Number(row.amount || 0);
      } else {
        map[key] = (map[key] || 0) + 1;
      }
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [preview, xAxis, yAxis]);

  async function runReport(modName = module, columnKeys = cols) {
    const meta = MODULE_MAP[modName] || MODULE_MAP.Leads;
    setRunning(true);
    const { data, error } = await supabase.from(meta.table).select("*").order("created_at", { ascending: false }).limit(200);
    setRunning(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    setPreview((data as Record<string, unknown>[]) || []);
    setCols(columnKeys.length ? columnKeys : meta.cols.map((c) => c.key));
    toast(`Report ran · ${(data || []).length} rows`, "success");
  }

  async function saveReport() {
    setSaving(true);
    const payload = {
      name: reportName || "Untitled Report",
      folder: "Created By Me",
      module: module.toLowerCase(),
      columns: cols,
      chart_type: chart,
      x_axis: xAxis,
      y_axis: yAxis,
    };
    // store module display name as used in UI
    const { error } = await supabase.from("reports").insert({
      ...payload,
      module,
    });
    setSaving(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    toast("Report saved", "success");
    setBuilder(false);
    loadReports();
  }

  async function deleteReport(id: string) {
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (error) return toast(error.message, "error");
    toast("Report deleted", "success");
    loadReports();
  }

  function openBuilder(r?: ReportRow) {
    if (r) {
      const modLabel =
        Object.keys(MODULE_MAP).find((k) => k.toLowerCase() === r.module.toLowerCase()) ||
        Object.keys(MODULE_MAP).find((k) => MODULE_MAP[k].table === r.module) ||
        "Leads";
      setModule(modLabel);
      setReportName(r.name);
      setCols(r.columns.length ? r.columns : MODULE_MAP[modLabel].cols.map((c) => c.key));
      setChart(r.chart_type || "Bar");
      setXAxis(r.x_axis || MODULE_MAP[modLabel].cols[0]?.key || "");
      setYAxis(r.y_axis || "Record Count");
      runReport(modLabel, r.columns);
    } else {
      setModule("Leads");
      setReportName("Untitled Report");
      setCols(MODULE_MAP.Leads.cols.map((c) => c.key));
      setChart("Bar");
      setXAxis("lead_status");
      setYAxis("Record Count");
      setPreview([]);
    }
    setBuilder(true);
  }

  const displayCols = moduleMeta.cols.filter((c) => cols.includes(c.key) || cols.includes(c.label));

  return (
    <div className="flex h-full">
      <aside className="w-52 shrink-0 border-r border-[var(--crm-border)] bg-white p-3">
        <div className="mb-2 text-xs font-semibold uppercase text-gray-400">Folders</div>
        {FOLDERS.map((f) => (
          <button
            key={f}
            onClick={() => setFolder(f)}
            className={cn(
              "mb-0.5 flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs",
              folder === f ? "bg-blue-50 font-medium text-[var(--crm-blue)]" : "hover:bg-gray-50"
            )}
          >
            <Folder size={12} /> {f}
          </button>
        ))}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b bg-white px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">Reports</h1>
            <p className="text-xs text-gray-500">{folder}</p>
          </div>
          <button className="crm-btn crm-btn-primary" onClick={() => openBuilder()}>
            <Plus size={14} /> Create Report
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="overflow-hidden rounded border bg-white">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Module</th>
                  <th>Folder</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No reports in this folder
                    </td>
                  </tr>
                )}
                {list.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <button
                        className="flex items-center gap-2 font-medium text-[var(--crm-blue)]"
                        onClick={() => openBuilder(r)}
                      >
                        <BarChart3 size={14} /> {r.name}
                      </button>
                    </td>
                    <td>{r.module}</td>
                    <td>{r.folder}</td>
                    <td className="flex items-center gap-2">
                      <button className="text-xs text-[var(--crm-blue)]" onClick={() => openBuilder(r)}>
                        Run
                      </button>
                      <button className="text-gray-400 hover:text-red-500" onClick={() => deleteReport(r.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {builder && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold">Report Builder</h2>
              <input
                className="crm-input !w-56 !py-1 text-sm"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button className="crm-btn crm-btn-secondary" onClick={() => setBuilder(false)}>
                Cancel
              </button>
              <button className="crm-btn crm-btn-secondary" disabled={running} onClick={() => runReport()}>
                {running ? "Running…" : "Run"}
              </button>
              <button className="crm-btn crm-btn-primary" disabled={saving} onClick={saveReport}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-4 overflow-hidden">
            <div className="overflow-auto border-r p-3 text-xs">
              <label className="crm-label">Module</label>
              <select
                className="crm-input mb-3"
                value={module}
                onChange={(e) => {
                  const m = e.target.value;
                  setModule(m);
                  setCols(MODULE_MAP[m].cols.map((c) => c.key));
                  setXAxis(MODULE_MAP[m].cols.find((c) => c.key.includes("status") || c.key === "stage")?.key || MODULE_MAP[m].cols[0].key);
                }}
              >
                {Object.keys(MODULE_MAP).map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <div className="mb-1 font-semibold">Columns</div>
              {moduleMeta.cols.map((c) => (
                <label key={c.key} className="mb-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cols.includes(c.key) || cols.includes(c.label)}
                    onChange={() =>
                      setCols((prev) =>
                        prev.includes(c.key) || prev.includes(c.label)
                          ? prev.filter((x) => x !== c.key && x !== c.label)
                          : [...prev, c.key]
                      )
                    }
                  />
                  {c.label}
                </label>
              ))}
            </div>
            <div className="col-span-2 overflow-auto p-4">
              <div className="mb-3 text-sm font-medium">
                {module} Report Preview · {preview.length} rows
              </div>
              <table className="crm-table text-xs">
                <thead>
                  <tr>
                    {(displayCols.length ? displayCols : moduleMeta.cols.slice(0, 4)).map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 25).map((row, i) => (
                    <tr key={i}>
                      {(displayCols.length ? displayCols : moduleMeta.cols.slice(0, 4)).map((c) => (
                        <td key={c.key}>
                          {c.key === "amount" ? formatMoney(Number(row[c.key] || 0)) : String(row[c.key] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {!preview.length && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        Click Run to load live data from Supabase
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="overflow-auto border-l p-3 text-xs">
              <div className="mb-2 font-semibold">Chart</div>
              <select className="crm-input mb-2" value={chart} onChange={(e) => setChart(e.target.value)}>
                {["Bar", "Pie", "Table"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <label className="crm-label">X Axis</label>
              <select className="crm-input mb-2" value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
                {moduleMeta.cols.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
              <label className="crm-label">Y Axis</label>
              <select className="crm-input mb-2" value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
                <option>Record Count</option>
                <option>Amount</option>
              </select>
              <div className="mt-4 h-48 rounded border bg-gray-50 p-2">
                {chart !== "Table" && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {chart === "Pie" ? (
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={70}>
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    ) : (
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#2c5cc5" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">Run report for chart</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
