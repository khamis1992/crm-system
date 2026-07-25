"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  label: string;
  width?: string;
  render?: (row: T) => React.ReactNode;
  href?: (row: T) => string;
};

type Props<T extends { id: string }> = {
  columns: Column<T>[];
  rows: T[];
  selected?: Set<string>;
  onSelect?: (id: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  emptyText?: string;
  loading?: boolean;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  selected,
  onSelect,
  onSelectAll,
  emptyText = "No records found",
  loading,
}: Props<T>) {
  const allSelected = rows.length > 0 && selected && rows.every((r) => selected.has(r.id));

  return (
    <div className="overflow-auto border border-[var(--crm-border)] bg-white">
      <table className="crm-table">
        <thead>
          <tr>
            {onSelect && (
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={!!allSelected}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                />
              </th>
            )}
            {columns.map((c) => (
              <th key={c.key} style={c.width ? { width: c.width } : undefined}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={columns.length + (onSelect ? 1 : 0)} className="!py-12 text-center text-gray-400">
                Loading…
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + (onSelect ? 1 : 0)} className="!py-12 text-center text-gray-400">
                {emptyText}
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((row) => (
              <tr key={row.id} className={cn(selected?.has(row.id) && "bg-blue-50/50")}>
                {onSelect && (
                  <td>
                    <input
                      type="checkbox"
                      checked={selected?.has(row.id) || false}
                      onChange={(e) => onSelect(row.id, e.target.checked)}
                    />
                  </td>
                )}
                {columns.map((c) => {
                  const content = c.render
                    ? c.render(row)
                    : String((row as Record<string, unknown>)[c.key] ?? "—");
                  return (
                    <td key={c.key}>
                      {c.href ? (
                        <Link href={c.href(row)}>{content}</Link>
                      ) : (
                        content
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
