"use client";

import Link from "next/link";

/** Maps screenshot inventory patterns → live app routes/components */
const COVERAGE = [
  {
    group: "Shell & Navigation",
    items: [
      { state: "App shell + sidebar modules", route: "/", status: "live" },
      { state: "Global search", route: "/", status: "live" },
      { state: "Global + Create menu", route: "/", status: "live" },
      { state: "Notifications panel", route: "/", status: "live" },
      { state: "Profile menu", route: "/", status: "live" },
      { state: "Waffle / app launcher", route: "/", status: "live" },
    ],
  },
  {
    group: "List / Collection",
    items: [
      { state: "Data table + checkboxes", route: "/leads", status: "live" },
      { state: "System view selector", route: "/leads", status: "live" },
      { state: "Bulk selection toolbar", route: "/leads", status: "live" },
      { state: "Kanban / Canvas board", route: "/leads", status: "live" },
      { state: "Pagination + page size", route: "/contacts", status: "live" },
      { state: "Actions: Import/Export/Print/Tags", route: "/leads", status: "live" },
      { state: "Empty + onboarding states", route: "/visits", status: "live" },
      { state: "My Jobs monitor tabs", route: "/my-jobs", status: "live" },
      { state: "Approvals queues", route: "/approvals", status: "live" },
      { state: "Feeds stream", route: "/feeds", status: "live" },
      { state: "Documents / Sheets", route: "/documents", status: "live" },
    ],
  },
  {
    group: "Record Detail",
    items: [
      { state: "Detail header actions", route: "/leads", status: "live" },
      { state: "Overview / Timeline / Related tabs", route: "/leads", status: "live" },
      { state: "Stage pipeline bar", route: "/deals", status: "live" },
      { state: "Notes panel", route: "/leads", status: "live" },
      { state: "Stage history", route: "/deals", status: "live" },
      { state: "Edit / Clone / Delete / Print", route: "/leads", status: "live" },
    ],
  },
  {
    group: "Forms",
    items: [
      { state: "Create form + sections", route: "/leads/new", status: "live" },
      { state: "Edit form", route: "/leads", status: "live" },
      { state: "Save / Save and New / Cancel", route: "/contacts/new", status: "live" },
      { state: "Required field validation", route: "/leads/new", status: "live" },
      { state: "Picklists, dates, checkboxes", route: "/deals/new", status: "live" },
      { state: "Line items editor component", route: "/quotes/new", status: "component" },
    ],
  },
  {
    group: "Modals & Wizards",
    items: [
      { state: "Compose Email (+ follow-up task)", route: "/", status: "live" },
      { state: "Log a Call (+ follow-up)", route: "/", status: "live" },
      { state: "Convert Lead wizard", route: "/leads", status: "live" },
      { state: "Manage Tags", route: "/leads", status: "live" },
      { state: "Change / Assign Owner", route: "/leads", status: "live" },
      { state: "Import wizard (3 steps)", route: "/leads", status: "live" },
      { state: "Upload Document + ACL", route: "/documents", status: "live" },
      { state: "Mass Create Tasks", route: "/leads", status: "live" },
      { state: "Confirm delete dialog", route: "/leads", status: "live" },
    ],
  },
  {
    group: "Analytics",
    items: [
      { state: "Home dashboard widgets", route: "/", status: "live" },
      { state: "Reports catalog", route: "/reports", status: "live" },
      { state: "Analytics charts", route: "/analytics", status: "live" },
    ],
  },
  {
    group: "Setup (admin)",
    items: [
      { state: "Setup home categories", route: "/setup", status: "live" },
      { state: "Modules and Fields", route: "/setup/modules-fields", status: "live" },
      { state: "Layouts / Buttons / Home / Detail", route: "/setup/layouts", status: "live" },
      { state: "Users / Roles / Profiles", route: "/setup/users", status: "live" },
      { state: "Sharing / Territories / Compliance", route: "/setup/sharing", status: "live" },
      { state: "Email / Booking / Cadences", route: "/setup/email", status: "live" },
      { state: "Pipelines + Stages", route: "/setup/stages", status: "live" },
      { state: "Workflows / Blueprint", route: "/setup/workflows", status: "live" },
      { state: "Recycle Bin / Audit / Storage", route: "/setup/audit-log", status: "live" },
    ],
  },
  {
    group: "Extra modules",
    items: [
      { state: "Visits empty", route: "/visits", status: "live" },
      { state: "Social brands", route: "/social", status: "live" },
      { state: "Projects", route: "/projects", status: "live" },
      { state: "SalesInbox", route: "/salesinbox", status: "live" },
      { state: "Forecasts", route: "/forecasts", status: "live" },
    ],
  },
];

export default function UiStatesPage() {
  const total = COVERAGE.reduce((s, g) => s + g.items.length, 0);
  const live = COVERAGE.reduce((s, g) => s + g.items.filter((i) => i.status === "live").length, 0);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">UI State Coverage Map</h1>
      <p className="mt-1 text-sm text-gray-500">
        Inventory of Zoho CRM screenshot patterns → implemented app states.{" "}
        <strong className="text-[var(--crm-blue)]">{live}/{total}</strong> primary patterns live.
        (920 PNGs collapse into these reusable UI patterns.)
      </p>

      <div className="mt-6 space-y-6">
        {COVERAGE.map((g) => (
          <div key={g.group}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">{g.group}</h2>
            <div className="overflow-hidden rounded border border-[var(--crm-border)] bg-white">
              <table className="crm-table text-xs">
                <thead>
                  <tr>
                    <th>UI State</th>
                    <th>Route</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {g.items.map((item) => (
                    <tr key={item.state}>
                      <td>{item.state}</td>
                      <td>
                        <Link href={item.route} className="text-[var(--crm-blue)]">
                          {item.route}
                        </Link>
                      </td>
                      <td>
                        <span
                          className={`rounded px-2 py-0.5 ${
                            item.status === "live"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
