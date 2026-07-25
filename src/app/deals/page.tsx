"use client";
import { GenericListPage } from "@/components/GenericModule";
import { dealsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericListPage config={dealsConfig} />;
}