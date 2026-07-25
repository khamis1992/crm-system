"use client";
import { GenericListPage } from "@/components/GenericModule";
import { salesOrdersConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericListPage config={salesOrdersConfig} />;
}