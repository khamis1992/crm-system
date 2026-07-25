"use client";
import { GenericListPage } from "@/components/GenericModule";
import { invoicesConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericListPage config={invoicesConfig} />;
}