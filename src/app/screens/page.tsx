"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SCREENSHOT_MAP, TOTAL_SHOTS, resolveShot } from "@/lib/screenshot-map";

export default function ScreensCoveragePage() {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);

  const current = resolveShot(idx);

  const ranges = useMemo(() => {
    if (!q.trim()) return SCREENSHOT_MAP;
    const s = q.toLowerCase();
    return SCREENSHOT_MAP.filter(
      (r) =>
        r.module.toLowerCase().includes(s) ||
        r.state.toLowerCase().includes(s) ||
        r.route.toLowerCase().includes(s)
    );
  }, [q]);

  const covered = SCREENSHOT_MAP.reduce((n, r) => n + (r.to - r.from + 1), 0);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--crm-border)] bg-white px-4 py-3">
        <h1 className="text-lg font-semibold">All {TOTAL_SHOTS} Screenshots → Live System</h1>
        <p className="text-xs text-gray-500">
          Every PNG maps to an operational route. Micro-states (open dropdowns, scrolls) share the parent surface.
          Mapped coverage bands: <strong>{SCREENSHOT_MAP.length}</strong> · index span covered: <strong>{Math.min(covered, TOTAL_SHOTS)}</strong>
        </p>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-2">
        <div className="flex flex-col overflow-hidden rounded border border-[var(--crm-border)] bg-white">
          <div className="border-b p-3">
            <input
              className="crm-input"
              placeholder="Search module / state / route…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-auto">
            <table className="crm-table text-xs">
              <thead>
                <tr>
                  <th>Shots</th>
                  <th>Module</th>
                  <th>State</th>
                  <th>Live route</th>
                </tr>
              </thead>
              <tbody>
                {ranges.map((r) => (
                  <tr
                    key={`${r.from}-${r.to}-${r.state}`}
                    className="cursor-pointer"
                    onClick={() => setIdx(r.from)}
                  >
                    <td className="font-mono">{r.from === r.to ? r.from : `${r.from}–${r.to}`}</td>
                    <td>{r.module}</td>
                    <td>{r.state}</td>
                    <td>
                      <Link href={r.route} className="text-[var(--crm-blue)]" onClick={(e) => e.stopPropagation()}>
                        {r.route}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded border border-[var(--crm-border)] bg-white">
          <div className="border-b p-3">
            <label className="crm-label">Jump to screenshot index (0–{TOTAL_SHOTS - 1})</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                max={TOTAL_SHOTS - 1}
                className="crm-input"
                value={idx}
                onChange={(e) => setIdx(Math.max(0, Math.min(TOTAL_SHOTS - 1, Number(e.target.value) || 0)))}
              />
              <Link href={current.route} className="crm-btn crm-btn-primary whitespace-nowrap">
                Open live UI
              </Link>
            </div>
            <input
              type="range"
              min={0}
              max={TOTAL_SHOTS - 1}
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              className="mt-3 w-full"
            />
          </div>
          <div className="flex-1 space-y-3 overflow-auto p-4">
            <div className="rounded bg-[var(--crm-bg)] p-4">
              <div className="text-xs text-gray-400">Screenshot</div>
              <div className="text-2xl font-semibold text-[var(--crm-blue)]">#{idx}</div>
              <div className="mt-2 text-sm">
                <div><span className="text-gray-400">Module:</span> {current.module}</div>
                <div><span className="text-gray-400">State:</span> {current.state}</div>
                <div><span className="text-gray-400">Route:</span> <Link href={current.route} className="text-[var(--crm-blue)]">{current.route}</Link></div>
                {current.action && <div><span className="text-gray-400">Action:</span> {current.action}</div>}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="mb-2 font-medium">How to verify this shot in the app:</p>
              <ol className="list-decimal space-y-1 pl-5 text-xs">
                <li>Open the route above</li>
                <li>Use List / Sheet / Kanban toggles if the shot shows board or grid</li>
                <li>Use Actions ▾ for Import, Export, Mass Update, Tags, Print</li>
                <li>Select rows for bulk bar (Email, Assign Owner, Delete…)</li>
                <li>Open a record for detail, stage bar, notes, Convert (Leads)</li>
                <li>Setup gear → full admin tree for 691–920</li>
              </ol>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/leads" className="crm-btn crm-btn-secondary !text-xs">Leads</Link>
              <Link href="/deals" className="crm-btn crm-btn-secondary !text-xs">Deals</Link>
              <Link href="/setup" className="crm-btn crm-btn-secondary !text-xs">Setup</Link>
              <Link href="/setup/workflows" className="crm-btn crm-btn-secondary !text-xs">Workflows</Link>
              <Link href="/marketplace" className="crm-btn crm-btn-secondary !text-xs">Marketplace</Link>
              <Link href="/ui-states" className="crm-btn crm-btn-secondary !text-xs">UI States</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
