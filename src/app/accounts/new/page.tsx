"use client";
import { GenericNewPage } from "@/components/GenericModule";
import { accountsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericNewPage config={accountsConfig} />;
}