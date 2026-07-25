"use client";

const sheets = [
  { name: "Q3 Pipeline Analysis", module: "Deals", by: "Demo User", updated: "Jul 20, 2026" },
  { name: "Lead Source Breakdown", module: "Leads", by: "Demo User", updated: "Jul 18, 2026" },
  { name: "Account Health", module: "Accounts", by: "Sam Manager", updated: "Jul 10, 2026" },
];

export default function SheetsPage() {
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Sheets</h1>
          <p className="text-xs text-gray-500">Spreadsheet views linked to CRM modules</p>
        </div>
        <button className="crm-btn crm-btn-primary" onClick={() => alert("Open in Zoho Sheet — integration stub")}>
          Open in Sheet
        </button>
      </div>
      <div className="overflow-hidden rounded border border-[var(--crm-border)] bg-white">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Sheet Name</th>
              <th>Related Module</th>
              <th>Created By</th>
              <th>Last Modified</th>
            </tr>
          </thead>
          <tbody>
            {sheets.map((s) => (
              <tr key={s.name}>
                <td><button className="font-medium text-[var(--crm-blue)]" onClick={() => alert(`Opening ${s.name}`)}>{s.name}</button></td>
                <td>{s.module}</td>
                <td>{s.by}</td>
                <td>{s.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
