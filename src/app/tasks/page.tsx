"use client";
import { GenericListPage } from "@/components/GenericModule";
import { tasksConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericListPage config={tasksConfig} />;
}