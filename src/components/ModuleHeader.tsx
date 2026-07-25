"use client";

import Link from "next/link";
import {
  ChevronDown,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  count?: number;
  createHref?: string;
  createLabel?: string;
  view?: "list" | "kanban";
  onViewChange?: (v: "list" | "kanban") => void;
  onRefresh?: () => void;
  actions?: React.ReactNode;
};

export function ModuleHeader({
  title,
  count,
  createHref,
  createLabel = "Create",
  view,
  onViewChange,
  onRefresh,
  actions,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--crm-border)] bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-[var(--crm-text)]">
          {title}
          {count != null && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({count} Records)
            </span>
          )}
        </h1>
        <button className="crm-btn crm-btn-secondary !py-1 !text-xs">
          All {title} <ChevronDown size={12} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {view && onViewChange && (
          <div className="flex overflow-hidden rounded border border-[var(--crm-border)]">
            <button
              onClick={() => onViewChange("list")}
              className={cn(
                "px-2.5 py-1.5",
                view === "list" ? "bg-[var(--crm-blue-light)] text-[var(--crm-blue)]" : "bg-white text-gray-500"
              )}
            >
              <List size={14} />
            </button>
            <button
              onClick={() => onViewChange("kanban")}
              className={cn(
                "border-l border-[var(--crm-border)] px-2.5 py-1.5",
                view === "kanban" ? "bg-[var(--crm-blue-light)] text-[var(--crm-blue)]" : "bg-white text-gray-500"
              )}
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        )}
        {onRefresh && (
          <button onClick={onRefresh} className="crm-btn crm-btn-secondary !py-1.5">
            <RefreshCw size={14} />
          </button>
        )}
        <button className="crm-btn crm-btn-secondary !py-1.5">
          <Settings2 size={14} /> Actions <ChevronDown size={12} />
        </button>
        {actions}
        {createHref && (
          <Link href={createHref} className="crm-btn crm-btn-primary">
            <Plus size={14} /> {createLabel}
          </Link>
        )}
        <button className="crm-btn crm-btn-secondary !px-2">
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  );
}
