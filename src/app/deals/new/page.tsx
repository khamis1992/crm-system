"use client";
import { GenericNewPage } from "@/components/GenericModule";
import { dealsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericNewPage config={dealsConfig} />;
}