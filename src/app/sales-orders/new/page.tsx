"use client";
import { GenericNewPage } from "@/components/GenericModule";
import { salesOrdersConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericNewPage config={salesOrdersConfig} />;
}