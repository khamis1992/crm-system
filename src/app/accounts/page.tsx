"use client";
import { GenericListPage } from "@/components/GenericModule";
import { accountsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericListPage config={accountsConfig} />;
}