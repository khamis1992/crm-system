"use client";
import { GenericNewPage } from "@/components/GenericModule";
import { leadsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericNewPage config={leadsConfig} />;
}