"use client";
import { GenericNewPage } from "@/components/GenericModule";
import { vendorsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericNewPage config={vendorsConfig} />;
}