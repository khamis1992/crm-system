"use client";

import {
  Mail,
  Tag,
  Trash2,
  UserCog,
  CheckSquare,
  Printer,
  Download,
  RefreshCw,
  X,
} from "lucide-react";

type Props = {
  count: number;
  onClear: () => void;
  onEmail?: () => void;
  onTags?: () => void;
  onDelete?: () => void;
  onAssignOwner?: () => void;
  onCreateTasks?: () => void;
  onPrint?: () => void;
  onExport?: () => void;
  onMassConvert?: () => void;
  extra?: React.ReactNode;
};

export function BulkBar({
  count,
  onClear,
  onEmail,
  onTags,
  onDelete,
  onAssignOwner,
  onCreateTasks,
  onPrint,
  onExport,
  onMassConvert,
  extra,
}: Props) {
  if (count === 0) return null;
  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-blue-200 bg-blue-50 px-4 py-2">
      <span className="text-sm font-semibold text-[var(--crm-blue)]">{count} selected</span>
      <button onClick={onClear} className="rounded p-1 text-gray-500 hover:bg-white">
        <X size={14} />
      </button>
      <div className="mx-1 h-4 w-px bg-blue-200" />
      {onEmail && (
        <Btn onClick={onEmail} icon={<Mail size={13} />}>Send Email</Btn>
      )}
      {onTags && (
        <Btn onClick={onTags} icon={<Tag size={13} />}>Manage Tags</Btn>
      )}
      {onAssignOwner && (
        <Btn onClick={onAssignOwner} icon={<UserCog size={13} />}>Assign Owner</Btn>
      )}
      {onCreateTasks && (
        <Btn onClick={onCreateTasks} icon={<CheckSquare size={13} />}>Create Tasks</Btn>
      )}
      {onMassConvert && (
        <Btn onClick={onMassConvert} icon={<RefreshCw size={13} />}>Mass Convert</Btn>
      )}
      {onPrint && (
        <Btn onClick={onPrint} icon={<Printer size={13} />}>Print Preview</Btn>
      )}
      {onExport && (
        <Btn onClick={onExport} icon={<Download size={13} />}>Export</Btn>
      )}
      {onDelete && (
        <Btn onClick={onDelete} icon={<Trash2 size={13} />} danger>Delete</Btn>
      )}
      {extra}
    </div>
  );
}

function Btn({
  children,
  onClick,
  icon,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium ${
        danger
          ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
          : "border-blue-200 bg-white text-gray-700 hover:bg-white"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
