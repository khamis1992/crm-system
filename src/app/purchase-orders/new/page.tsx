"use client";
import { GenericNewPage } from "@/components/GenericModule";
import { purchaseOrdersConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericNewPage config={purchaseOrdersConfig} />;
}