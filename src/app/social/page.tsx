"use client";
import { EmptyState } from "@/components/ui/EmptyState";

export default function SocialPage() {
  return (
    <div className="h-full bg-white">
      <div className="border-b border-[var(--crm-border)] px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Social</h1>
        <button className="crm-btn crm-btn-primary" onClick={() => alert("Connect Facebook / Twitter / LinkedIn brand")}>
          Add Brand
        </button>
      </div>
      <EmptyState
        illustration="📣"
        title="Connect your social brands"
        description="Monitor mentions, respond to messages, and convert social interactions into leads. Add a brand to get started."
        actionLabel="Add Brand"
        onAction={() => alert("OAuth connect flow placeholder")}
      />
    </div>
  );
}
