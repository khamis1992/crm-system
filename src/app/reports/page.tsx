"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, Plus, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

const FOLDERS = ["Created By Me", "Shared with Me", "Public Reports", "Favourites", "Recent Reports"];
const REPORTS = [
  { name: "Leads by Status", folder: "Public Reports", module: "Leads" },
  { name: "Leads by Source", folder: "Public Reports", module: "Leads" },
  { name: "Pipeline by Stage", folder: "Public Reports", module: "Deals" },
  { name: "Closed Deals this Month", folder: "Created By Me", module: "Deals" },
  { name: "Open Tasks by Priority", folder: "Created By Me", module: "Tasks" },
  { name: "Cases by Status", folder: "Shared with Me", module: "Cases" },
  { name: "Contacts by Account", folder: "Public Reports", module: "Contacts" },
  { name: "Sales Forecast", folder: "Favourites", module: "Forecasts" },
];

export default function ReportsPage() {
  const [folder, setFolder] = useState("Public Reports");
  const [builder, setBuilder] = useState(false);
  const [module, setModule] = useState("Leads");
  const [cols, setCols] = useState(["Name", "Email", "Status", "Owner"]);
  const [chart, setChart] = useState("Bar");

  const list = REPORTS.filter((r) => folder === "Recent Reports" || r.folder === folder);

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
          <button className="crm-btn crm-btn-primary" onClick={() => setBuilder(true)}>
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
                {list.map((r) => (
                  <tr key={r.name}>
                    <td>
                      <button className="flex items-center gap-2 font-medium text-[var(--crm-blue)]" onClick={() => setBuilder(true)}>
                        <BarChart3 size={14} /> {r.name}
                      </button>
                    </td>
                    <td>{r.module}</td>
                    <td>{r.folder}</td>
                    <td>
                      <Link href={r.module === "Deals" ? "/deals" : r.module === "Leads" ? "/leads" : "/analytics"} className="text-xs text-gray-400">
                        Run
                      </Link>
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
            <h2 className="font-semibold">Report Builder</h2>
            <div className="flex gap-2">
              <button className="crm-btn crm-btn-secondary" onClick={() => setBuilder(false)}>Cancel</button>
              <button className="crm-btn crm-btn-secondary">Run</button>
              <button className="crm-btn crm-btn-primary" onClick={() => setBuilder(false)}>Save</button>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-4 overflow-hidden">
            <div className="border-r p-3 text-xs">
              <label className="crm-label">Module</label>
              <select className="crm-input mb-3" value={module} onChange={(e) => setModule(e.target.value)}>
                {["Leads", "Contacts", "Accounts", "Deals", "Tasks", "Cases"].map((m) => <option key={m}>{m}</option>)}
              </select>
              <div className="mb-1 font-semibold">Columns</div>
              {["Name", "Email", "Phone", "Status", "Owner", "Amount", "Created Time", "Modified Time"].map((c) => (
                <label key={c} className="mb-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cols.includes(c)}
                    onChange={() => setCols(cols.includes(c) ? cols.filter((x) => x !== c) : [...cols, c])}
                  />
                  {c}
                </label>
              ))}
              <div className="mb-1 mt-3 font-semibold">Filters</div>
              <input className="crm-input !py-1" placeholder="Add filter…" />
            </div>
            <div className="col-span-2 overflow-auto p-4">
              <div className="mb-3 text-sm font-medium">{module} Report Preview</div>
              <table className="crm-table text-xs">
                <thead>
                  <tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      {cols.map((c) => (
                        <td key={c}>{c === "Amount" ? `$${(i * 12).toLocaleString()}000` : `Sample ${c} ${i}`}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-l p-3 text-xs">
              <div className="mb-2 font-semibold">Chart</div>
              <select className="crm-input mb-2" value={chart} onChange={(e) => setChart(e.target.value)}>
                {["Bar", "Line", "Pie", "Funnel", "Table"].map((c) => <option key={c}>{c}</option>)}
              </select>
              <label className="crm-label">X Axis</label>
              <select className="crm-input mb-2"><option>Status</option><option>Owner</option></select>
              <label className="crm-label">Y Axis</label>
              <select className="crm-input mb-2"><option>Record Count</option><option>Amount</option></select>
              <div className="mt-4 flex h-40 items-end justify-around rounded border bg-gray-50 p-2">
                {[40, 70, 55, 90, 30].map((h, i) => (
                  <div key={i} className="w-6 rounded-t bg-[var(--crm-blue)]" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="mt-1 text-center text-[10px] text-gray-400">{chart} chart preview</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
