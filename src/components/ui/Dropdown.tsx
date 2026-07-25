"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type MenuItem = {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  checked?: boolean;
};

export function Dropdown({
  trigger,
  items,
  align = "right",
  className,
}: {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={cn("relative inline-block", className)} ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 min-w-[200px] rounded border border-[var(--crm-border)] bg-white py-1 shadow-lg",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={i} className="my-1 border-t border-gray-100" />;
            }
            const content = (
              <div
                className={cn(
                  "flex cursor-pointer items-center gap-2 px-3 py-2 text-[13px]",
                  item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-blue-50",
                  item.disabled && "pointer-events-none opacity-40"
                )}
                onClick={() => {
                  if (item.disabled) return;
                  item.onClick?.();
                  setOpen(false);
                }}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.checked && <Check size={14} className="text-[var(--crm-blue)]" />}
              </div>
            );
            if (item.href) {
              return (
                <a key={i} href={item.href} className="block no-underline">
                  {content}
                </a>
              );
            }
            return <div key={i}>{content}</div>;
          })}
        </div>
      )}
    </div>
  );
}

export function SelectDropdown({
  value,
  options,
  onChange,
  placeholder = "-None-",
  className,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select className="crm-input appearance-none pr-8" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2 top-2.5 text-gray-400" />
    </div>
  );
}
