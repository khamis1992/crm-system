"use client";
import { GenericListPage } from "@/components/GenericModule";
import { purchaseOrdersConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericListPage config={purchaseOrdersConfig} />;
}