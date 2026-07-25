"use client";

import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  illustration = "📭",
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  illustration?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 text-5xl">{illustration}</div>
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-gray-500">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="crm-btn crm-btn-primary mt-5">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button onClick={onAction} className="crm-btn crm-btn-primary mt-5">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
