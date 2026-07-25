"use client";
import { GenericNewPage } from "@/components/GenericModule";
import { invoicesConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericNewPage config={invoicesConfig} />;
}