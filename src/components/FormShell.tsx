"use client";

import Link from "next/link";
import { X } from "lucide-react";

type Props = {
  title: string;
  backHref: string;
  onSave: () => void;
  saving?: boolean;
  children: React.ReactNode;
};

export function FormShell({ title, backHref, onSave, saving, children }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--crm-border)] bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={18} />
          </Link>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={backHref} className="crm-btn crm-btn-secondary">
            Cancel
          </Link>
          <button onClick={onSave} disabled={saving} className="crm-btn crm-btn-primary disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl rounded border border-[var(--crm-border)] bg-white p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 border-b border-[var(--crm-border)] pb-2 text-sm font-semibold text-[var(--crm-blue)]">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

export function Field({
  label,
  required,
  children,
  full,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="crm-label">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}
