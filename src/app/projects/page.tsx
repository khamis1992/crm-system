"use client";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProjectsPage() {
  return (
    <div className="h-full bg-white">
      <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-3">
        <h1 className="text-lg font-semibold">Projects</h1>
        <button className="crm-btn crm-btn-primary" onClick={() => alert("Create Project — connect Projects add-on")}>
          Create Project
        </button>
      </div>
      <EmptyState
        illustration="📁"
        title="No projects yet"
        description="Link deals to project delivery. Create milestones, assign tasks, and track budget against CRM opportunities."
        actionLabel="Create Project"
        onAction={() => alert("Project create form — integration stub")}
      />
    </div>
  );
}
