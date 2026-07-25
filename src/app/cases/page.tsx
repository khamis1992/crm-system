"use client";
import { GenericListPage } from "@/components/GenericModule";
import { casesConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericListPage config={casesConfig} />;
}