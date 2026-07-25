"use client";
import { GenericNewPage } from "@/components/GenericModule";
import { casesConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericNewPage config={casesConfig} />;
}