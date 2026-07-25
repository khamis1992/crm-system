"use client";
import { GenericListPage } from "@/components/GenericModule";
import { callsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericListPage config={callsConfig} />;
}