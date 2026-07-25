"use client";

import { useEffect, useState } from "react";
import { supabase, type Activity } from "@/lib/supabase";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TABS = ["Import", "Export", "Mass Update", "Delete", "Deduplicate", "Backup", "Review Process", "Extract", "Enrich"];

export default function MyJobsPage() {
  const [tab, setTab] = useState("Import");
  const [jobs, setJobs] = useState<Activity[]>([]);

  useEffect(() => {
    supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setJobs((data as Activity[]) || []));
  }, []);

  const filtered = jobs.filter((j) => {
    const type = (j.activity_type || "").toLowerCase();
    const sub = (j.subject || "").toLowerCase();
    const body = (j.body || "").toLowerCase();
    const hay = `${type} ${sub} ${body}`;
    const map: Record<string, string[]> = {
      Import: ["import"],
      Export: ["export"],
      "Mass Update": ["mass_update", "mass update"],
      Delete: ["delete"],
      Deduplicate: ["dedup", "deduplicate"],
      Backup: ["backup"],
      "Review Process": ["review", "approval"],
      Extract: ["extract"],
      Enrich: ["enrich"],
    };
    const keys = map[tab] || [tab.toLowerCase()];
    return keys.some((k) => hay.includes(k));
  });

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--crm-border)] bg-white px-4 py-3">
        <h1 className="text-lg font-semibold">My Jobs</h1>
        <p className="text-xs text-gray-500">Track import, export, mass update and background jobs</p>
      </div>
      <div className="flex gap-1 overflow-x-auto border-b border-[var(--crm-border)] bg-white px-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm",
              tab === t ? "border-[var(--crm-blue)] font-semibold text-[var(--crm-blue)]" : "border-transparent text-gray-500"
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="overflow-hidden rounded border border-[var(--crm-border)] bg-white">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Type</th>
                <th>Status</th>
                <th>Started</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="!py-10 text-center text-gray-400">
                    No {tab.toLowerCase()} jobs yet. Start an import from any module Actions menu.
                  </td>
                </tr>
              )}
              {filtered.map((j) => (
                <tr key={j.id}>
                  <td className="font-medium text-[var(--crm-blue)]">{j.subject}</td>
                  <td>{j.activity_type}</td>
                  <td><span className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Completed</span></td>
                  <td>{formatDateTime(j.created_at)}</td>
                  <td className="max-w-xs truncate text-xs text-gray-500">{j.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
