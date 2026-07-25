"use client";
import { EmptyState } from "@/components/ui/EmptyState";

export default function VisitsPage() {
  return (
    <div className="h-full bg-white">
      <div className="border-b border-[var(--crm-border)] px-4 py-3">
        <h1 className="text-lg font-semibold">Visits</h1>
      </div>
      <EmptyState
        illustration="📍"
        title="No visits yet"
        description="Track field sales check-ins and customer site visits. Enable the Visits module to log GPS check-ins, photos, and notes from the mobile app."
        actionLabel="Learn about Visits"
        onAction={() => alert("Visits add-on — connect mobile check-in later.")}
      />
    </div>
  );
}
