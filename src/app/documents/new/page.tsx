"use client";
import { GenericNewPage } from "@/components/GenericModule";
import { documentsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericNewPage config={documentsConfig} />;
}