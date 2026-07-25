"use client";
import { GenericListPage } from "@/components/GenericModule";
import { vendorsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericListPage config={vendorsConfig} />;
}