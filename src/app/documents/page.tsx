"use client";
import { GenericListPage } from "@/components/GenericModule";
import { documentsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericListPage config={documentsConfig} />;
}